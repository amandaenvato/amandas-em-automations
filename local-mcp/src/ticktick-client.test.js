import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TickTickClient } from "./ticktick-client.js";

// Mock child_process.spawn
vi.mock("child_process", () => ({
  spawn: vi.fn(),
}));

// Mock fs.existsSync
vi.mock("fs", () => ({
  existsSync: vi.fn(),
}));

// Mock os.homedir
vi.mock("os", () => ({
  homedir: vi.fn(() => "/Users/test"),
}));

describe("TickTickClient", () => {
  let client;
  let mockSpawn;
  let mockExistsSync;
  let mockHomedir;

  beforeEach(async () => {
    const { spawn } = await import("child_process");
    const { existsSync } = await import("fs");
    const { homedir } = await import("os");

    mockSpawn = vi.mocked(spawn);
    mockExistsSync = vi.mocked(existsSync);
    mockHomedir = vi.mocked(homedir);

    client = new TickTickClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getDatabasePath", () => {
    it("should return correct database path", () => {
      const path = client.getDatabasePath();
      expect(path).toContain("Library/Group Containers/75TY9UT8AY.com.TickTick.task.mac/OSXCoreDataObjC.storedata");
      expect(path).toContain("/Users/test");
    });
  });

  describe("convertToMarkdownTable", () => {
    it("should convert SQLite output with headers to markdown table", () => {
      const sqliteOutput = `title          priority    project
-------------------  ----------  ----------
Task 1          High        Work
Task 2          Low         Personal`;

      const result = client.convertToMarkdownTable(sqliteOutput);
      expect(result).toContain("| title | priority | project |");
      expect(result).toContain("| Task 1 | High | Work |");
      expect(result).toContain("| Task 2 | Low | Personal |");
    });

    it("should handle empty output", () => {
      const result = client.convertToMarkdownTable("");
      expect(result).toBe("No results");
    });

    it("should handle output without headers", () => {
      const sqliteOutput = `Task 1    High    Work
Task 2    Low     Personal`;
      const result = client.convertToMarkdownTable(sqliteOutput);
      expect(result).toContain("Column 1");
      expect(result).toContain("Task 1");
    });

    it("should fallback to original output if parsing fails", () => {
      const sqliteOutput = "Single line without proper format";
      const result = client.convertToMarkdownTable(sqliteOutput);
      expect(result).toBe(sqliteOutput);
    });
  });

  describe("executeQueryAsMarkdown", () => {
    it("should return error when database does not exist", async () => {
      mockExistsSync.mockReturnValue(false);

      const result = await client.executeQueryAsMarkdown("SELECT * FROM tasks");

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("TickTick database not found");
      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it("should execute SQLite query and return markdown table", async () => {
      mockExistsSync.mockReturnValue(true);

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        stdin: { write: vi.fn(), end: vi.fn() },
        on: vi.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);

      let stdoutCallback;
      let closeCallback;

      mockProcess.stdout.on.mockImplementation((event, callback) => {
        if (event === "data") {
          stdoutCallback = callback;
        }
      });

      mockProcess.on.mockImplementation((event, callback) => {
        if (event === "close") {
          closeCallback = callback;
        }
      });

      const queryPromise = client.executeQueryAsMarkdown("SELECT * FROM tasks");

      // Simulate stdout data
      stdoutCallback(Buffer.from("title    priority\nTask 1  High\n"));

      // Simulate close event
      closeCallback(0);

      const result = await queryPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        "sqlite3",
        ["-column", "-header", expect.stringContaining("OSXCoreDataObjC.storedata")],
        { stdio: ["pipe", "pipe", "pipe"] }
      );
      expect(mockProcess.stdin.write).toHaveBeenCalledWith("SELECT * FROM tasks");
      expect(mockProcess.stdin.end).toHaveBeenCalled();
      expect(result.content[0].text).toContain("| title | priority |");
    });

    it("should handle SQLite errors", async () => {
      mockExistsSync.mockReturnValue(true);

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        stdin: { write: vi.fn(), end: vi.fn() },
        on: vi.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);

      let stderrCallback;
      let closeCallback;

      mockProcess.stderr.on.mockImplementation((event, callback) => {
        if (event === "data") {
          stderrCallback = callback;
        }
      });

      mockProcess.on.mockImplementation((event, callback) => {
        if (event === "close") {
          closeCallback = callback;
        }
      });

      const queryPromise = client.executeQueryAsMarkdown("INVALID QUERY");

      stderrCallback(Buffer.from("SQL error: no such table"));
      closeCallback(1);

      const result = await queryPromise;

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error executing SQLite query");
      expect(result.content[0].text).toContain("INVALID QUERY");
    });

    it("should handle spawn errors", async () => {
      mockExistsSync.mockReturnValue(true);

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        stdin: { write: vi.fn(), end: vi.fn() },
        on: vi.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);

      let errorCallback;

      mockProcess.on.mockImplementation((event, callback) => {
        if (event === "error") {
          errorCallback = callback;
        }
      });

      const queryPromise = client.executeQueryAsMarkdown("SELECT * FROM tasks");

      errorCallback(new Error("sqlite3: command not found"));

      const result = await queryPromise;

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Error executing SQLite query");
      expect(result.content[0].text).toContain("command not found");
    });
  });

  describe("getPendingTasks", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should execute query without filters", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getPendingTasks();

      simulateSuccess(mockProcess, "title    priority\nTask 1  High\n");

      const result = await queryPromise;

      expect(mockProcess.stdin.write).toHaveBeenCalled();
      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("WHERE t.ZDELETIONSTATUS = 0");
      expect(writtenQuery).toContain("AND t.ZSTATUS = 0");
      expect(writtenQuery).toContain("ORDER BY");
    });

    it("should filter by project", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getPendingTasks("Work");

      simulateSuccess(mockProcess, "title    priority\nTask 1  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("p.ZNAME = 'Work'");
    });

    it("should filter by priority string", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getPendingTasks(null, "high");

      simulateSuccess(mockProcess, "title    priority\nTask 1  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("t.ZPRIORITY = 3");
    });

    it("should filter by priority number", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getPendingTasks(null, 2);

      simulateSuccess(mockProcess, "title    priority\nTask 1  Medium\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("t.ZPRIORITY = 2");
    });

    it("should apply limit", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getPendingTasks(null, null, 10);

      simulateSuccess(mockProcess, "title    priority\nTask 1  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("LIMIT 10");
    });

    it("should escape single quotes in project name", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getPendingTasks("O'Brien's Project");

      simulateSuccess(mockProcess, "title    priority\nTask 1  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("p.ZNAME = 'O''Brien''s Project'");
    });
  });

  describe("getTaskSummary", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should execute summary query", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getTaskSummary();

      simulateSuccess(mockProcess, "total_tasks    incomplete    complete\n10    5    5\n");

      const result = await queryPromise;

      expect(mockProcess.stdin.write).toHaveBeenCalled();
      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("COUNT(*) as total_tasks");
      expect(writtenQuery).toContain("SUM(CASE WHEN ZSTATUS = 0");
      expect(result.content[0].text).toContain("total_tasks");
    });
  });

  describe("getTasksByProject", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should execute query without limit", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getTasksByProject();

      simulateSuccess(mockProcess, "project    total_tasks\nWork    10\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("GROUP BY p.ZNAME");
      expect(writtenQuery).not.toContain("LIMIT");
    });

    it("should apply limit when provided", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getTasksByProject(5);

      simulateSuccess(mockProcess, "project    total_tasks\nWork    10\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("LIMIT 5");
    });
  });

  describe("getAllTasks", () => {
    beforeEach(() => {
      mockExistsSync.mockReturnValue(true);
    });

    it("should execute query without filters", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getAllTasks();

      simulateSuccess(mockProcess, "title    status    priority\nTask 1  Incomplete  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("WHERE t.ZDELETIONSTATUS = 0");
      expect(writtenQuery).toContain("ORDER BY t.ZCREATIONDATE DESC");
    });

    it("should filter by project", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getAllTasks("Work");

      simulateSuccess(mockProcess, "title    status    priority\nTask 1  Incomplete  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("p.ZNAME = 'Work'");
    });

    it("should filter by status string", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getAllTasks(null, "incomplete");

      simulateSuccess(mockProcess, "title    status    priority\nTask 1  Incomplete  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("t.ZSTATUS = 0");
    });

    it("should filter by status number", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getAllTasks(null, 1);

      simulateSuccess(mockProcess, "title    status    priority\nTask 1  Complete  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("t.ZSTATUS = 1");
    });

    it("should apply limit", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getAllTasks(null, null, 20);

      simulateSuccess(mockProcess, "title    status    priority\nTask 1  Incomplete  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("LIMIT 20");
    });

    it("should combine all filters", async () => {
      const mockProcess = createMockProcess();
      mockSpawn.mockReturnValue(mockProcess);

      const queryPromise = client.getAllTasks("Work", "incomplete", 15);

      simulateSuccess(mockProcess, "title    status    priority\nTask 1  Incomplete  High\n");

      await queryPromise;

      const writtenQuery = mockProcess.stdin.write.mock.calls[0][0];
      expect(writtenQuery).toContain("p.ZNAME = 'Work'");
      expect(writtenQuery).toContain("t.ZSTATUS = 0");
      expect(writtenQuery).toContain("LIMIT 15");
    });
  });

  // Helper functions
  function createMockProcess() {
    const mockProcess = {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      stdin: { write: vi.fn(), end: vi.fn() },
      on: vi.fn(),
    };

    let stdoutCallback;
    let stderrCallback;
    let closeCallback;
    let errorCallback;

    mockProcess.stdout.on.mockImplementation((event, callback) => {
      if (event === "data") {
        stdoutCallback = callback;
      }
    });

    mockProcess.stderr.on.mockImplementation((event, callback) => {
      if (event === "data") {
        stderrCallback = callback;
      }
    });

    mockProcess.on.mockImplementation((event, callback) => {
      if (event === "close") {
        closeCallback = callback;
      }
      if (event === "error") {
        errorCallback = callback;
      }
    });

    // Store callbacks for later use
    mockProcess._stdoutCallback = () => stdoutCallback;
    mockProcess._stderrCallback = () => stderrCallback;
    mockProcess._closeCallback = () => closeCallback;
    mockProcess._errorCallback = () => errorCallback;

    return mockProcess;
  }

  function simulateSuccess(mockProcess, output) {
    const stdoutCallback = mockProcess._stdoutCallback();
    const closeCallback = mockProcess._closeCallback();

    if (stdoutCallback) {
      stdoutCallback(Buffer.from(output));
    }
    if (closeCallback) {
      closeCallback(0);
    }
  }
});


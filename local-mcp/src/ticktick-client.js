import { spawn } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export class TickTickClient {
  /**
   * Get the path to the TickTick database
   * @private
   */
  getDatabasePath() {
    const dbPath = join(
      homedir(),
      "Library/Group Containers/75TY9UT8AY.com.TickTick.task.mac/OSXCoreDataObjC.storedata"
    );
    return dbPath;
  }

  /**
   * Convert SQLite column output to markdown table format
   * @private
   */
  convertToMarkdownTable(output) {
    const lines = output.trim().split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      return "No results";
    }

    // Check if output has headers (first line is headers, second is separator)
    const hasHeaders = lines.length >= 2 && lines[1].match(/^[-:\s]+$/);

    if (hasHeaders) {
      // Parse headers by splitting on 2+ spaces (SQLite column format)
      const headerLine = lines[0];
      const headers = headerLine.split(/\s{2,}/).map((h) => h.trim()).filter((h) => h);

      // Extract data rows - also split on 2+ spaces
      const rows = lines.slice(2).map((line) => {
        // Split on 2+ spaces, but preserve empty cells
        const cells = line.split(/(\s{2,})/).filter((part, i) => i % 2 === 0);
        // Pad or trim to match header count
        const result = cells.map((cell) => cell.trim());
        while (result.length < headers.length) {
          result.push("");
        }
        return result.slice(0, headers.length);
      });

      // Build markdown table
      let markdown = "| " + headers.join(" | ") + " |\n";
      markdown += "| " + headers.map(() => "---").join(" | ") + " |\n";

      for (const row of rows) {
        // Ensure row has same number of cells as headers
        const paddedRow = [...row];
        while (paddedRow.length < headers.length) {
          paddedRow.push("");
        }
        markdown += "| " + paddedRow.slice(0, headers.length).join(" | ") + " |\n";
      }

      return markdown.trim();
    } else {
      // No headers, try to parse as space-separated columns
      const firstRow = lines[0].split(/\s{2,}/);
      if (firstRow.length > 1) {
        // Generate column headers based on position
        const headers = firstRow.map((_, i) => `Column ${i + 1}`);
        let markdown = "| " + headers.join(" | ") + " |\n";
        markdown += "| " + headers.map(() => "---").join(" | ") + " |\n";

        for (const line of lines) {
          const cells = line.split(/\s{2,}/);
          const paddedCells = [...cells];
          while (paddedCells.length < headers.length) {
            paddedCells.push("");
          }
          markdown += "| " + paddedCells.slice(0, headers.length).join(" | ") + " |\n";
        }

        return markdown.trim();
      }
    }

    return output; // Fallback to original output
  }

  /**
   * Execute a SQLite query and return the result as markdown table
   * @private
   */
  async executeQueryAsMarkdown(query) {
    const dbPath = this.getDatabasePath();

    if (!existsSync(dbPath)) {
      return {
        content: [
          {
            type: "text",
            text: `Error: TickTick database not found at ${dbPath}. Make sure TickTick is installed.`,
          },
        ],
        isError: true,
      };
    }

    try {
      return await new Promise((resolve, reject) => {
        const sqlite3 = spawn("sqlite3", ["-column", "-header", dbPath], {
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        sqlite3.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        sqlite3.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        sqlite3.on("close", (code) => {
          if (code !== 0 && stderr && !stdout) {
            resolve({
              content: [
                {
                  type: "text",
                  text: `Error executing SQLite query: ${stderr}\nQuery: ${query}`,
                },
              ],
              isError: true,
            });
          } else {
            const markdown = this.convertToMarkdownTable(stdout);
            resolve({
              content: [
                {
                  type: "text",
                  text: markdown || "Query executed successfully",
                },
              ],
            });
          }
        });

        sqlite3.on("error", (error) => {
          resolve({
            content: [
              {
                type: "text",
                text: `Error executing SQLite query: ${error.message}\nQuery: ${query}`,
              },
            ],
            isError: true,
          });
        });

        // Write query to stdin
        sqlite3.stdin.write(query);
        sqlite3.stdin.end();
      });
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing SQLite query: ${error.message}\nQuery: ${query}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Execute a SQLite query and return the result
   * @private
   */
  async executeQuery(query, format = "column") {
    const dbPath = this.getDatabasePath();

    if (!existsSync(dbPath)) {
      return {
        content: [
          {
            type: "text",
            text: `Error: TickTick database not found at ${dbPath}. Make sure TickTick is installed.`,
          },
        ],
        isError: true,
      };
    }

    try {
      return await new Promise((resolve, reject) => {
        const sqlite3 = spawn("sqlite3", [`-${format}`, dbPath], {
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        sqlite3.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        sqlite3.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        sqlite3.on("close", (code) => {
          if (code !== 0 && stderr && !stdout) {
            resolve({
              content: [
                {
                  type: "text",
                  text: `Error executing SQLite query: ${stderr}\nQuery: ${query}`,
                },
              ],
              isError: true,
            });
          } else {
            resolve({
              content: [
                {
                  type: "text",
                  text: stdout || "Query executed successfully",
                },
              ],
            });
          }
        });

        sqlite3.on("error", (error) => {
          resolve({
            content: [
              {
                type: "text",
                text: `Error executing SQLite query: ${error.message}\nQuery: ${query}`,
              },
            ],
            isError: true,
          });
        });

        // Write query to stdin
        sqlite3.stdin.write(query);
        sqlite3.stdin.end();
      });
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing SQLite query: ${error.message}\nQuery: ${query}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Get pending (incomplete) tasks from TickTick
   */
  async getPendingTasks(project = null, priority = null, limit = null) {
    let query = `
      SELECT
        t.ZTITLE as title,
        CASE
          WHEN t.ZPRIORITY = 0 THEN 'None'
          WHEN t.ZPRIORITY = 1 THEN 'Low'
          WHEN t.ZPRIORITY = 2 THEN 'Medium'
          WHEN t.ZPRIORITY = 3 THEN 'High'
          ELSE 'Unknown'
        END as priority,
        p.ZNAME as project,
        CASE
          WHEN t.ZENDDATE IS NOT NULL AND t.ZENDDATE > 0
          THEN datetime(t.ZENDDATE + 978307200, 'unixepoch', 'localtime')
          ELSE NULL
        END as due_date,
        datetime(t.ZCREATIONDATE + 978307200, 'unixepoch', 'localtime') as created_date
      FROM ZTTTASK t
      LEFT JOIN ZTTPROJECT p ON t.ZPROJECT = p.Z_PK
      WHERE t.ZDELETIONSTATUS = 0
        AND t.ZSTATUS = 0
    `;

    const conditions = [];

    if (project) {
      conditions.push(`p.ZNAME = '${project.replace(/'/g, "''")}'`);
    }

    if (priority !== null && priority !== undefined) {
      // Convert priority string to number if needed
      const priorityMap = { none: 0, low: 1, medium: 2, high: 3 };
      const priorityNum = typeof priority === "string"
        ? priorityMap[priority.toLowerCase()]
        : priority;
      if (priorityNum !== undefined) {
        conditions.push(`t.ZPRIORITY = ${priorityNum}`);
      }
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY ";

    // Order by priority (high first), then due date, then creation date
    query += "CASE WHEN t.ZPRIORITY = 3 THEN 0 WHEN t.ZPRIORITY = 2 THEN 1 WHEN t.ZPRIORITY = 1 THEN 2 ELSE 3 END, ";
    query += "CASE WHEN t.ZENDDATE IS NOT NULL AND t.ZENDDATE > 0 THEN t.ZENDDATE ELSE 999999999999 END ASC, ";
    query += "t.ZCREATIONDATE DESC";

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    return await this.executeQueryAsMarkdown(query);
  }

  /**
   * Get task summary statistics
   */
  async getTaskSummary() {
    const query = `
      SELECT
        COUNT(*) as total_tasks,
        SUM(CASE WHEN ZSTATUS = 0 THEN 1 ELSE 0 END) as incomplete,
        SUM(CASE WHEN ZSTATUS != 0 THEN 1 ELSE 0 END) as complete,
        SUM(CASE WHEN ZPRIORITY = 3 THEN 1 ELSE 0 END) as high_priority,
        SUM(CASE WHEN ZPRIORITY = 2 THEN 1 ELSE 0 END) as medium_priority,
        SUM(CASE WHEN ZPRIORITY = 1 THEN 1 ELSE 0 END) as low_priority
      FROM ZTTTASK
      WHERE ZDELETIONSTATUS = 0
    `;

    return await this.executeQueryAsMarkdown(query);
  }

  /**
   * Get tasks grouped by project
   */
  async getTasksByProject(limit = null) {
    let query = `
      SELECT
        p.ZNAME as project,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN t.ZSTATUS = 0 THEN 1 ELSE 0 END) as incomplete,
        SUM(CASE WHEN t.ZSTATUS != 0 THEN 1 ELSE 0 END) as complete
      FROM ZTTTASK t
      LEFT JOIN ZTTPROJECT p ON t.ZPROJECT = p.Z_PK
      WHERE t.ZDELETIONSTATUS = 0
      GROUP BY p.ZNAME
      ORDER BY incomplete DESC, total_tasks DESC
    `;

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    return await this.executeQueryAsMarkdown(query);
  }

  /**
   * Get all tasks (both complete and incomplete)
   */
  async getAllTasks(project = null, status = null, limit = null) {
    let query = `
      SELECT
        t.ZTITLE as title,
        CASE
          WHEN t.ZSTATUS = 0 THEN 'Incomplete'
          WHEN t.ZSTATUS = 1 THEN 'Complete'
          ELSE 'Other'
        END as status,
        CASE
          WHEN t.ZPRIORITY = 0 THEN 'None'
          WHEN t.ZPRIORITY = 1 THEN 'Low'
          WHEN t.ZPRIORITY = 2 THEN 'Medium'
          WHEN t.ZPRIORITY = 3 THEN 'High'
          ELSE 'Unknown'
        END as priority,
        p.ZNAME as project,
        CASE
          WHEN t.ZENDDATE IS NOT NULL AND t.ZENDDATE > 0
          THEN datetime(t.ZENDDATE + 978307200, 'unixepoch', 'localtime')
          ELSE NULL
        END as due_date
      FROM ZTTTASK t
      LEFT JOIN ZTTPROJECT p ON t.ZPROJECT = p.Z_PK
      WHERE t.ZDELETIONSTATUS = 0
    `;

    const conditions = [];

    if (project) {
      conditions.push(`p.ZNAME = '${project.replace(/'/g, "''")}'`);
    }

    if (status !== null && status !== undefined) {
      const statusMap = { incomplete: 0, complete: 1 };
      const statusNum = typeof status === "string"
        ? statusMap[status.toLowerCase()]
        : status;
      if (statusNum !== undefined) {
        conditions.push(`t.ZSTATUS = ${statusNum}`);
      }
    }

    if (conditions.length > 0) {
      query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY t.ZCREATIONDATE DESC";

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    return await this.executeQueryAsMarkdown(query);
  }
}


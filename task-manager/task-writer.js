const fs = require('fs');
const path = require('path');

/**
 * Add a task to the pending.jsonl file in the tasks directory
 * @param {string} tasksDir - Path to the tasks directory (e.g., './tasks')
 * @param {string} taskText - The task text to add
 * @param {object} options - Optional task properties
 * @param {string|null} options.dueDate - Due date in YYYY-MM-DD format
 * @param {string|null} options.from - Person the task is from (Mark, Bart, Nick)
 * @param {string|null} options.description - Task description
 */
function addTask(tasksDir, taskText, options = {}) {
  try {
    const tasksPath = path.isAbsolute(tasksDir) ? tasksDir : path.join(__dirname, tasksDir);

    // Ensure tasks directory exists
    if (!fs.existsSync(tasksPath)) {
      fs.mkdirSync(tasksPath, { recursive: true });
    }

    const task = {
      title: taskText,
      added: new Date().toISOString()
    };

    // Add optional fields
    if (options.dueDate) task.dueDate = options.dueDate;
    if (options.from) task.from = options.from;
    if (options.description) task.description = options.description;

    // Write to pending.jsonl in the tasks directory
    const tasksFile = path.join(tasksPath, 'pending.jsonl');
    fs.appendFileSync(tasksFile, JSON.stringify(task) + '\n', 'utf8');
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Read all tasks from pending.jsonl file in the tasks directory
 * @param {string} tasksDir - Path to the tasks directory (e.g., './tasks')
 * @returns {Array} Array of task objects
 */
function readTasks(tasksDir) {
  try {
    const tasksPath = path.isAbsolute(tasksDir) ? tasksDir : path.join(__dirname, tasksDir);

    // Ensure tasks directory exists
    if (!fs.existsSync(tasksPath)) {
      fs.mkdirSync(tasksPath, { recursive: true });
      return [];
    }

    // Read only from pending.jsonl (not completed.jsonl)
    const tasksFile = path.join(tasksPath, 'pending.jsonl');

    if (!fs.existsSync(tasksFile)) {
      return [];
    }

    const content = fs.readFileSync(tasksFile, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    return lines.map((line, index) => {
      try {
        const task = JSON.parse(line);
        task._lineNumber = index; // Store line number for updates
        return task;
      } catch (e) {
        console.error(`Error parsing line ${index + 1}:`, e);
        return null;
      }
    }).filter(task => task !== null);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}

/**
 * Update a task in the pending.jsonl file
 * @param {string} tasksDir - Path to the tasks directory (e.g., './tasks')
 * @param {number} lineNumber - Line number (0-indexed) of the task to update
 * @param {object} updates - Fields to update
 */
function updateTask(tasksDir, lineNumber, updates) {
  return new Promise((resolve, reject) => {
    try {
      const tasksPath = path.isAbsolute(tasksDir) ? tasksDir : path.join(__dirname, tasksDir);
      const tasksFile = path.join(tasksPath, 'pending.jsonl');

      if (!fs.existsSync(tasksFile)) {
        reject(new Error('Tasks file not found'));
        return;
      }

      const content = fs.readFileSync(tasksFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      if (lineNumber < 0 || lineNumber >= lines.length) {
        reject(new Error('Invalid line number'));
        return;
      }

      // Parse the task, update it, and stringify
      const task = JSON.parse(lines[lineNumber]);
      const updatedTask = { ...task, ...updates };
      delete updatedTask._lineNumber; // Remove internal property
      lines[lineNumber] = JSON.stringify(updatedTask);

      // Write back to file
      fs.writeFileSync(tasksFile, lines.join('\n') + '\n', 'utf8');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Mark a task as done or not done by moving it between files
 * @param {string} tasksDir - Path to the tasks directory (e.g., './tasks')
 * @param {number} lineNumber - Line number (0-indexed) of the task
 * @param {boolean} completed - Whether the task is completed (true = move to completed, false = move back to active)
 */
function markTaskDone(tasksDir, lineNumber, completed) {
  return new Promise((resolve, reject) => {
    try {
      const tasksPath = path.isAbsolute(tasksDir) ? tasksDir : path.join(__dirname, tasksDir);
      const pendingFile = path.join(tasksPath, 'pending.jsonl');
      const completedFile = path.join(tasksPath, 'completed.jsonl');

      if (!fs.existsSync(pendingFile)) {
        reject(new Error('Tasks file not found'));
        return;
      }

      // Read the task from the pending file
      const content = fs.readFileSync(pendingFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      if (lineNumber < 0 || lineNumber >= lines.length) {
        reject(new Error('Invalid line number'));
        return;
      }

      const task = JSON.parse(lines[lineNumber]);

      // Remove the task from pending file
      lines.splice(lineNumber, 1);
      fs.writeFileSync(pendingFile, lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf8');

      // Remove internal properties before saving
      delete task._lineNumber;
      delete task.completed;

      // Add to destination file
      if (completed) {
        // Move to completed file
        fs.appendFileSync(completedFile, JSON.stringify(task) + '\n', 'utf8');
      } else {
        // Move back to pending file
        fs.appendFileSync(pendingFile, JSON.stringify(task) + '\n', 'utf8');
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  addTask,
  readTasks,
  updateTask,
  markTaskDone
};


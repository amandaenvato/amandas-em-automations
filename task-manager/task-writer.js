const fs = require('fs');
const path = require('path');

/**
 * Add a task to the JSONL file
 * @param {string} filePath - Path to the tasks.jsonl file (in task-manager directory)
 * @param {string} taskText - The task text to add
 * @param {object} options - Optional task properties
 * @param {string|null} options.dueDate - Due date in YYYY-MM-DD format
 * @param {string|null} options.from - Person the task is from (Mark, Bart, Nick)
 * @param {string|null} options.description - Task description
 */
function addTask(filePath, taskText, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Get current date/time
      const now = new Date();
      const timestamp = now.toISOString();

      // Build task object
      const task = {
        title: taskText,
        added: timestamp,
        completed: false
      };

      // Add optional fields
      if (options.dueDate) {
        task.dueDate = options.dueDate;
      }
      if (options.from) {
        task.from = options.from;
      }
      if (options.description) {
        task.description = options.description;
      }

      // Convert to JSON line (single line JSON)
      const jsonLine = JSON.stringify(task) + '\n';

      // Append to file (create if doesn't exist)
      fs.appendFileSync(filePath, jsonLine, 'utf8');

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Read all tasks from the JSONL file
 * @param {string} filePath - Path to the tasks.jsonl file (in task-manager directory)
 * @returns {Array} Array of task objects
 */
function readTasks(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
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
 * Update a task in the JSONL file
 * @param {string} filePath - Path to the tasks.jsonl file (in task-manager directory)
 * @param {number} lineNumber - Line number (0-indexed) of the task to update
 * @param {object} updates - Fields to update
 */
function updateTask(filePath, lineNumber, updates) {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(filePath)) {
        reject(new Error('Tasks file not found'));
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
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
      fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Mark a task as done or not done
 * @param {string} filePath - Path to the tasks.jsonl file (in task-manager directory)
 * @param {number} lineNumber - Line number (0-indexed) of the task
 * @param {boolean} completed - Whether the task is completed
 */
function markTaskDone(filePath, lineNumber, completed) {
  return updateTask(filePath, lineNumber, { completed });
}

module.exports = {
  addTask,
  readTasks,
  updateTask,
  markTaskDone
};


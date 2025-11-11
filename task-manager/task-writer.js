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
  try {
    const task = {
      title: taskText,
      added: new Date().toISOString()
    };

    // Add optional fields
    if (options.dueDate) task.dueDate = options.dueDate;
    if (options.from) task.from = options.from;
    if (options.description) task.description = options.description;

    // Append to file (create if doesn't exist)
    fs.appendFileSync(filePath, JSON.stringify(task) + '\n', 'utf8');
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
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
 * Mark a task as done or not done by moving it between files
 * @param {string} filePath - Path to the tasks.jsonl file (in task-manager directory)
 * @param {number} lineNumber - Line number (0-indexed) of the task
 * @param {boolean} completed - Whether the task is completed (true = move to completed, false = move back to active)
 */
function markTaskDone(filePath, lineNumber, completed) {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.dirname(filePath);
      const completedFilePath = path.join(dir, 'completed-tasks.jsonl');

      if (!fs.existsSync(filePath)) {
        reject(new Error('Tasks file not found'));
        return;
      }

      // Read the task from the source file
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());

      if (lineNumber < 0 || lineNumber >= lines.length) {
        reject(new Error('Invalid line number'));
        return;
      }

      const task = JSON.parse(lines[lineNumber]);

      // Remove the task from source file
      lines.splice(lineNumber, 1);
      fs.writeFileSync(filePath, lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf8');

      // Remove internal properties before saving
      delete task._lineNumber;
      delete task.completed;

      // Add to destination file
      if (completed) {
        // Move to completed file
        fs.appendFileSync(completedFilePath, JSON.stringify(task) + '\n', 'utf8');
      } else {
        // Move back to active file
        fs.appendFileSync(filePath, JSON.stringify(task) + '\n', 'utf8');
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


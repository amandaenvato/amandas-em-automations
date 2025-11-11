const { ipcRenderer } = require('electron');
const taskWriter = require('./task-writer');
const path = require('path');

const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const fromInput = document.getElementById('from-input');
const descriptionInput = document.getElementById('description-input');
const status = document.getElementById('status');

// Action buttons and groups
const dueDateBtn = document.getElementById('due-date-btn');
const fromBtn = document.getElementById('from-btn');
const descriptionBtn = document.getElementById('description-btn');
const dueDateGroup = document.getElementById('due-date-group');
const fromGroup = document.getElementById('from-group');
const descriptionGroup = document.getElementById('description-group');
const expandedFields = document.getElementById('expanded-fields');
const dueDateLabel = document.getElementById('due-date-label');
const fromLabel = document.getElementById('from-label');

// Get the tasks file path (in the same directory as this file)
const tasksFile = path.join(__dirname, 'tasks.jsonl');

// Task list elements
const tasksList = document.getElementById('tasks-list');
const refreshBtn = document.getElementById('refresh-tasks');
let editingTaskId = null;

// Toggle field visibility
function toggleField(button, group, updateLabel) {
  const isVisible = group.style.display !== 'none';

  if (isVisible) {
    group.style.display = 'none';
    button.classList.remove('active');
  } else {
    group.style.display = 'flex';
    button.classList.add('active');
    expandedFields.style.display = 'flex';
  }

  updateExpandedFieldsVisibility();
  if (updateLabel) updateLabel();
}

function updateExpandedFieldsVisibility() {
  const hasVisibleFields =
    dueDateGroup.style.display !== 'none' ||
    fromGroup.style.display !== 'none' ||
    descriptionGroup.style.display !== 'none';

  expandedFields.style.display = hasVisibleFields ? 'flex' : 'none';
}

function updateDueDateLabel() {
  if (dueDateInput.value) {
    const date = new Date(dueDateInput.value + 'T00:00:00');
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dueDateLabel.textContent = formatted;
    dueDateBtn.classList.add('active');
  } else {
    dueDateLabel.textContent = 'Due date';
  }
}

function updateFromLabel() {
  if (fromInput.value) {
    fromLabel.textContent = fromInput.value;
    fromBtn.classList.add('active');
  } else {
    fromLabel.textContent = 'From';
  }
}

// Event listeners for action buttons
dueDateBtn.addEventListener('click', () => {
  toggleField(dueDateBtn, dueDateGroup, updateDueDateLabel);
  if (dueDateGroup.style.display !== 'none') {
    setTimeout(() => dueDateInput.focus(), 100);
  }
});

fromBtn.addEventListener('click', () => {
  toggleField(fromBtn, fromGroup, updateFromLabel);
  if (fromGroup.style.display !== 'none') {
    setTimeout(() => fromInput.focus(), 100);
  }
});

descriptionBtn.addEventListener('click', () => {
  toggleField(descriptionBtn, descriptionGroup);
  if (descriptionGroup.style.display !== 'none') {
    setTimeout(() => descriptionInput.focus(), 100);
  }
});

// Clear buttons
document.getElementById('clear-due-date').addEventListener('click', () => {
  dueDateInput.value = '';
  updateDueDateLabel();
  toggleField(dueDateBtn, dueDateGroup, updateDueDateLabel);
});

document.getElementById('clear-from').addEventListener('click', () => {
  fromInput.value = '';
  updateFromLabel();
  toggleField(fromBtn, fromGroup, updateFromLabel);
});

document.getElementById('clear-description').addEventListener('click', () => {
  descriptionInput.value = '';
  toggleField(descriptionBtn, descriptionGroup);
});

// Update labels when values change
dueDateInput.addEventListener('change', updateDueDateLabel);
fromInput.addEventListener('change', updateFromLabel);

descriptionInput.addEventListener('input', () => {
  if (descriptionInput.value.trim()) {
    descriptionBtn.classList.add('active');
  } else {
    descriptionBtn.classList.remove('active');
  }
});

// Load and render tasks
async function loadTasks() {
  try {
    const tasks = taskWriter.readTasks(tasksFile);
    renderTasks(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    tasksList.innerHTML = '<div class="empty-state">Error loading tasks</div>';
  }
}

function renderTasks(tasks) {
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="empty-state">No tasks yet</div>';
    return;
  }

  // Filter out completed tasks for now (or show them at bottom)
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  tasksList.innerHTML = '';

  // Render incomplete tasks
  incompleteTasks.forEach(task => {
    tasksList.appendChild(createTaskElement(task));
  });

  // Render completed tasks (if any)
  if (completedTasks.length > 0) {
    completedTasks.forEach(task => {
      tasksList.appendChild(createTaskElement(task));
    });
  }
}

function createTaskElement(task) {
  const item = document.createElement('div');
  item.className = `task-item ${task.completed ? 'completed' : ''}`;
  item.dataset.lineNumber = task._lineNumber;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', async () => {
    try {
      await taskWriter.markTaskDone(tasksFile, task._lineNumber, checkbox.checked);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      showStatus('Error updating task', 'error');
    }
  });

  const content = document.createElement('div');
  content.className = 'task-content';

  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate + 'T00:00:00');
    const formatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dueMeta = document.createElement('span');
    dueMeta.className = 'task-meta-item';
    dueMeta.innerHTML = `
      <svg viewBox="0 0 14 14" fill="none">
        <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2 5H12M5 2V5M9 2V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      ${formatted}
    `;
    meta.appendChild(dueMeta);
  }

  if (task.from) {
    const fromMeta = document.createElement('span');
    fromMeta.className = 'task-meta-item';
    fromMeta.innerHTML = `
      <svg viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="4" r="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M2 12C2 9.5 4.5 8 7 8C9.5 8 12 9.5 12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      ${task.from}
    `;
    meta.appendChild(fromMeta);
  }

  content.appendChild(title);
  if (meta.children.length > 0) {
    content.appendChild(meta);
  }

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'task-action-btn';
  editBtn.title = 'Edit';
  editBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8 2L12 6M2 12L2 12L3.5 11.5L8.5 6.5L7.5 5.5L2.5 10.5L2 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showEditForm(item, task);
  });

  actions.appendChild(editBtn);

  item.appendChild(checkbox);
  item.appendChild(content);
  item.appendChild(actions);

  return item;
}

// Navigation state
let currentTask = null;

function showEditForm(item, task) {
  if (editingTaskId === task._lineNumber) {
    return; // Already editing
  }

  editingTaskId = task._lineNumber;
  currentTask = task;

  // Hide main view, show edit view
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('edit-view').style.display = 'block';

  // Load task data into edit form
  loadTaskIntoEditForm(task);
}

function loadTaskIntoEditForm(task) {
  const titleInput = document.getElementById('edit-title-input');
  const dueDateInput = document.getElementById('edit-due-date-input');
  const fromInput = document.getElementById('edit-from-input');
  const descriptionInput = document.getElementById('edit-description-input');
  const dueDateLabel = document.getElementById('edit-due-date-label');
  const fromLabel = document.getElementById('edit-from-label');
  const dueDateBtn = document.getElementById('edit-due-date-btn');
  const fromBtn = document.getElementById('edit-from-btn');
  const descBtn = document.getElementById('edit-description-btn');
  const dueDateGroup = document.getElementById('edit-due-date-group');
  const fromGroup = document.getElementById('edit-from-group');
  const descGroup = document.getElementById('edit-description-group');
  const expandedFields = document.getElementById('edit-expanded-fields');

  // Reset form
  titleInput.value = task.title || '';
  dueDateInput.value = task.dueDate || '';
  fromInput.value = task.from || '';
  descriptionInput.value = task.description || '';

  // Reset UI state
  dueDateBtn.classList.remove('active');
  fromBtn.classList.remove('active');
  descBtn.classList.remove('active');
  dueDateGroup.style.display = 'none';
  fromGroup.style.display = 'none';
  descGroup.style.display = 'none';
  expandedFields.style.display = 'none';

  // Update labels and show fields if they have values
  if (task.dueDate) {
    dueDateLabel.textContent = formatDate(task.dueDate);
    dueDateBtn.classList.add('active');
    dueDateGroup.style.display = 'flex';
    expandedFields.style.display = 'flex';
  } else {
    dueDateLabel.textContent = 'Due date';
  }

  if (task.from) {
    fromLabel.textContent = task.from;
    fromBtn.classList.add('active');
    fromGroup.style.display = 'flex';
    expandedFields.style.display = 'flex';
  } else {
    fromLabel.textContent = 'From';
  }

  if (task.description) {
    descBtn.classList.add('active');
    descGroup.style.display = 'flex';
    expandedFields.style.display = 'flex';
  }

  titleInput.focus();
  titleInput.select();
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function goBack() {
  // Hide edit view, show main view
  document.getElementById('edit-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'block';
  editingTaskId = null;
  currentTask = null;
}

// Back button handler
document.getElementById('back-button').addEventListener('click', goBack);

// Edit form submission
document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById('edit-title-input');
  const dueDateInput = document.getElementById('edit-due-date-input');
  const fromInput = document.getElementById('edit-from-input');
  const descriptionInput = document.getElementById('edit-description-input');

  const newTitle = titleInput.value.trim();
  if (!newTitle) {
    showStatus('Task title cannot be empty', 'error');
    return;
  }

  try {
    const updates = {
      title: newTitle,
      dueDate: dueDateInput.value || null,
      from: fromInput.value || null,
      description: descriptionInput.value.trim() || null
    };
    await taskWriter.updateTask(tasksFile, currentTask._lineNumber, updates);
    goBack();
    await loadTasks();
    showStatus('Task updated', 'success');
  } catch (error) {
    console.error('Error updating task:', error);
    showStatus('Error updating task', 'error');
  }
});

// Edit form quick actions (same logic as main form)
setupEditFormActions();

function setupEditFormActions() {
  const dueDateBtn = document.getElementById('edit-due-date-btn');
  const fromBtn = document.getElementById('edit-from-btn');
  const descBtn = document.getElementById('edit-description-btn');
  const dueDateGroup = document.getElementById('edit-due-date-group');
  const fromGroup = document.getElementById('edit-from-group');
  const descGroup = document.getElementById('edit-description-group');
  const expandedFields = document.getElementById('edit-expanded-fields');
  const dueDateInput = document.getElementById('edit-due-date-input');
  const fromInput = document.getElementById('edit-from-input');
  const descriptionInput = document.getElementById('edit-description-input');
  const dueDateLabel = document.getElementById('edit-due-date-label');
  const fromLabel = document.getElementById('edit-from-label');

  function updateEditDueDateLabel() {
    if (dueDateInput.value) {
      dueDateLabel.textContent = formatDate(dueDateInput.value);
      dueDateBtn.classList.add('active');
    } else {
      dueDateLabel.textContent = 'Due date';
      dueDateBtn.classList.remove('active');
    }
  }

  function updateEditFromLabel() {
    if (fromInput.value) {
      fromLabel.textContent = fromInput.value;
      fromBtn.classList.add('active');
    } else {
      fromLabel.textContent = 'From';
      fromBtn.classList.remove('active');
    }
  }

  function toggleEditField(button, group, updateLabel) {
    const isVisible = group.style.display !== 'none';
    if (isVisible) {
      group.style.display = 'none';
      button.classList.remove('active');
    } else {
      group.style.display = 'flex';
      button.classList.add('active');
      expandedFields.style.display = 'flex';
    }
    updateExpandedFieldsVisibility();
    if (updateLabel) updateLabel();
  }

  function updateExpandedFieldsVisibility() {
    const hasVisibleFields =
      dueDateGroup.style.display !== 'none' ||
      fromGroup.style.display !== 'none' ||
      descGroup.style.display !== 'none';
    expandedFields.style.display = hasVisibleFields ? 'flex' : 'none';
  }

  dueDateBtn.addEventListener('click', () => {
    toggleEditField(dueDateBtn, dueDateGroup, updateEditDueDateLabel);
    if (dueDateGroup.style.display !== 'none') {
      setTimeout(() => dueDateInput.focus(), 100);
    }
  });

  fromBtn.addEventListener('click', () => {
    toggleEditField(fromBtn, fromGroup, updateEditFromLabel);
    if (fromGroup.style.display !== 'none') {
      setTimeout(() => fromInput.focus(), 100);
    }
  });

  descBtn.addEventListener('click', () => {
    toggleEditField(descBtn, descGroup);
    if (descGroup.style.display !== 'none') {
      setTimeout(() => descriptionInput.focus(), 100);
    }
  });

  document.getElementById('edit-clear-due-date').addEventListener('click', () => {
    dueDateInput.value = '';
    updateEditDueDateLabel();
    toggleEditField(dueDateBtn, dueDateGroup, updateEditDueDateLabel);
  });

  document.getElementById('edit-clear-from').addEventListener('click', () => {
    fromInput.value = '';
    updateEditFromLabel();
    toggleEditField(fromBtn, fromGroup, updateEditFromLabel);
  });

  document.getElementById('edit-clear-description').addEventListener('click', () => {
    descriptionInput.value = '';
    toggleEditField(descBtn, descGroup);
  });

  dueDateInput.addEventListener('change', updateEditDueDateLabel);
  fromInput.addEventListener('change', updateEditFromLabel);
  descriptionInput.addEventListener('input', () => {
    if (descriptionInput.value.trim()) {
      descBtn.classList.add('active');
    } else {
      descBtn.classList.remove('active');
    }
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const taskText = taskInput.value.trim();
  if (!taskText) {
    showStatus('Please enter a task', 'error');
    return;
  }

  const dueDate = dueDateInput.value || null;
  const from = fromInput.value || null;
  const description = descriptionInput.value.trim() || null;

  try {
    await taskWriter.addTask(tasksFile, taskText, {
      dueDate,
      from,
      description
    });
    showStatus('Task added!', 'success');

    // Clear form
    taskInput.value = '';
    dueDateInput.value = '';
    fromInput.value = '';
    descriptionInput.value = '';

    // Reset UI
    dueDateBtn.classList.remove('active');
    fromBtn.classList.remove('active');
    descriptionBtn.classList.remove('active');
    dueDateGroup.style.display = 'none';
    fromGroup.style.display = 'none';
    descriptionGroup.style.display = 'none';
    expandedFields.style.display = 'none';
    updateDueDateLabel();
    updateFromLabel();

    // Reload tasks
    await loadTasks();

    // Close window after a short delay
    setTimeout(() => {
      ipcRenderer.send('close-window');
    }, 500);
  } catch (error) {
    console.error('Error adding task:', error);
    showStatus('Error: ' + error.message, 'error');
  }
});

function showStatus(message, type = '') {
  status.textContent = message;
  status.className = 'status ' + type;

  if (type === 'success') {
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
    }, 2000);
  }
}

// Refresh button
refreshBtn.addEventListener('click', () => {
  loadTasks();
});

// Load tasks when window opens
loadTasks();

// Focus input when window opens
taskInput.focus();


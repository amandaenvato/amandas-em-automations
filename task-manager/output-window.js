const { ipcRenderer } = require('electron');

const outputContainer = document.getElementById('output-container');
const statusEl = document.getElementById('status');
const recipeNameEl = document.getElementById('recipe-name');

// Buffer for incomplete JSONL lines
let jsonlBuffer = '';

// Handle output data from main process
ipcRenderer.on('output-data', (event, data) => {
  // Clear empty state on first data
  if (outputContainer.querySelector('.empty-state')) {
    outputContainer.innerHTML = '';
  }

  // Handle JSONL format - each line is a JSON object
  jsonlBuffer += data;
  const lines = jsonlBuffer.split('\n');

  // Keep the last (potentially incomplete) line in buffer
  jsonlBuffer = lines.pop() || '';

  // Process each complete line
  lines.forEach(line => {
    if (line.trim()) {
      appendJsonLine(line.trim());
    }
  });
});

// Handle status updates
ipcRenderer.on('output-status', (event, status) => {
  statusEl.textContent = status.text;
  statusEl.className = `status ${status.type || 'running'}`;

  if (status.recipeName) {
    recipeNameEl.textContent = status.recipeName;
  }
});

// Handle completion
ipcRenderer.on('output-complete', (event, data) => {
  // Process any remaining buffer
  if (jsonlBuffer.trim()) {
    appendJsonLine(jsonlBuffer.trim());
    jsonlBuffer = '';
  }

  statusEl.textContent = 'Completed';
  statusEl.className = 'status completed';

  if (data.error) {
    appendError(data.error);
  }
});

// Handle errors
ipcRenderer.on('output-error', (event, error) => {
  statusEl.textContent = 'Error';
  statusEl.className = 'status error';
  appendError(error);
});

function appendJsonLine(line) {
  try {
    // Parse the JSON line
    const json = JSON.parse(line);
    const type = json.type;

    // Only display assistant type lines with full content
    if (type === 'assistant') {
      // Extract text from message.content array
      if (json.message && json.message.content && Array.isArray(json.message.content)) {
        const textParts = json.message.content
          .filter(item => item.type === 'text' && item.text)
          .map(item => item.text);

        if (textParts.length > 0) {
          const textDiv = document.createElement('div');
          textDiv.className = 'assistant-content';
          textDiv.textContent = textParts.join('');
          outputContainer.appendChild(textDiv);
          scrollToBottom();
        }
      }
    } else {
      // Show icon for other types
      const iconDiv = document.createElement('div');
      iconDiv.className = `type-icon type-${type}`;
      iconDiv.textContent = getTypeIcon(type);
      outputContainer.appendChild(iconDiv);
      scrollToBottom();
    }
  } catch (error) {
    // If parsing fails, display as plain text
    const pre = document.createElement('pre');
    pre.className = 'json-line error';
    pre.textContent = line;
    outputContainer.appendChild(pre);
    scrollToBottom();
  }
}

function getTypeIcon(type) {
  const icons = {
    'system': '⚙️',
    'user': '👤',
    'thinking': '💭',
    'tool_call': '🔧',
    'result': '✓'
  };
  return icons[type] || '•';
}

function appendError(error) {
  const line = document.createElement('div');
  line.className = 'output-line error';
  line.textContent = `❌ ${error}`;
  outputContainer.appendChild(line);
  scrollToBottom();
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}



# Electron Menubar App Architecture

## Best Practices for Menubar Apps

### 1. Window Positioning
**DO:**
- Let `menubar` library handle window positioning automatically
- It positions the window relative to the tray icon position
- Trust the library's built-in positioning logic

**DON'T:**
- Override window positioning with `setBounds()` or manual positioning
- Use `setVisibleOnAllWorkspaces()` unless absolutely necessary (can interfere)
- Manually calculate positions relative to tray icon

### 2. Context Menu (Right-Click Menu)
**DO:**
- Use `tray.setContextMenu()` - this is the standard Electron way
- Electron automatically handles right-click events when context menu is set
- Rebuild menu when state changes (like autorun toggle)

**DON'T:**
- Manually handle right-click events if using `setContextMenu()`
- Try to close menu programmatically (Electron handles this)
- Use `popUpContextMenu()` if you've already set a context menu

### 3. Click Handling
**DO:**
- Let menubar handle left-click (shows/hides window)
- Use context menu for right-click options
- Trust menubar's event handling

**DON'T:**
- Override menubar's click handlers
- Manually show/hide window on left-click (menubar does this)
- Mix `setContextMenu()` with manual right-click handlers

### 4. State Management
For simple apps (like this task manager):
- **No router needed** - Single HTML file with show/hide views works fine
- **No state manager needed** - Direct DOM manipulation is acceptable for small apps
- Use simple JavaScript state variables for UI state

For complex apps:
- **Router**: Consider React Router or similar if you have many pages
- **State Management**: Redux/MobX only if state becomes complex
- **IPC**: Use Electron's IPC for main/renderer communication

### 5. Code Structure

**Current Structure (Simple App):**
```
main.js          - Main process (Electron, menubar setup)
renderer.js      - Renderer process (DOM manipulation, UI logic)
index.html       - Single page with multiple views (show/hide)
task-writer.js   - Business logic (task file operations)
```

**For Complex Apps:**
```
main/
  index.js       - Main process entry
  menu.js        - Menu setup
  tray.js        - Tray icon setup
renderer/
  index.js       - Renderer entry
  router.js      - Client-side routing
  store/         - State management
  components/    - UI components
  views/         - Page views
```

## Common Patterns

### Pattern 1: Simple Menubar App (Current)
- Single HTML file
- Show/hide different views with CSS
- Direct DOM manipulation
- IPC for main/renderer communication

### Pattern 2: React Menubar App
- React components for UI
- React Router for navigation
- Redux/MobX for state
- IPC bridge for Electron APIs

### Pattern 3: Multi-Window App
- Separate BrowserWindow instances
- Window manager in main process
- IPC for window communication

## Key Takeaways

1. **Trust the menubar library** - It handles positioning and click events
2. **Keep it simple** - Don't add complexity unless needed
3. **Use standard Electron patterns** - `setContextMenu()` for right-click menus
4. **Separate concerns** - Main process for Electron APIs, renderer for UI

## Current Implementation

The refactored code follows these best practices:
- ✅ Uses `setContextMenu()` for right-click menu
- ✅ Lets menubar handle window positioning
- ✅ Doesn't override click handlers
- ✅ Simple structure without unnecessary complexity
- ✅ Proper separation of main/renderer processes


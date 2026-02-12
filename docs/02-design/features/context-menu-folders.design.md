---
template: design
version: 1.2
description: PDCA Design phase document (between Plan and Do) with Clean Architecture and Convention support
variables:
  - feature: context-menu-folders
  - date: 2026-02-12
  - author: warezio
  - project: obsidian-repo-nav
  - version: 1.0.0
---

# context-menu-folders Design Document

> **Summary**: Right-click context menu for folder nodes with Expand All and Collapse All actions
>
> **Project**: obsidian-repo-nav
> **Version**: 1.0.0
> **Author**: warezio
> **Date**: 2026-02-12
> **Status**: Draft
> **Planning Doc**: [context-menu-folders.plan.md](../../01-plan/features/context-menu-folders.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- Provide intuitive right-click context menu for folder navigation
- Enable bulk expand/collapse operations on folder hierarchies
- Maintain consistency with Obsidian's native UI patterns
- Ensure minimal performance impact with deep folder structures

### 1.2 Design Principles

- **Single Responsibility**: Context menu only handles expand/collapse actions
- **Extensible Architecture**: Menu structure allows future action additions
- **Obsidian Integration**: Use Obsidian's CSS variables and styling patterns

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      tree-view.ts                          │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ renderNode() │──▶│addContextMenu│  │ ContextMenu     │  │
│  └─────────────┘  └─────────────┘  │ (class)        │  │
│                                     └───────┬─────────┘  │
│                                             │              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   tree-builder.ts                    ││
│  │  (buildTree provides TreeNode structure)            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
User Right-Click → contextmenu Event → ContextMenu.show()
                                                        ↓
                                              Menu positioning calculation
                                                        ↓
                                              Menu rendering with actions
                                                        ↓
                    User clicks action → execute() → expandAll/collapseAll → refreshTree()
```

### 2.3 Dependencies

| Component | Depends on | Purpose |
|-----------|-----------|---------|
| ContextMenu | TreeNode (from tree-builder.ts) | Know which folder to operate on |
| ContextMenu | RepoNavPlugin (for settings) | Access tree data |
| tree-view.ts | ContextMenu class | Display menu on right-click |
| tree-view.ts | expandedPaths Set | Track expansion state |

---

## 3. Data Model

### 3.1 Entity Definition

```typescript
// Context menu action type
interface ContextMenuAction {
  label: string;           // Display text
  icon: string;            // Lucide icon name
  action: (path: string) => void;  // Click handler
}

// Context menu state
interface ContextMenuState {
  isVisible: boolean;
  targetPath: string;       // Folder path this menu is for
  position: { x: number; y: number };
  actions: ContextMenuAction[];
}
```

### 3.2 Entity Relationships

```
[TreeNode] 1 ──── N [ContextMenuAction]
   │
   └── contains folder path for action execution
```

---

## 4. API Specification

### 4.1 Internal API

| Method | Description |
|--------|-------------|
| `ContextMenu.show(x, y, folderPath, actions)` | Display menu at position |
| `ContextMenu.hide()` | Close the menu |
| `expandAll(folderPath: string)` | Expand folder and all descendants |
| `collapseAll(folderPath: string)` | Collapse folder and all descendants |

### 4.2 Detailed Specification

#### `expandAll(folderPath: string)`

**Purpose**: Recursively expand all descendant folders

**Algorithm**:
1. Get TreeNode for folderPath from tree data
2. Traverse all descendants recursively
3. Add each folder path to `expandedPaths` Set
4. Call `refreshTree()` to re-render

**Complexity**: O(n) where n = number of descendant folders

#### `collapseAll(folderPath: string)`

**Purpose**: Recursively collapse all descendant folders

**Algorithm**:
1. Get TreeNode for folderPath from tree data
2. Traverse all descendants recursively
3. Remove each folder path from `expandedPaths` Set
4. Call `refreshTree()` to re-render

**Complexity**: O(n) where n = number of descendant folders

---

## 5. UI/UX Design

### 5.1 Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  Repository Navigator                                    │
├────────────────────────────────────────────────────────────┤
│  📁 src/                                               │
│    📁 components/                         ┌─────────────┐│
│      📁 ui/           ─────────────────────▶│ Expand All  ││
│      📁 forms/                           │ Collapse All││
│    📁 lib/                               └─────────────┘│
│  📁 tests/                                                  │
└────────────────────────────────────────────────────────────┘
                              ▲
                        Context Menu (positioned at cursor)
```

### 5.2 User Flow

```
Tree View Display → Right-Click Folder → Context Menu Appears → Click Action → Tree Updates
```

### 5.3 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| ContextMenu | src/tree-view.ts (nested class) | Render and manage context menu |
| renderNode() | src/tree-view.ts | Add contextmenu event listener to folder nodes |
| expandAll() | src/tree-view.ts | Recursive expand logic |
| collapseAll() | src/tree-view.ts | Recursive collapse logic |

---

## 6. Error Handling

### 6.1 Edge Cases

| Case | Handling |
|------|----------|
| Menu positioned off-screen | Calculate boundaries, reposition if needed |
| Folder has no descendants | Disable or hide actions (show "No subfolders" or just empty actions) |
| User clicks outside menu | Close menu via document click listener |
| Rapid right-clicks | Close previous menu before showing new one |

### 6.2 Menu Positioning

```typescript
// Boundary detection
const menuWidth = 150;  // approximate width
const menuHeight = actions.length * 36;  // 36px per item

let x = clientX;
let y = clientY;

// Adjust if would go off right edge
if (x + menuWidth > window.innerWidth) {
  x = window.innerWidth - menuWidth - 8;
}

// Adjust if would go off bottom edge
if (y + menuHeight > window.innerHeight) {
  y = window.innerHeight - menuHeight - 8;
}
```

---

## 7. Security Considerations

- [ ] Input validation - folder path must be valid string from tree data
- [ ] Event propagation prevention - stop contextmenu from bubbling
- [ ] DOM cleanup - remove event listeners on view unload

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| Manual Testing | UI interactions | Manual testing in Obsidian |
| Unit Tests | expandAll/collapseAll logic | (Optional, not required for Obsidian plugin) |

### 8.2 Test Cases (Key)

- [ ] Happy path: Right-click folder → menu appears at correct position
- [ ] Happy path: Click "Expand All" → all descendants expand
- [ ] Happy path: Click "Collapse All" → all descendants collapse
- [ ] Edge case: Folder with no descendants → menu still appears
- [ ] Edge case: Menu near screen edge → repositions correctly
- [ ] Error scenario: Right-click file node → no menu appears
- [ ] Error scenario: Click outside menu → menu closes

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | ContextMenu UI, event handlers | `src/tree-view.ts` |
| **Application** | expandAll/collapseAll business logic | `src/tree-view.ts` |
| **Domain** | TreeNode type, folder path data | `src/types.ts` |
| **Infrastructure** | Obsidian API, DOM manipulation | `src/tree-view.ts` |

### 9.2 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| ContextMenu class | Presentation + Application | `src/tree-view.ts` |
| expandAll/collapseAll | Application | `src/tree-view.ts` |
| TreeNode | Domain | `src/types.ts` |
| Event listeners | Infrastructure | `src/tree-view.ts` |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Classes | PascalCase | `ContextMenu` |
| Functions | camelCase | `expandAll()`, `collapseAll()` |
| Constants | UPPER_SNAKE_CASE | `MENU_WIDTH`, `ITEM_HEIGHT` |
| Types/Interfaces | PascalCase | `ContextMenuAction`, `ContextMenuState` |
| Event handlers | camelCase with `on` prefix | `onContextMenu()`, `onMenuClick()` |

### 10.2 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Class naming | PascalCase for class, camelCase for methods |
| Event handling | Native browser events (contextmenu, click) |
| DOM manipulation | Obsidian's createElement helper |

### 10.3 Import Order

```typescript
// 1. External libraries (Obsidian)
import { ItemView, WorkspaceLeaf } from "obsidian";

// 2. Internal imports
import type RepoNavPlugin from "./main";
import { TreeNode, RepoNavSettings } from "./types";
import { buildTree } from "./tree-builder";
import { DEFAULT_SETTINGS, VIEW_TYPE_REPO_NAV } from "./constants";

// 3. Relative imports (none for single-file structure)
```

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── tree-view.ts         # Add: ContextMenu class, expandAll, collapseAll
├── types.ts            # Reference: TreeNode already defined
├── tree-builder.ts      # Reference: buildTree already provides tree
├── styles.css           # Add: context menu styles
└── constants.ts         # Reference: defaults unchanged
```

### 11.2 Implementation Order

1. [ ] Add context menu styles to `styles.css`
2. [ ] Create `ContextMenu` class in `tree-view.ts`
3. [ ] Implement `expandAll()` method in `tree-view.ts`
4. [ ] Implement `collapseAll()` method in `tree-view.ts`
5. [ ] Modify `renderNode()` to attach contextmenu event to folder nodes
6. [ ] Add document click listener to close menu on outside click
7. [ ] Test with various folder structures
8. [ ] Update documentation (CLAUDE.md, README.md)

### 11.3 Key Implementation Details

**ContextMenu Class Structure**:
```typescript
class ContextMenu {
  private menuEl: HTMLElement;
  private currentTarget: string;

  show(x: number, y: number, folderPath: string): void
  hide(): void
  private createActions(): ContextMenuAction[]
  private execute(action: ContextMenuAction): void
}
```

**Tree Traversal for Expand/Collapse**:
```typescript
// Helper to collect all descendant folder paths
function collectDescendantPaths(node: TreeNode): string[] {
  const paths: string[] = [];
  if (node.type === "directory") {
    paths.push(node.path);
    for (const child of node.children) {
      paths.push(...collectDescendantPaths(child));
    }
  }
  return paths;
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft | warezio |

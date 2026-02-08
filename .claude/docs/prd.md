# Product Requirements Document: Obsidian Repository Navigator

## 1. Overview

**Plugin Name:** Repository Navigator
**Plugin ID:** `obsidian-repo-nav`
**Version:** 0.1.0 (Initial Release)
**Platform:** Obsidian (Desktop & Mobile)
**License:** MIT

Repository Navigator is an Obsidian plugin that provides a dedicated sidebar tree view for navigating Git repositories. Unlike Obsidian's built-in file explorer, which displays every file in the vault, this plugin intelligently filters the tree to show only directories that contain Markdown (`.md`) files — including hidden directories (e.g., `.github`, `.obsidian`). Directories without any `.md` files are excluded from the tree, enabling focused and efficient navigation through large repository structures.

## 2. Problem Statement

When using Obsidian as a documentation viewer or note-taking tool within a Git repository, the built-in file explorer presents several pain points:

- **Noise from non-Markdown files:** Repositories contain source code, configuration files, build artifacts, and other assets that clutter the file tree and are irrelevant to Markdown-based workflows.
- **Hidden directories are invisible:** Obsidian's default explorer hides dot-prefixed directories (e.g., `.github/`), even when they contain useful `.md` files such as `CONTRIBUTING.md`, `PULL_REQUEST_TEMPLATE.md`, or workflow documentation.
- **No repository-aware navigation:** Obsidian treats the vault as a flat collection of notes. There is no built-in concept of navigating a repository's directory structure with a focus on documentation files.

## 3. Goals

- Provide a clean, focused tree view that shows only directories containing `.md` files.
- Include hidden/dot directories in the tree when they contain `.md` files.
- Allow users to quickly open any `.md` file from the tree with a single click.
- Minimize performance impact — the tree should load quickly even in large repositories (10,000+ files).
- Follow Obsidian plugin conventions and integrate naturally with the existing UI.

## 4. Non-Goals

- This plugin does **not** replace Obsidian's built-in file explorer.
- This plugin does **not** provide Git operations (commit, push, pull, diff, etc.).
- This plugin does **not** render or preview non-Markdown files.
- This plugin does **not** support multi-vault or cross-repository navigation in v0.1.0.

## 5. Target Users

| User Type | Description |
|-----------|-------------|
| **Developer** | Uses Obsidian to browse and edit documentation within Git repositories (monorepos, open-source projects). |
| **Technical Writer** | Maintains documentation scattered across repository directories and needs a focused view. |
| **Knowledge Worker** | Stores notes in a Git-backed Obsidian vault and wants cleaner navigation. |

## 6. Core Features

### 6.1 Filtered Directory Tree View

- Display a hierarchical tree of the vault's directory structure in a dedicated sidebar pane.
- **Include** a directory in the tree if and only if it (or any of its descendants) contains at least one `.md` file.
- **Include** hidden directories (directories starting with `.`) if they meet the above condition.
- **Exclude** directories that contain zero `.md` files at any level of nesting.
- Show `.md` files as leaf nodes within their parent directory.

### 6.2 File Opening

- Single-click on a `.md` file node opens it in the active editor pane.
- Modifier-click (Cmd/Ctrl + click) opens the file in a new pane/tab.

### 6.3 Tree Interaction

- Directories are collapsible/expandable.
- Expand/collapse state persists within a session.
- Provide a "Collapse All" button in the view header.
- Provide a "Refresh" button to re-scan the directory tree.

### 6.4 Sidebar Integration

- Register as a sidebar view accessible via:
  - The left sidebar ribbon icon.
  - The command palette: `Repository Navigator: Open tree view`.
- Use a recognizable icon (e.g., a folder-tree or repository icon).

### 6.5 Auto-Refresh

- Watch for file system changes (file creation, deletion, rename) and update the tree automatically.
- Debounce rapid changes to avoid excessive re-renders (300ms debounce).

## 7. Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **Show hidden directories** | Toggle | `true` | Include dot-prefixed directories in the tree. |
| **File extensions** | Text (comma-separated) | `.md` | File extensions to include (e.g., `.md,.mdx,.markdown`). |
| **Excluded directories** | Text (comma-separated) | `node_modules,.git` | Directories to always exclude from the tree. |
| **Sort order** | Dropdown | `Alphabetical (A-Z)` | Options: `Alphabetical (A-Z)`, `Alphabetical (Z-A)`, `Folders first`. |
| **Collapse on startup** | Toggle | `false` | Start with all directories collapsed. |

## 8. User Stories

### US-1: View Markdown-only tree
> As a developer, I want to see only directories that contain `.md` files so that I can navigate documentation without distraction from source code.

**Acceptance Criteria:**
- The sidebar tree shows only directories with `.md` files (direct or nested).
- Directories like `src/utils/` that contain no `.md` files are not displayed.
- Directories like `docs/api/` that contain `.md` files are displayed.

### US-2: Navigate hidden directories
> As a developer, I want to see hidden directories like `.github/` in the tree when they contain `.md` files, so that I can access templates and workflow documentation.

**Acceptance Criteria:**
- `.github/` appears in the tree if it contains `.md` files.
- `.git/` is excluded by default (via the excluded directories setting).
- Hidden directory visibility can be toggled in settings.

### US-3: Open a file from the tree
> As a user, I want to click on a `.md` file in the tree to open it in the editor.

**Acceptance Criteria:**
- Single-click opens the file in the active pane.
- Cmd/Ctrl + click opens in a new pane.
- The file opens at the top (scroll position 0).

### US-4: Refresh tree on file changes
> As a user, I want the tree to update automatically when files are added, deleted, or renamed.

**Acceptance Criteria:**
- Adding a new `.md` file to a previously empty directory causes that directory to appear in the tree.
- Deleting the last `.md` file from a directory causes that directory to disappear.
- File renames are reflected within 1 second.

### US-5: Customize included extensions
> As a user, I want to configure which file extensions are shown so that I can include `.mdx` or `.markdown` files.

**Acceptance Criteria:**
- Changing the file extensions setting updates the tree immediately.
- Multiple extensions can be specified as a comma-separated list.

## 9. Technical Architecture

### 9.1 Technology Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript |
| Build Tool | esbuild |
| Plugin API | Obsidian Plugin API (v1.0+) |
| UI Components | Obsidian native DOM API |
| File Watching | Obsidian Vault events (`create`, `delete`, `rename`, `modify`) |

### 9.2 Module Structure

```
src/
  main.ts              # Plugin entry point (onload/onunload)
  tree-view.ts         # ItemView subclass for the sidebar tree
  tree-builder.ts      # Directory scanning and tree construction logic
  tree-node.ts         # Tree node data model (directory/file)
  settings.ts          # Plugin settings tab and defaults
  constants.ts         # View type ID, default settings, icons
```

### 9.3 Tree Construction Algorithm

```
function buildTree(vaultRoot):
  for each entry in directory:
    if entry is excluded → skip
    if entry is directory:
      subtree = buildTree(entry)
      if subtree has any matching files → include directory
    if entry is file and extension matches → include file
  return tree
```

- Use recursive depth-first traversal.
- Cache the tree structure; rebuild only on file system events.
- Use `app.vault.getFiles()` and `app.vault.getAbstractFileByPath()` for file access.

### 9.4 Performance Considerations

- **Lazy rendering:** Only render visible nodes; collapsed subtrees are not rendered until expanded.
- **Debounced refresh:** File system events trigger tree rebuilds with 300ms debounce.
- **Incremental updates (future):** For v0.2.0, consider updating only the affected subtree instead of full rebuild.

## 10. UI/UX Specification

### 10.1 Sidebar Panel

- Appears in the left sidebar (user can drag to right sidebar).
- Header displays plugin name with collapse-all and refresh buttons.
- Tree occupies the remaining vertical space with native scrolling.

### 10.2 Tree Node Appearance

- **Directory node:** Folder icon + directory name. Chevron indicator for expand/collapse state.
- **File node:** Document icon + file name (without `.md` extension for cleaner display).
- Indentation: 16px per nesting level.
- Hover state: Subtle background highlight consistent with Obsidian's theme.
- Active state: Highlighted when the corresponding file is open in the editor.

### 10.3 Empty State

- When no `.md` files exist in the vault, display: "No Markdown files found in this vault."

## 11. Release Plan

| Version | Scope |
|---------|-------|
| **v0.1.0** | Core tree view, file opening, settings, auto-refresh, hidden directory support. |
| **v0.2.0** | Incremental tree updates, drag-and-drop reordering, search/filter within tree. |
| **v0.3.0** | Bookmarked directories, file preview on hover, keyboard navigation. |
| **v1.0.0** | Community plugin submission, full documentation, localization (EN/KO/JA). |

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Tree build time (1,000 files) | < 100ms |
| Tree build time (10,000 files) | < 500ms |
| Memory overhead | < 10MB additional |
| User satisfaction (GitHub stars within 3 months) | 50+ |
| Bug reports (critical) within first month | 0 |

## 13. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should the tree support drag-and-drop file moving? | Deferred to v0.2.0 |
| 2 | Should symlinks be followed when building the tree? | Deferred — need to evaluate circular reference risk |
| 3 | Should the plugin integrate with Obsidian's search to highlight matching files in the tree? | Under consideration for v0.3.0 |
| 4 | Should mobile (Obsidian Mobile) be a first-class target? | Yes — basic support in v0.1.0, full support in v1.0.0 |

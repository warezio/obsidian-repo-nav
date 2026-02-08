# Plan: Obsidian Repository Navigator v0.1.0

> **Feature:** obsidian-repo-nav
> **Created:** 2026-02-07
> **Status:** In Progress
> **PRD Reference:** [.claude/docs/prd.md](../../../.claude/docs/prd.md)

## 1. Objective

Build an Obsidian plugin that provides a sidebar tree view showing only directories containing Markdown files (including hidden directories), enabling focused documentation navigation within Git repositories.

## 2. Scope (v0.1.0)

### In Scope

| # | Feature | Priority | PRD Section |
|---|---------|----------|-------------|
| 1 | Filtered directory tree view (show only dirs with `.md` files) | P0 - Must Have | 6.1 |
| 2 | Hidden directory inclusion (dot-prefixed dirs) | P0 - Must Have | 6.1 |
| 3 | Single-click file opening in active pane | P0 - Must Have | 6.2 |
| 4 | Modifier-click to open in new pane | P1 - Should Have | 6.2 |
| 5 | Collapsible/expandable directory nodes | P0 - Must Have | 6.3 |
| 6 | Collapse All / Refresh header buttons | P1 - Should Have | 6.3 |
| 7 | Sidebar ribbon icon + command palette registration | P0 - Must Have | 6.4 |
| 8 | Auto-refresh on file system changes (debounced) | P1 - Should Have | 6.5 |
| 9 | Settings tab (hidden dirs, extensions, exclusions, sort, collapse) | P1 - Should Have | 7 |

### Out of Scope

- Git operations (commit, push, pull, diff)
- Non-Markdown file rendering
- Multi-vault / cross-repository navigation
- Drag-and-drop file moving (v0.2.0)
- Search/filter within tree (v0.2.0)
- Keyboard navigation (v0.3.0)

## 3. Technical Plan

### 3.1 Project Setup

| Item | Value |
|------|-------|
| Language | TypeScript |
| Build Tool | esbuild |
| Min Obsidian API | 1.0.0 |
| Plugin ID | `obsidian-repo-nav` |
| Entry Point | `src/main.ts` |

**Required Files:**
- `package.json` — Dependencies: `obsidian`, `@types/node`, `typescript`, `esbuild`
- `manifest.json` — Obsidian plugin manifest
- `tsconfig.json` — TypeScript configuration
- `esbuild.config.mjs` — Build script
- `.editorconfig` — Code style consistency

### 3.2 Module Architecture

```
src/
  main.ts              # Plugin lifecycle (onload/onunload), registers view + commands
  tree-view.ts         # ItemView subclass — renders the sidebar tree UI
  tree-builder.ts      # Scans vault, builds filtered tree data structure
  tree-node.ts         # TreeNode interface/class (directory or file)
  settings.ts          # PluginSettingTab subclass + default settings
  constants.ts         # VIEW_TYPE, DEFAULT_SETTINGS, ICONS
```

### 3.3 Key Data Structures

```typescript
interface TreeNode {
  name: string;           // Display name
  path: string;           // Full vault-relative path
  type: 'directory' | 'file';
  children: TreeNode[];   // Sorted child nodes (dirs first, then files)
  expanded: boolean;      // UI state
}

interface RepoNavSettings {
  showHiddenDirs: boolean;       // default: true
  fileExtensions: string;        // default: ".md"
  excludedDirs: string;          // default: "node_modules,.git"
  sortOrder: 'az' | 'za' | 'folders-first';  // default: 'folders-first'
  collapseOnStartup: boolean;    // default: false
}
```

### 3.4 Core Algorithm — Filtered Tree Construction

1. Get all files from vault using `app.vault.getFiles()`
2. Filter files by configured extensions (default `.md`)
3. Build a directory set: collect all ancestor directories of matched files
4. Exclude directories matching the exclusion list
5. If `showHiddenDirs` is off, exclude dot-prefixed directories
6. Construct tree from the filtered directory set + matched files
7. Sort according to configured sort order

**Performance target:** < 100ms for 1,000 files, < 500ms for 10,000 files.

### 3.5 Vault Event Handling

| Vault Event | Action |
|-------------|--------|
| `create` | Rebuild tree (debounced 300ms) |
| `delete` | Rebuild tree (debounced 300ms) |
| `rename` | Rebuild tree (debounced 300ms) |

Use `app.vault.on('create' | 'delete' | 'rename', callback)` with a shared debounce timer.

### 3.6 UI Rendering Strategy

- Use Obsidian's native DOM API (no React/Vue/Svelte)
- Render tree nodes as nested `<div>` elements with CSS classes
- Lazy render: only render children of expanded directories
- Active file highlighting: listen to `app.workspace.on('active-leaf-change')`
- Theme-compatible: use Obsidian CSS variables for colors, spacing, hover states

## 4. Implementation Order

| Phase | Task | Dependencies | Estimated Effort |
|-------|------|-------------|-----------------|
| **Phase 1** | Project scaffolding (package.json, manifest.json, tsconfig, esbuild) | None | Small |
| **Phase 2** | Plugin entry point (`main.ts`) with empty sidebar view registration | Phase 1 | Small |
| **Phase 3** | Settings tab (`settings.ts`, `constants.ts`) | Phase 2 | Small |
| **Phase 4** | Tree data model (`tree-node.ts`) + builder (`tree-builder.ts`) | Phase 2 | Medium |
| **Phase 5** | Tree view rendering (`tree-view.ts`) — static tree display | Phase 4 | Medium |
| **Phase 6** | File opening — click handlers for single-click and modifier-click | Phase 5 | Small |
| **Phase 7** | Auto-refresh — vault event listeners with debounce | Phase 5 | Small |
| **Phase 8** | UI polish — active file highlight, collapse-all, refresh button, empty state | Phase 6, 7 | Small |
| **Phase 9** | Testing — manual QA on sample repos (small, large, hidden dirs) | Phase 8 | Medium |

## 5. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Hidden directory access blocked by Obsidian API | High | Medium | Use `app.vault.adapter.list()` which can access hidden dirs, or fallback to Node.js `fs` on desktop |
| Performance degradation on very large repos (50k+ files) | Medium | Low | Implement lazy rendering + debounced rebuild; defer incremental updates to v0.2.0 |
| Obsidian API breaking changes | Low | Low | Pin minimum API version in manifest; test against current stable release |
| CSS conflicts with other plugins | Low | Medium | Scope all CSS classes with `repo-nav-` prefix |

## 6. Dependencies

| Dependency | Type | Version |
|------------|------|---------|
| `obsidian` | Dev (type definitions) | latest |
| `@types/node` | Dev | latest |
| `typescript` | Dev | ^5.0 |
| `esbuild` | Dev | ^0.20 |

No runtime dependencies — the plugin uses only the Obsidian API.

## 7. Success Criteria

- [ ] Tree view displays in sidebar with ribbon icon and command palette entry
- [ ] Only directories containing `.md` files (directly or via descendants) are shown
- [ ] Hidden directories (e.g., `.github/`) appear when they contain `.md` files
- [ ] `.git/` and `node_modules/` are excluded by default
- [ ] Clicking a file opens it in the editor
- [ ] Tree auto-refreshes on file create/delete/rename
- [ ] Settings tab allows configuration of all 5 settings
- [ ] Plugin loads in < 200ms on a vault with 1,000 files
- [ ] No console errors during normal operation

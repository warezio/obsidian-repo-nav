---
template: plan
version: 1.2
description: PDCA Plan phase document with Architecture and Convention considerations
variables:
  - feature: context-menu-folders
  - date: 2026-02-12
  - author: warezio
  - project: obsidian-repo-nav
  - version: 1.0.0
---

# context-menu-folders Planning Document

> **Summary**: Add right-click context menu for folders with "Expand All" and "Collapse All" options
>
> **Project**: obsidian-repo-nav
> **Version**: 1.0.0
> **Author**: warezio
> **Date**: 2026-02-12
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Add a context menu feature that appears when users right-click on folder nodes in the tree view. The menu provides "Expand All" and "Collapse All" options to quickly expand or collapse all child folders under the selected folder.

### 1.2 Background

Currently, users can only expand/collapse folders by clicking on them individually. For repositories with deep directory structures, expanding or collapsing multiple folders is time-consuming. A context menu with bulk operations will improve user experience for navigating complex folder hierarchies.

### 1.3 Related Documents

- Requirements: User request for context menu on right-click
- References: Obsidian API documentation for context menus

---

## 2. Scope

### 2.1 In Scope

- [ ] Right-click context menu on folder nodes only (not on file nodes)
- [ ] "Expand All" option - expands the selected folder and all its descendants
- [ ] "Collapse All" option - collapses the selected folder and all its descendants
- [ ] Menu styling consistent with Obsidian's native context menus
- [ ] Keyboard shortcut compatibility (Escape to close menu)

### 2.2 Out of Scope

- Context menu for file nodes (may be added later)
- Custom menu items beyond Expand/Collapse All
- Nested submenus
- Menu customization/settings

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Right-click on folder node opens context menu | High | Pending |
| FR-02 | Context menu displays "Expand All" option | High | Pending |
| FR-03 | Context menu displays "Collapse All" option | High | Pending |
| FR-04 | "Expand All" expands folder and all descendant folders | High | Pending |
| FR-05 | "Collapse All" collapses folder and all descendant folders | High | Pending |
| FR-06 | Clicking outside menu closes it | Medium | Pending |
| FR-07 | No context menu appears on file nodes | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Menu appears within 100ms of right-click | Manual testing |
| Accessibility | Keyboard navigation support (Escape to close) | Manual testing |
| UI Consistency | Matches Obsidian native menu styling | Visual inspection |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] All functional requirements implemented
- [ ] Context menu works on all folder types (hidden, normal, nested)
- [ ] Menu positioning correctly aligns with cursor
- [ ] Documentation updated (CLAUDE.md, README.md)

### 4.2 Quality Criteria

- [ ] No TypeScript errors
- [ ] Build succeeds without warnings
- [ ] Manual testing on sample repository structure

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Obsidian API doesn't support custom context menus | High | Low | Use native DOM contextmenu event; create custom menu UI |
| Menu positioning issues on edge of screen | Medium | Medium | Implement boundary detection and repositioning |
| Performance issues with deep folder structures | Low | Low | Use efficient tree traversal algorithm |
| Conflict with Obsidian's native context menu | Medium | Medium | Test and prevent propagation if needed |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | |
| **Obsidian Plugin** | Single `src/` directory, flat structure, Obsidian API | Obsidian plugins | **Selected** |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Menu UI | Obsidian Menu API / Custom DOM element | Custom DOM element | Obsidian doesn't expose Menu API; custom gives more control |
| Event Handling | contextmenu event / mousedown+right button detection | contextmenu event | Native browser event, simpler |
| State Management | Local to tree-view / Shared via plugin | Local to tree-view | Menu is view-specific, no need for shared state |
| Tree Traversal | Recursive DFS / Iterative BFS | Recursive DFS | Simpler code for expand/collapse operations |

### 6.3 Clean Architecture Approach

```
Selected Level: Obsidian Plugin

Folder Structure Preview:
┌─────────────────────────────────────────────────────┐
│ src/                                                │
│   main.ts              # Plugin entry point          │
│   tree-view.ts         # ItemView sidebar rendering   │
│                          + addContextMenu()          │
│                          + expandAll(path)          │
│                          + collapseAll(path)        │
│   tree-builder.ts      # Tree construction logic      │
│   types.ts             # TypeScript interfaces         │
│   settings.ts          # Plugin settings tab          │
│   constants.ts         # View type and defaults      │
│   styles.css           # Plugin stylesheet          │
│                          + context menu styles      │
└─────────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] `CONVENTIONS.md` exists at project root
- [x] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | camelCase for functions, PascalCase for classes | Menu class naming | Medium |
| **Folder structure** | Flat `src/` directory | N/A | - |
| **Event handling** | Direct listeners in tree-view | Menu event patterns | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| N/A | This feature doesn't require environment variables | - | - |

### 7.4 Pipeline Integration

Not using 9-phase Development Pipeline for this Obsidian plugin feature.

---

## 8. Next Steps

1. [ ] Write design document (`context-menu-folders.design.md`)
2. [ ] Team review and approval
3. [ ] Start implementation

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial draft | warezio |

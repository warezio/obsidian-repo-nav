# Plan: Hidden File Editing Support

## Feature Name
`hidden-file-editing`

## Problem Statement

Hidden directory files (e.g., `.github/README.md`) are correctly displayed in the tree view, but cannot be edited. When clicked, they fall back to a read-only `HiddenFileView`.

### Root Cause

1. `vault.getAbstractFileByPath()` returns `null` for hidden dir files (Obsidian excludes hidden dirs from its vault index)
2. `ensureVaultFile()` attempts to register the file via `vault.create()`, but this fails because the file already exists on disk
3. When registration fails, the fallback `HiddenFileView` is read-only

### Current Flow (broken)
```
Click file → vault.getAbstractFileByPath() → null
  → openHiddenFile() → ensureVaultFile()
    → vault.createFolder() + vault.create() → FAILS (file already exists)
    → fallback: HiddenFileView (read-only)
```

## Research: obsidian-show-hidden-files Plugin Analysis

Analyzed [polyipseity/obsidian-show-hidden-files](https://github.com/polyipseity/obsidian-show-hidden-files) source code (`src/show-hidden-files.ts`) to understand how it registers hidden files into Obsidian's vault index.

### Key Discovery: Obsidian Internal Reconciliation API

Obsidian's `DataAdapter` has undocumented internal methods for vault index management:

| Method | Platform | Purpose |
|--------|----------|---------|
| `adapter.reconcileFileInternal(realPath, path)` | Desktop (optional) | Register file into vault index |
| `adapter.reconcileFileChanged(realPath, path, stat)` | Mobile (optional) | Register file into vault index |
| `adapter.reconcileFolderCreation(realPath, path)` | Both | Register folder into vault index |
| `adapter.reconcileDeletion(realPath, path)` | Both | Remove from vault index |
| `adapter.getRealPath(path)` | Both | Convert vault path to real filesystem path |
| `adapter.getFullRealPath(realPath)` | Both | Get full absolute path |

### How showFile() Works (from show-hidden-files plugin)

```typescript
async function showFile(context, path) {
  const adapter = context.app.vault.adapter; // cast to any
  const realPath = adapter.getRealPath(path);

  if ("reconcileFileInternal" in adapter) {
    // Desktop path
    await adapter.reconcileFileInternal(realPath, path);
  } else if ("reconcileFileChanged" in adapter) {
    // Mobile path
    const stat = await adapter.fs.stat(adapter.getFullRealPath(realPath));
    if (stat.type === "file") {
      adapter.reconcileFileChanged(realPath, path, stat);
    } else if (stat.type === "directory") {
      await adapter.reconcileFolderCreation(realPath, path);
    }
  }
}
```

After calling `reconcileFileInternal`/`reconcileFileChanged`, the file is registered in Obsidian's vault index and `vault.getAbstractFileByPath()` returns a valid `TFile`. This means the file can be opened in Obsidian's native `MarkdownView` (fully editable).

## Proposed Solution

Replace `ensureVaultFile()` with the internal reconciliation API approach. No separate editor needed — files will open in Obsidian's native MarkdownView.

### Target Flow (fixed)
```
Click file → vault.getAbstractFileByPath() → null
  → openHiddenFile() → ensureVaultFile()
    → reconcileFolderCreation() for each parent folder
    → reconcileFileInternal() / reconcileFileChanged() for the file
    → vault.getAbstractFileByPath() → TFile ✓
    → leaf.openFile(file) → Native MarkdownView (editable) ✓
```

## Implementation Plan

### 1. Replace `ensureVaultFile()` in `src/tree-view.ts`

Replace the current `vault.createFolder()` + `vault.create()` approach with:

```typescript
private async ensureVaultFile(filePath: string): Promise<TFile | null> {
  const existing = this.app.vault.getAbstractFileByPath(filePath);
  if (existing instanceof TFile) return existing;

  try {
    const adapter = this.app.vault.adapter as any;
    const realPath = adapter.getRealPath(filePath);

    // 1. Register parent folders into vault index
    const segments = filePath.split("/");
    segments.pop(); // remove filename
    let folderPath = "";
    for (const segment of segments) {
      folderPath = folderPath ? folderPath + "/" + segment : segment;
      if (!this.app.vault.getAbstractFileByPath(folderPath)) {
        const folderRealPath = adapter.getRealPath(folderPath);
        await adapter.reconcileFolderCreation(folderRealPath, folderPath);
      }
    }

    // 2. Register file into vault index
    if (typeof adapter.reconcileFileInternal === "function") {
      // Desktop
      await adapter.reconcileFileInternal(realPath, filePath);
    } else if (typeof adapter.reconcileFileChanged === "function") {
      // Mobile
      const fullRealPath = adapter.getFullRealPath(realPath);
      const stat = await adapter.fs.stat(fullRealPath);
      if (stat) {
        adapter.reconcileFileChanged(realPath, filePath, stat);
      }
    }

    // 3. Retrieve registered TFile
    const file = this.app.vault.getAbstractFileByPath(filePath);
    return file instanceof TFile ? file : null;
  } catch {
    return null;
  }
}
```

### 2. Simplify `openHiddenFile()` in `src/tree-view.ts`

The flow remains the same — `ensureVaultFile()` should now succeed, so `HiddenFileView` fallback will rarely be triggered.

### 3. Remove `HiddenFileView` (optional cleanup)

If the reconciliation approach works reliably, `HiddenFileView` and its registration in `main.ts` can be removed entirely since files will always open in native MarkdownView. However, keeping it as a fallback is safer.

### 4. No Other Files Need Changes

- `tree-builder.ts` — No changes (file discovery works correctly)
- `main.ts` — No changes (unless removing HiddenFileView registration)
- `constants.ts` — No changes
- `types.ts` — No changes
- `settings.ts` — No changes
- `styles.css` — No changes

## Files to Modify

| File | Change | Scope |
|------|--------|-------|
| `src/tree-view.ts` | Replace `ensureVaultFile()` implementation | ~30 lines modified |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Internal API breaks in future Obsidian versions | `ensureVaultFile()` returns null | `HiddenFileView` fallback still exists |
| `reconcileFileInternal` not available on some platforms | File won't register | Check with `typeof ... === "function"` and fall through to mobile API |
| `getRealPath` not available | Registration fails | Try/catch with null return, fallback to HiddenFileView |

## Acceptance Criteria

1. Clicking a hidden dir file opens it in Obsidian's **native MarkdownView** (editable)
2. Works on both Desktop and Mobile platforms
3. Parent folders are properly registered in vault index
4. `HiddenFileView` remains as a fallback if reconciliation fails
5. No regressions for non-hidden files

## Out of Scope

- Persistent vault index registration (files re-register on each click, which is acceptable)
- File explorer integration (hidden files won't appear in Obsidian's file explorer)
- Custom editor implementation (no longer needed)

## References

- [polyipseity/obsidian-show-hidden-files](https://github.com/polyipseity/obsidian-show-hidden-files) — Source analysis of `src/show-hidden-files.ts`
- [polyipseity/obsidian-plugin-library](https://github.com/polyipseity/obsidian-plugin-library) — `src/@types/obsidian.ts` for internal API type definitions

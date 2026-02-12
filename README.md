---
feature: thumbnails/external/656a8ecabb6bb86e529238cf78733b61.svg
thumbnail: thumbnails/external/656a8ecabb6bb86e529238cf78733b61.svg
---
# Obsidian Repository Navigator

A plugin for Obsidian that provides a filtered sidebar tree view showing only directories containing Markdown files. Designed for Git repositories and codebases where documentation is mixed with source code.

![Version](https://img.shields.io/github/v/release/warezio/obsidian-repository-navigator)
![License](https://img.shields.io/github/license/warezio/obsidian-repository-navigator)

## Features

- **Filtered Tree View**: Shows only directories containing Markdown (`.md`) files, hiding clutter from source code and build artifacts
- **Hidden Directory Support**: Includes dot-prefixed directories (e.g., `.github`, `.obsidian`) when they contain Markdown files. Hidden directories are shown by default.
- **Collapsible Directories**: Expand/collapse directory nodes with persistent state
- **Auto-Refresh**: Tree updates automatically when files are created, deleted, or renamed
- **Active File Highlighting**: Highlights the currently open file in the tree
- **Customizable Settings**:
  - Toggle hidden directory visibility (enabled by default)
  - Configure file extensions to include (default: `.md`)
  - Exclude specific directories (default: `node_modules`, `.git`)
  - Sort order options (folders-first, alphabetical A-Z, alphabetical Z-A)
  - Collapse all directories on startup

## Installation

### Via BRAT (Recommended)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. In Obsidian, open Command Palette (`Ctrl/Cmd + P`)
3. Run `BRAT: Plugins: Add a beta plugin for testing`
4. Enter: `https://github.com/warezio/obsidian-repository-navigator`

### Manual Installation

1. Download the latest [release](https://github.com/warezio/obsidian-repository-navigator/releases)
2. Extract the downloaded zip
3. Move the extracted folder to your Obsidian vault's `plugins` directory
4. Enable the plugin in Obsidian settings under Community Plugins

## Usage

Once installed:

- Click the **folder tree** icon in the left sidebar ribbon to open the Repository Navigator
- Or use the Command Palette: `Repository Navigator: Open tree view`
- Click on any file to open it in the editor
- `Ctrl/Cmd + Click` to open in a new tab
- Click directory names to expand/collapse
- Use the **Collapse All** and **Refresh** buttons in the header

### Settings

Access settings via **Settings > Community Plugins > Repository Navigator**:

| Setting | Description | Default |
|---------|-------------|---------|
| Show hidden directories | Include dot-prefixed directories (`.github`, etc.) | `true` |
| File extensions | Comma-separated extensions to include (`.md,.mdx`) | `.md` |
| Excluded directories | Directories to always hide | `node_modules,.git` |
| Sort order | Tree sorting method | Folders first |
| Collapse on startup | Start with all directories collapsed | `false` |

## Development

```bash
# Install dependencies
bun install

# Development build (with source maps)
bun run dev

# Production build (type-check + minified)
bun run build
```

### Project Structure

```
src/
  main.ts              # Plugin entry point
  tree-view.ts         # ItemView sidebar rendering
  tree-builder.ts      # Tree construction logic
  types.ts             # TypeScript interfaces
  settings.ts          # Plugin settings tab
  constants.ts         # View type and default settings
  styles.css           # Plugin stylesheet
```

## Requirements

- Obsidian 0.15.0 or higher
- Works on desktop and mobile

## License

MIT License - see [LICENSE](LICENSE) for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

See [Product Requirements Document](.claude/docs/prd.md) for planned features:

- v0.2.0: Incremental tree updates, drag-and-drop reordering, search/filter
- v0.3.0: Bookmarked directories, file preview on hover, keyboard navigation

## Credits

Created by [warezio](https://github.com/warezio)

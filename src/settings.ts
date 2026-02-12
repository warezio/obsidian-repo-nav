import { App, PluginSettingTab, Setting } from "obsidian";
import type RepoNavPlugin from "./main";
import { RepoNavSettings } from "./types";

export class RepoNavSettingTab extends PluginSettingTab {
  plugin: RepoNavPlugin;

  constructor(app: App, plugin: RepoNavPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Show hidden directories")
      .setDesc(
        "Include dot-prefixed directories (e.g., .github, .obsidian) in the tree. Hidden folders are shown by default."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showHiddenDirs)
          .onChange(async (value) => {
            this.plugin.settings.showHiddenDirs = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("File extensions")
      .setDesc(
        "Comma-separated list of extensions to include (e.g., .md,.mdx)."
      )
      .addText((text) =>
        text
          .setPlaceholder(".md")
          .setValue(this.plugin.settings.fileExtensions)
          .onChange(async (value) => {
            this.plugin.settings.fileExtensions = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Excluded directories")
      .setDesc("Comma-separated directory names to always exclude.")
      .addText((text) =>
        text
          .setPlaceholder("node_modules,.git")
          .setValue(this.plugin.settings.excludedDirs)
          .onChange(async (value) => {
            this.plugin.settings.excludedDirs = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Sort order")
      .setDesc("How to sort files and directories in the tree.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("folders-first", "Folders first")
          .addOption("az", "Alphabetical (A-Z)")
          .addOption("za", "Alphabetical (Z-A)")
          .setValue(this.plugin.settings.sortOrder)
          .onChange(async (value) => {
            this.plugin.settings.sortOrder =
              value as RepoNavSettings["sortOrder"];
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Collapse on startup")
      .setDesc(
        "Start with all directories collapsed when opening the view."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.collapseOnStartup)
          .onChange(async (value) => {
            this.plugin.settings.collapseOnStartup = value;
            await this.plugin.saveSettings();
          })
      );
  }
}

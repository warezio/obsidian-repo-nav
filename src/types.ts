export interface TreeNode {
  name: string;
  path: string;
  type: "directory" | "file";
  children: TreeNode[];
}

export interface RepoNavSettings {
  showHiddenDirs: boolean;
  fileExtensions: string;
  excludedDirs: string;
  sortOrder: "az" | "za" | "folders-first";
  collapseOnStartup: boolean;
}

export type Folder = {
  id: number;
  name: string;
  description?: string;
  countOfTestCases: number;
  parentFolderId: number | null;
  subFolders?: Folder[];
};

export type TransformedFolder = {
  id: number;
  name: string;
  description?: string;
  testsCount: number;
  parentFolderId: number | null;
  folders: TransformedFolder[];
};

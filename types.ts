
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  isOpen?: boolean;
}

export type FileSystemItem = Note | Folder;

export interface AppState {
  folders: Folder[];
  notes: Note[];
  selectedNoteId: string | null;
  selectedFolderId: string | null;
}

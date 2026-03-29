export enum TaskType {
  Normal = "normal",
  Critical = "critical",
}

export enum TaskStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Done = "done",
  Archived = "archived",
}

export type Task = {
  id: string;
  name: string;
  type: TaskType;
  status: TaskStatus;
  attachments: TaskAttachmentInput[];
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

/** ImageKit (or CDN) file metadata sent when creating a task. */
export type TaskAttachmentInput = {
  url: string;
  fileId?: string;
};

export type DeleteTasks = {
  count: number;
};
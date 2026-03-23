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
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DeleteTasks = {
  count: number;
};
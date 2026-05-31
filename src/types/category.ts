export type Category = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GetCategoriesResponse = Category & {
  totalDoneTasks: number;
  totalNonArchivedTasks: number;
  completionPercentage: number;
};

export type DeleteCategories = {
  count: number
}
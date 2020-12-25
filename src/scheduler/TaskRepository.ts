interface TaskRepository {
  createTask(taskId: string): Promise<void>;
  deleteTask(taskId: string): Promise<void>;
  isTaskValid(taskId: string): Promise<boolean>;
}

export default TaskRepository;

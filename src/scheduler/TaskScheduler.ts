import Task from "./Task";

interface TaskScheduler {
  scheduleTask(delayInMilliseconds: number, task: Task): Promise<void>;
  invalidateTask(taskId: string): Promise<void>;
}

export default TaskScheduler;

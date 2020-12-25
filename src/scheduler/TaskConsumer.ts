import Task from "./Task";
import TaskType from "./TaskType";

interface TaskConsumer {
  consume(taskType: TaskType, handler: (task: Task) => void): void;
}

export default TaskConsumer;

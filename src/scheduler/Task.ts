import { v4 } from "uuid";
import TaskType from "./TaskType";

class Task {
  public taskId: string;
  public taskType: string;
  public payload: string;

  public static create(taskType: TaskType, payload: string) {
    return new Task(v4(), taskType.toString(), payload);
  }

  public static fromJson(json: string): Task {
    return JSON.parse(json) as Task;
  }

  public constructor(taskId: string, taskType: string, payload: string) {
    this.taskId = taskId;
    this.taskType = taskType;
    this.payload = payload;
  }

  public toJson(): string {
    return JSON.stringify(this);
  }
}

export default Task;

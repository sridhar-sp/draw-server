import { json } from "express";
import Producer from "./rabbitmq/Producer";
import Task from "./Task";
import TaskRepository from "./TaskRepository";
import TaskScheduler from "./TaskScheduler";
import config from "../config/";

class TaskSchedulerImpl implements TaskScheduler {
  private static TAG = "TaskSchedulerImpl";

  private taskRepository: TaskRepository;
  private producer: Producer;

  public static create(taskRepository: TaskRepository): TaskScheduler {
    return new TaskSchedulerImpl(taskRepository, Producer.create(config.rabbitMQUrl));
  }

  private constructor(taskRepository: TaskRepository, producer: Producer) {
    this.taskRepository = taskRepository;
    this.producer = producer;
  }

  scheduleTask(delayInMilliseconds: number, task: Task): Promise<string> {
    return new Promise((resolve: (taskId: string) => void, reject: (error: Error) => void) => {
      this.taskRepository
        .createTask(task.taskId, task.ttlInSeconds)
        .then(() => this.producer.sendDelayedMessageToQueue(task.taskType, delayInMilliseconds, task.toJson()))
        .then(() => resolve(task.taskId))
        .catch((error) => reject(error));
    });
  }

  invalidateTask(taskId: string): Promise<void> {
    return this.taskRepository.deleteTask(taskId);
  }
}

export default TaskSchedulerImpl;

import { json } from "express";
import Producer from "./rabbitmq/Producer";
import Task from "./Task";
import TaskRepository from "./TaskRepository";
import TaskScheduler from "./TaskScheduler";
import config from "../config/";

class TaskSchedulerImpl implements TaskScheduler {
  private taskRepository: TaskRepository;
  private producer: Producer;

  public static create(taskRepository: TaskRepository): TaskScheduler {
    return new TaskSchedulerImpl(taskRepository, Producer.create(config.rabbitMQUrl));
  }

  private constructor(taskRepository: TaskRepository, producer: Producer) {
    this.taskRepository = taskRepository;
    this.producer = producer;
  }

  scheduleTask(delayInMilliseconds: number, task: Task): Promise<void> {
    return this.producer.sendDelayedMessageToQueue(task.taskType, delayInMilliseconds, task.toJson());
  }

  invalidateTask(taskId: string): Promise<void> {
    return this.taskRepository.deleteTask(taskId);
  }
}

export default TaskSchedulerImpl;

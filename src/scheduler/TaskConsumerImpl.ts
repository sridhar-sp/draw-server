import Consumer from "./rabbitmq/Consumer";
import Task from "./Task";
import TaskConsumer from "./TaskConsumer";
import TaskRepository from "./TaskRepository";
import TaskType from "./TaskType";
import config from "../config";
import logger from "../logger/logger";

class TaskConsumerImpl implements TaskConsumer {
  private taskRepository: TaskRepository;
  private consumer: Consumer;

  public static create(taskRepository: TaskRepository): TaskConsumer {
    return new TaskConsumerImpl(taskRepository, Consumer.create(config.rabbitMQHost, parseInt(config.rabbitMQPort)));
  }

  private constructor(taskRepository: TaskRepository, consumer: Consumer) {
    this.taskRepository = taskRepository;
    this.consumer = consumer;
  }

  consume(taskType: TaskType, handler: (task: Task) => void): void {
    this.consumer.consume(taskType.toString(), async (payload: string) => {
      const task = Task.fromJson(payload);
      const isTaskValid = await this.taskRepository.isTaskValid(task.taskId);
      logger.log(`Time to execute ${taskType} isTaskValid=${isTaskValid}`);
      if (isTaskValid) {
        handler(task);
      }
    });
  }
}

export default TaskConsumerImpl;

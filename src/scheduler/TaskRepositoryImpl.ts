import TaskRepository from "./TaskRepository";
import RedisHelper from "../redis/RedisHelperV2";

class TaskRepositoryImpl implements TaskRepository {
  private redisHelper: RedisHelper;

  public static create(redisHelper: RedisHelper): TaskRepositoryImpl {
    return new TaskRepositoryImpl(redisHelper);
  }

  private constructor(redisHelper: RedisHelper) {
    this.redisHelper = redisHelper;
  }
  createTask(taskId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.redisHelper.setString(taskId, "");
        resolve();
      } catch (error) {
        reject();
      }
    });
  }
  deleteTask(taskId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.redisHelper.delete(taskId);
        resolve();
      } catch (error) {
        reject();
      }
    });
  }
  isTaskValid(taskId: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const isExist = await this.redisHelper.exist(taskId);
        resolve(isExist);
      } catch (error) {
        reject();
      }
    });
  }
}

export default TaskRepositoryImpl;

import AMQBBase from "./amqpBase";
import logger from "../../logger/logger";

class Producer extends AMQBBase {
  private static LOG_TAG = "Producer";

  public static create(url: string): Producer {
    return new Producer(url);
  }

  private constructor(url: string) {
    super(url);
  }

  public sendDelayedMessageToQueue(queueName: string, delayInMills: number, data: string): Promise<void> {
    logger.logInfo(Producer.LOG_TAG, `Initiate Send delayed message to ${queueName} at ${new Date().toTimeString()}`);

    const INTERMEDIATE_QUEUE = `${queueName}_INTERMEDIATE_QUEUE`;
    const INTERMEDIATE_EXCHANGE = `${queueName}_INTERMEDIATE_EXCHANGE`;
    const INTERMEDIATE_EXCHANGE_TYPE = "fanout";

    const FINAL_QUEUE = queueName;
    const FINAL_EXCHANGE = `${queueName}_FINAL_EXCHANGE`;
    const FINAL_EXCHANGE_TYPE = "fanout";

    return new Promise((resolve, reject) => {
      this.assertExchange(INTERMEDIATE_EXCHANGE, INTERMEDIATE_EXCHANGE_TYPE)
        .then((_) => this.assertExchange(FINAL_EXCHANGE, FINAL_EXCHANGE_TYPE))
        .then((_) => this.assertQueue(INTERMEDIATE_QUEUE, { deadLetterExchange: FINAL_EXCHANGE }))
        .then((_) => this.assertQueue(FINAL_QUEUE, {}))
        .then((_) => this.bindQueue(INTERMEDIATE_QUEUE, INTERMEDIATE_EXCHANGE, ""))
        .then((_) => this.bindQueue(FINAL_QUEUE, FINAL_EXCHANGE, ""))
        .then((_) => {
          this.channel?.sendToQueue(INTERMEDIATE_QUEUE, Buffer.from(data), {
            expiration: delayInMills,
          });
          logger.log(`Send message to queue at ${new Date().toTimeString()}`);
          resolve();
        })
        .catch((error: Error) => {
          logger.log(`Error while trying to send delayed message. Process id ${process.pid}`);
          reject(error);
        });
    });
  }
}

export default Producer;

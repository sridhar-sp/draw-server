import { Replies, Message } from "amqplib/callback_api";

import AMQBBase from "./amqpBase";
import logger from "../logger/logger";

class MessagingSystemDetails {
  static INTERMEDIATE_EXCHANGE = "intermediate_exchange";
  static INTERMEDIATE_EXCHANGE_TYPE = "fanout";
  static INTERMEDIATE_QUEUE = "intermediate_queue";

  static FINAL_EXCHANGE = "final_exchange";
  static FINAL_EXCHANGE_TYPE = "fanout";
}

class Producer extends AMQBBase {
  public static create(host: String, port: number): Producer {
    return new Producer(host, port);
  }

  private constructor(host: String, port: number) {
    super(host, port);
  }

  public sendDelayedMessageToQueue(queueName: string, delayInMills: number, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.assertExchange(
        MessagingSystemDetails.INTERMEDIATE_EXCHANGE,
        MessagingSystemDetails.INTERMEDIATE_EXCHANGE_TYPE
      )
        .then((_) =>
          this.assertExchange(MessagingSystemDetails.FINAL_EXCHANGE, MessagingSystemDetails.FINAL_EXCHANGE_TYPE)
        )
        .then((_) =>
          this.assertQueue(MessagingSystemDetails.INTERMEDIATE_QUEUE, {
            deadLetterExchange: MessagingSystemDetails.FINAL_EXCHANGE,
          })
        )
        .then((_) => this.assertQueue(queueName, {}))
        .then((_) =>
          this.bindQueue(MessagingSystemDetails.INTERMEDIATE_QUEUE, MessagingSystemDetails.INTERMEDIATE_EXCHANGE, "")
        )
        .then((_) => this.bindQueue(queueName, MessagingSystemDetails.FINAL_EXCHANGE, ""))
        .then((_) => {
          this.channel?.sendToQueue(MessagingSystemDetails.INTERMEDIATE_QUEUE, Buffer.from(data), {
            expiration: delayInMills,
          });
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

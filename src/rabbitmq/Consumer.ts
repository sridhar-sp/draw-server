import AMQBBase from "./amqpBase";
import amqp, { Message } from "amqplib/callback_api";
import logger from "../logger/logger";

class Consumer extends AMQBBase {
  public static create(host: String, port: number): Consumer {
    return new Consumer(host, port);
  }

  private constructor(host: String, port: number) {
    super(host, port);
  }
  public consume(queue: string, handler: (payload: string) => void) {
    this.assertQueue(queue, {}).then((_) => {
      this.channel?.consume(
        queue,
        (msg: Message | null) => {
          handler(msg?.content ? msg?.content.toString() : "");
        },
        { noAck: true }
      );
    });
  }
}

export default Consumer;

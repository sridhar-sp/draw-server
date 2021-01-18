import amqp, { Channel, Connection, Options, Replies, Message } from "amqplib/callback_api";
import logger from "../../logger/logger";

class AMQPBase {
  private static TAG = "AMQPBase";
  private url: string;
  protected channel: Channel | null;
  private connection: Connection | null;

  constructor(url: string) {
    this.url = url;
    this.channel = null;
    this.connection = null;
  }

  private getConnection(): Promise<Connection> {
    return new Promise((resolve: (connection: Connection) => void, reject: (err: Error) => void) => {
      if (this.connection) {
        resolve(this.connection);
        return;
      }

      amqp.connect(this.url, (err: any, connection: Connection) => {
        if (err) {
          logger.error(err);
          reject(new Error(err));
          return;
        }
        this.connection = connection;
        resolve(connection);
      });
    });
  }

  protected getChannel(): Promise<Channel> {
    return new Promise(async (resolve: (channel: Channel) => void, reject: (error: Error) => void) => {
      if (this.channel) {
        resolve(this.channel);
        return;
      }

      // let connection: Connection;
      // try {
      //   connection = await this.getConnection();
      // } catch (e: any) {
      //   reject(Error("Could not get the rabbit mq connection object"));
      //   return;
      // }

      this.getConnection()
        .then((conn) => {
          conn.createChannel((err: any, channel: Channel) => {
            if (err) {
              reject(new Error(err));
              return;
            }
            this.channel = channel;
            resolve(channel);
          });
        })
        .catch((error) => logger.logError(AMQPBase.TAG, error));
    });
  }

  protected assertExchange(
    exchange: string,
    type: string,
    options?: Options.AssertExchange
  ): Promise<Replies.AssertExchange> {
    return new Promise((resolve: (reply: Replies.AssertExchange) => void, reject: (err: Error) => void) => {
      this.getChannel()
        .then((channel) => {
          channel.assertExchange(exchange, type, options, (err: any, assertedExchange: Replies.AssertExchange) => {
            if (err) {
              reject(new Error(err));
              return;
            }
            resolve(assertedExchange);
          });
        })
        .catch((error) => reject(error));
    });
  }

  protected assertQueue(queue?: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue> {
    return new Promise((resolve: (reply: Replies.AssertQueue) => void, reject: (err: Error) => void) => {
      this.getChannel()
        .then((channel) => {
          channel.assertQueue(queue, options, (err: any, assertedQueue: Replies.AssertQueue) => {
            if (err) {
              reject(new Error(err));
              return;
            }
            resolve(assertedQueue);
          });
        })
        .catch((error) => reject(error));
    });
  }

  protected bindQueue(queue: string, source: string, pattern: string, args?: any): Promise<Replies.Empty> {
    return new Promise((resolve: (reply: any) => void, reject: (error: Error) => void) => {
      this.getChannel()
        .then((channel) => {
          channel.bindQueue(queue, source, pattern, args, (err: any, ok: Replies.Empty) => {
            if (err) {
              reject(new Error(err));
              return;
            }
            resolve(ok);
          });
        })
        .catch((error) => reject(error));
    });
  }

  public close() {
    this.connection?.close;
  }
}
export default AMQPBase;

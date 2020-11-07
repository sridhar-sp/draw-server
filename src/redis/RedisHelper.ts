import redis, { RedisClient } from 'redis'
const config = require('../config/index.js')

class RedisHelper {
    redisClient: RedisClient

    constructor() {
        console.log("Constructing RedisHelper")
        this.redisClient = redis.createClient(config.redisURL, { no_ready_check: true });
        this.redisClient.on("error", function (error) {
            console.error(error);
        });
    }

    setString(key: string, value: string) {
        return new Promise((resolve, reject) => {
            this.redisClient.set(key, value, (err, reply) => {
                if (err == null) resolve(true)
                else reject(err)
            })
        });
    }

    getString(key: string) {
        return new Promise((resolve: (value: string | null) => void, reject: (error: Error) => void) => {
            this.redisClient.get(key, (err, reply) => {
                if (err == null) resolve(reply)
                else reject(err)
            })
        });
    }

    delete(key: string) {
        return new Promise((resolve, reject) => {
            this.redisClient.del(key, (err, reply) => {
                if (err == null)
                    resolve(reply)
                else reject(err)
            })
        });
    }
}

export default new RedisHelper();
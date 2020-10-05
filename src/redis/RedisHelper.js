const redis = require('redis')
const config = require('../config/index.js')

class RedisHelper {

    constructor() {
        console.log("Constructing RedisHelper")
        this.redisClient = redis.createClient(config.redisURL, {no_ready_check: true});
        this.redisClient.on("error", function (error) {
            console.error(error);
        });
    }

    setString(key, value) {
        return new Promise((resolve, reject) => {
            this.redisClient.set(key, value, (err, reply) => {
                if (err == null) resolve(true)
                else reject(err)
            })
        });
    }

    getString(key){
        return new Promise((resolve, reject) => {
            this.redisClient.get(key, (err, reply) => {
                if (err == null) resolve(reply)
                else reject(err)
            })
        });
    }
}

module.exports = new RedisHelper();
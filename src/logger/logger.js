class Logger {


    log(log) {
        console.log(log)
    }

    warn(log) {
        console.warn(log)
    }

    error(log) {
        console.error(log)
    }

}

module.exports = new Logger()
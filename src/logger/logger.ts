class Logger {


    log(log: string) {
        console.log(log)
    }

    warn(log: string) {
        console.warn(log)
    }

    error(log: string) {
        console.error(log)
    }

}

export default new Logger()

const express = require('express')
const SoketServer = require('socket.io')

const app = express()

const FALLBACK_PORT = 3000;

const PORT = process.env.PORT || FALLBACK_PORT;

const httpServer = app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
});

const server = SoketServer(httpServer)

server.on("connection", socket => {
    console.log(`Socket connected ${socket.id}`)

    socket.on("global_channel", data => {
        console.log(`global_channel ${data}`)

        if (data.indexOf('1') != -1) {
            socket.broadcast.emit("global_channel", `broadcasting from ${socket.id} msg is ${data}`)
        } else if (data.indexOf('2') != -1) {
            socket.emit("global_channel", "Sending data to onlt the specific socket")
        } else {
            server.emit("global_channel", `Server sending to all ${data}`)
        }

    })
})

app.get('/', (req, res) => {
    res.send("Welcome")
});




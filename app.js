const SoketServer = require('socket.io')

// const PORT = 3000;

// const server = SoketServer(PORT)

// server.on("connection",socket=>{
//     console.log("Socket connected ${socket.id}")
// })

var http = require('http');

//create a server object:
http.createServer(function (req, res) {
  res.write(`Welcome to draw and guess server ${process.env.PORT}`); //write a response to the client
  res.end(); //end the response
}).listen(process.env.PORT || 8080); //the server object listens on port 8080

console.log(`ENV PORT ${process.env.PORT}`)
const http = require('http')
const fs = require('fs')
const path = require('path')
const socketio = require('socket.io')

// for heroku
const PORT = process.env.PORT || 8000 

const server = http.createServer((request, response) => {
  console.log('REQUEST TO: ' + request.url)

  let filePath = '.' + request.url
  
  switch(filePath) {
    case './': 
      filePath = './part1.html'
      break
    case './controller': 
      filePath = './controller.html'
      break
  }

  const extname = path.extname(filePath)
  let contentType = 'text/html'
  switch (extname) {
      case '.js':
          contentType = 'text/javascript'
          break
      case '.css':
          contentType = 'text/css'
          break
      case '.jpg':
          contentType = 'image/jpg'
          break
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.end("Error!")
    }
    else {
      response.writeHead(200, { 'Content-Type': contentType, 
                                "Access-Control-Allow-Origin": "*" })
      response.end(content, 'utf-8')
    }
  })
})

io = socketio(server)
io.on('connection', (socket) => {
  console.log('SOCKET CONNECTED: <' + socket.id + '>')
  console.log('  | URL: ' + socket.handshake.query.url)

  socket.on('disconnect', (reason) => {
    console.log("DISCONNECT: <" + reason + ">")
    console.log('  | URL: ' + socket.handshake.query.url)
  });

  const on = (name, callback) => socket.on(name, (data) => {
    console.log("RECIEVED: <" + name + ">")
    if (data) { console.log("  | DATA: " + data) }
    callback(data)
  })

  const broadcast = (name, callback) => {
    console.log("EMITTING: <" + name + ">")
    socket.broadcast.emit(name)
  }

  const bindRelay = (name) => {
    on(name, () => {
      broadcast(name)
    })
  }

  // should really just be accepting one event and just doing message forwarding
  const events = ["computer--part-1", "computer--part-2", "play--v1-boarding",
                  "play--v2-push-button", "play--v3-to-the-past", "play--v3-return", "pause--all", "puzzles-solved"]
  events.map(event => bindRelay(event))
})

server.listen(PORT)
console.log('Server started at: http://localhost:' + PORT)



const http = require('http')
const socketio = require('socket.io')
const Serial = require('serialport')
const Ready = require('@serialport/parser-ready')
const Readline = Serial.parsers.Readline
  
async function connectSerialPort(baudRate) {
  const availablePorts = await Serial.list()
  const arduinoPorts = availablePorts.filter(({ manufacturer }) => manufacturer && manufacturer.includes('Arduino'))

  if (arduinoPorts.length == 0) {
    throw new Error('No Arduino found!')
  }

  const comPort = arduinoPorts[0].comName
  console.log(comPort)
  const serialPort = new Serial(comPort, { baudRate: baudRate })
  const parser = serialPort.pipe(new Ready({ delimiter: 'READY' }))

  return {
    serialPort,
    parser
  }
}

function socketMiddleware(fn) {
  return (socket) => {
    console.log('SOCKET CONNECTED: <' + socket.id + '>')
    console.log('  | URL: ' + socket.handshake.query.url)

    socket.on('disconnect', (reason) => {
      console.log("DISCONNECT: <" + reason + ">")
      console.log('  | URL: ' + socket.handshake.query.url)
    })

    const on = (name, callback) => socket.on(name, (data) => {
      console.log("RECIEVED: <" + name + ">")
      if (data) { console.log("  | DATA: " + data) }
      callback(data)
    })

    const broadcast = (name, data) => {
      console.log("EMITTING: <" + name + ">")
      socket.broadcast.emit(name, data)
    }

    if (fn) {
      return fn(socket, on, broadcast)  
    }
  }
}

function parserMiddleware(fn) {
  return (data) => {
    console.log("SERIAL RECIEVED: ")
    console.log(data)

    if (fn) {
      return fn(data)  
    }
  }
}
 
async function main() {
  const HTTP_PORT = 8181
  const server = http.createServer(HTTP_PORT, (req, res) => {
    // response.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('HELLO')
  })
  let { serialPort, parser } = await connectSerialPort(9600)

  parser.on('ready', () => {
    console.log("SERIAL READY")
    serialPort.write('howdy\n', (err) => { 
      console.log(err)
    })

    parser = serialPort.pipe(new Readline())

    // sad nesting cause no promises
    io = socketio(server)
    io.on('connection', socketMiddleware((socket, on, broadcast) => {
      on('send-serial', (message) => {
        serialPort.write(message + '\n')
      })

      parser.on('data', parserMiddleware((data) => {
        broadcast('receive-serial', data)
      }))
    }))
  })

  server.listen(HTTP_PORT)
}

main()

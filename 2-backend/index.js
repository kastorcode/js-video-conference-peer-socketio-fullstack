import { IncomingMessage, ServerResponse } from 'node:http'
import { createServer } from 'node:https'
import { Server } from 'socket.io'

import { getSsl, HEADERS, PORT, SOCKET_OPTIONS } from './config.js'


const server = createServer(getSsl(), requestListener)


/**
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 */
function requestListener (request, response) {
  return response.writeHead(204, HEADERS).end()
}


const io = new Server(server, SOCKET_OPTIONS)

io.on('connection', socket => {
  console.log('connection', socket.id)
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    socket.on('disconnect', () => {
      console.log('disconnected', roomId, userId)
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(PORT, serverListener)


function serverListener () {
  const { address, port } = server.address()
  console.info(`Server listening at ${address}:${port}`)
}
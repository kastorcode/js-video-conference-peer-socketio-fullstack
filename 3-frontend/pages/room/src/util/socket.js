class SocketBuilder {

  constructor ({ socketUrl }) {
    this.socketUrl = socketUrl
    this.onUserConnected = null
    this.onUserDisconnected = null
  }


  build () {
    const socket = io.connect(this.socketUrl, { withCredentials: false })
    socket.on('user-connected', this.onUserConnected)
    socket.on('user-disconnected', this.onUserDisconnected)
    return socket
  }


  setOnUserConnected (onUserConnected) {
    this.onUserConnected = onUserConnected
    return this
  }


  setOnUserDisconnected (onUserDisconnected) {
    this.onUserDisconnected = onUserDisconnected
    return this
  }

}
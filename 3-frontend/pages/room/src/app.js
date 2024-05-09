window.onload = windowOnLoad


function windowOnLoad () {
  const urlParams = new URLSearchParams(window.location.search)
  const room = urlParams.get('room')
  console.log('this is the room', room)
  const socketUrl = 'https://192.168.2.81:3000'
  const socketBuilder = new SocketBuilder({ socketUrl })
  const peerConfig = Object.values({
    id: undefined,
    config: {
      port: 9000,
      host: '192.168.2.81',
      path: '/'
    }
  })
  const peerBuilder = new PeerBuilder({ peerConfig })
  const view = new View()
  const media = new Media()
  Business.initialize({ media, peerBuilder, room, socketBuilder, view })
}
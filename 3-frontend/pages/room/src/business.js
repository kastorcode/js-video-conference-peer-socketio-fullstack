class Business {

  constructor ({ media, peerBuilder, room, socketBuilder, view }) {
    this.media = media
    this.room = room
    this.view = view
    this.currentPeer = null
    this.peerBuilder = peerBuilder
    this.socketBuilder = socketBuilder
    this.currentStream = null
    this.socket = null
    this.peers = new Map()
    this.recordings = new Map()
  }


  async _init () {
    this.view.configureLeave(this.onLeaveClick.bind(this))
    this.view.configureRecord(this.onRecordClick.bind(this))
    this.currentStream = await this.media.getCamera(true)
    this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build()
    this.currentPeer = await this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallError(this.onPeerCallError())
      .setOnCallClose(this.onPeerCallClose())
      .setOnCallReceived(this.onPeerCallReceived())
      .setOnPeerStreamReceived(this.onPeerStreamReceived())
      .build()
    this.addVideoStream(this.currentPeer.id)
  }


  static initialize (deps) {
    const business = new Business(deps)
    return business._init()
  }


  addVideoStream (userId, stream = this.currentStream) {
    const recorder = new Recorder({ stream, userId })
    this.recordings.set(recorder.filename, recorder)
    if (this.recordingEnabled) {
      recorder.startRecording()
    }
    this.view.renderVideo({
      isCurrentUser: userId === this.currentPeer.id, userId, stream
    })
  }


  onPeerError () {
    return error => {
      console.error('Peer Error: ', error)
    }
  }


  onPeerConnectionOpened () {
    return peer => {
      this.socket.emit('join-room', this.room, peer.id)
    }
  }


  onPeerCallError () {
    return (call, error) => {
      console.error('Peer Call Error: ', error)
      this.view.removeVideoElement(call.peer)
    }
  }


  onPeerCallClose () {
    return () => {}
  }


  onPeerCallReceived () {
    return call => {
      call.answer(this.currentStream)
    }
  }


  onPeerStreamReceived () {
    return (call, stream) => {
      const callerId = call.peer
      if (this.peers.has(callerId)) return
      this.addVideoStream(callerId, stream)
      this.peers.set(callerId, { call })
      this.view.setParticipants(this.peers.size)
    }
  }


  onLeaveClick () {
    this.recordings.forEach(recording => recording.download())
  }


  onRecordClick (recordingEnabled) {
    this.recordingEnabled = recordingEnabled
    for (const [filename, recorder] of this.recordings) {
      if (this.recordingEnabled) {
        recorder.startRecording()
        continue
      }
      this.stopRecording(filename)
    }
  }


  async stopRecording (key) {
    for (const [filename, recorder] of this.recordings) {
      const isContextUser = filename.includes(key)
      if (!isContextUser) continue
      if (!recorder.recordingActive) continue
      await recorder.stopRecording()
      this.playRecordings(filename)
    }
  }


  onUserConnected () {
    return userId => {
      console.log('user connected', userId)
      this.currentPeer.call(userId, this.currentStream)
    }
  }


  onUserDisconnected () {
    return userId => {
      if (!this.peers.has(userId)) return
      this.peers.get(userId).call.close()
      this.peers.delete(userId)
      this.stopRecording(userId)
      this.view.setParticipants(this.peers.size)
      this.view.removeVideoElement(userId)
    }
  }


  playRecordings (filename) {
    const recorder = this.recordings.get(filename)
    const videoURLs = recorder.getAllVideoURLs()
    videoURLs.forEach(url => {
      this.view.renderVideo({ url, userId: filename })
    })
  }

}
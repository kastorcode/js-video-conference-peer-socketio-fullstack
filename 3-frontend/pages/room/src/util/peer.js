class PeerBuilder {

  constructor ({ peerConfig }) {
    this.peerConfig = peerConfig
    this.onError = null
    this.onCallError = null
    this.onCallClose = null
    this.onCallReceived = null
    this.onConnectionOpened = null
    this.onPeerStreamReceived = null
  }


  _prepareCallEvent (call) {
    call.on('stream', stream => this.onPeerStreamReceived(call, stream))
    call.on('error', error => this.onCallError(call, error))
    call.on('close', () => this.onCallClose(call))
    this.onCallReceived(call)
  }


  _preparePeerInstanceFunction (PeerModule) {
    class PeerCustomModule extends PeerModule {}
    const call = PeerCustomModule.prototype.call
    const context = this
    PeerCustomModule.prototype.call = function (id, stream) {
      const apply = call.apply(this, [id, stream])
      context._prepareCallEvent(apply)
      return apply
    }
    return PeerCustomModule
  }


  build () {
    // const peer = new Peer(...this.peerConfig)
    const PeerCustomInstance = this._preparePeerInstanceFunction(Peer)
    const peer = new PeerCustomInstance(...this.peerConfig)
    peer.on('error', this.onError)
    peer.on('call', this._prepareCallEvent.bind(this))
    return new Promise(resolve => peer.on('open', id => {
      this.onConnectionOpened(peer)
      return resolve(peer)
    }))
  }


  setOnError (onError) {
    this.onError = onError
    return this
  }


  setOnCallError (onCallError) {
    this.onCallError = onCallError
    return this
  }


  setOnCallClose (onCallClose) {
    this.onCallClose = onCallClose
    return this
  }


  setOnCallReceived (onCallReceived) {
    this.onCallReceived = onCallReceived
    return this
  }


  setOnConnectionOpened (onConnectionOpened) {
    this.onConnectionOpened = onConnectionOpened
    return this
  }


  setOnPeerStreamReceived (onPeerStreamReceived) {
    this.onPeerStreamReceived = onPeerStreamReceived
    return this
  }

}
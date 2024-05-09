class View {

  constructor () {
    this.leave = document.getElementById('leave')
    this.record = document.getElementById('record')
  }


  appendToDom (userId, video, isCurrentUser) {
    const div = document.createElement('div')
    div.id = userId
    div.classList.add('wrapper')
    div.append(video)
    const div2 = document.createElement('div')
    div2.innerText = isCurrentUser ? '' : userId
    div.append(div2)
    const videoGrid = document.getElementById('video-grid')
    videoGrid.append(div)
  }


  createVideoElement ({ muted, src, srcObject }) {
    const video = document.createElement('video')
    video.muted = muted
    if (src) {
      video.src = src
      video.controls = true
      video.loop = true
      Util.sleep(200).then(() => video.play())
    }
    if (srcObject) {
      video.srcObject = srcObject
      video.addEventListener('loadedmetadata', () => video.play())
    }
    return video
  }


  removeVideoElement (id) {
    const element = document.getElementById(id)
    element.remove()
  }


  renderVideo ({ isCurrentUser = false, stream = null, url = null, userId }) {
    const video = this.createVideoElement({
      muted: isCurrentUser,
      src: url,
      srcObject: stream
    })
    this.appendToDom(userId, video, isCurrentUser)
  }


  setParticipants (count) {
    const myself = 1
    const participants = document.getElementById('participants')
    participants.innerText = count + myself
  }


  configureRecord (command) {
    this.record.addEventListener('click', this.onRecordClick(command))
  }


  onRecordClick (command) {
    this.recordingEnabled = false
    return () => {
      const isActive = this.recordingEnabled = !this.recordingEnabled
      command(this.recordingEnabled)
      this.toggleRecording(isActive)
    }
  }


  toggleRecording (isActive = true) {
    const call = isActive ? 'add' : 'remove'
    this.record.classList[call]('active')
  }


  configureLeave (command) {
    this.leave.addEventListener('click', this.onLeaveClick(command))
  }


  onLeaveClick (command) {
    return async () => {
      command()
      await Util.sleep(3000)
      window.close()
    }
  }

}
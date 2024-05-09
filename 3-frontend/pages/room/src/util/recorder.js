class Recorder {

  constructor ({ stream, userId }) {
    this.completeRecordings = []
    this.filename = `id:${userId}-when:${Date.now()}`
    this.mediaRecorder = null
    this.recordedBlobs = []
    this.recordingActive = false
    this.stream = stream
    this.userId = userId
    this.videoType = 'video/webm'
  }


  _setup () {
    const commonCodecs = [
      'codecs=vp9,opus', 'codecs=vp8,opus', ''
    ]
    const options = commonCodecs
      .map(codec => ({ mimeType: `${this.videoType};${codec}` }))
      .find(options => MediaRecorder.isTypeSupported(options.mimeType))
    if (!options) throw new Error(`none of the codecs: ${commonCodecs.join(',')} are supported`)
    return options
  }


  download () {
    if (!this.completeRecordings.length) return
    for (const recording of this.completeRecordings) {
      const blob = new Blob(recording, { type: this.videoType })
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = window.URL.createObjectURL(blob)
      a.download = `${this.filename}.webm`
      document.body.appendChild(a)
      a.click()
    }
  }


  getAllVideoURLs () {
    return this.completeRecordings.map(recording => {
      const blob = new Blob(recording, { type: this.videoType })
      return window.URL.createObjectURL(blob)
    })
  }


  startRecording () {
    if (!this.stream.active) return
    const options = this._setup()
    this.mediaRecorder = new MediaRecorder(this.stream, options)
    console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options)
    this.mediaRecorder.onstop = event => {
      console.log('Recorder Blobs:', this.recordedBlobs)
    }
    this.mediaRecorder.ondataavailable = event => {
      if (!event.data || !event.data.size) return
      this.recordedBlobs.push(event.data)
    }
    this.recordingActive = true
    this.mediaRecorder.start()
  }


  async stopRecording () {
    if (!this.recordingActive) return
    if (this.mediaRecorder.state === 'inactive') return
    this.recordingActive = false
    this.mediaRecorder.stop()
    console.log('Media Recorder Stopped', this.filename)
    await Util.sleep(200)
    this.completeRecordings.push([...this.recordedBlobs])
    this.recordedBlobs = []
  }

}
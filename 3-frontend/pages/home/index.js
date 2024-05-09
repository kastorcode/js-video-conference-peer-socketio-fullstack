window.onload = windowOnLoad


function windowOnLoad () {
  const join = document.getElementById('join')  
  setOpenRoomOn(join)
}


function setOpenRoomOn (element) {
  element.addEventListener('click', openRoom)
}


function openRoom () {
  const room = prompt('Room Name')
  if (!room) return
  window.open(`/pages/room/?room=${room}`)
}
/**
 * author: Jeong Ook Moon
 * description: draw circle and parallelogram by selecting three dots on canvas
 *              user can reshape 
 */

const canvas = document.getElementById("geo_canvas")
let content = canvas.getContext("2d")

// current mouse position
let mousePosition = {}
// to handle duplicates and update for dragging dots
const dots = new Map()
// let warningMessage = {}
let isDraggingDot = false


// drawing types
const DOT = "DOT", LINE = "LINE", CIRCLE = "CIRCLE", PARALLELOGRAM = "PARALLELOGRAM",
  TOOLTIP = "TOOLTIP"

canvas.addEventListener("mousedown", drawDot)
window.addEventListener("mouseup", doneDrawDot)
canvas.addEventListener("drag", dragDot)

function drawGeometry(TYPE, center = null, nextCenter = null, verticies = null) {
  content.beginPath()
  switch (TYPE) {
    // drawing circle
    // reference: https://www.w3schools.com/tags/canvas_arc.asp
    case DOT:
      content.arc(center.x, center.y, 11, 0, 2 * Math.PI)
      content.strokeStyle = "red"
      break;

    // drawing line
    // reference: https://www.w3schools.com/tags/canvas_beginpath.asp
    case LINE:
      content.strokeStyle = "blue"
      content.moveTo(center.x, center.y)
      content.lineTo(nextCenter.x, nextCenter.y)
      break;

    // finish drawing parallelogram and circle
    case PARALLELOGRAM:
      content.strokeStyle = "blue"
      const fourthX = verticies[0].x - verticies[1].x + verticies[2].x
      const fourthY = verticies[0].y - verticies[1].y + verticies[2].y
      content.moveTo(verticies[0].x, verticies[0].y)
      content.lineTo(fourthX, fourthY)
      content.lineTo(verticies[2].x, verticies[2].y)
      content.stroke()
      break;

    case CIRCLE:
      const fourthVertexY = verticies[0].y - verticies[1].y + verticies[2].y
      const newCenterX = (verticies[0].x + verticies[2].x) / 2.0
      const newCenterY = (verticies[1].y + fourthVertexY) / 2.0
      const base = Math.sqrt(Math.pow((verticies[1].x - verticies[0].x), 2)
        + Math.pow((verticies[1].y - verticies[0].y), 2))
      const height = Math.sqrt(Math.pow((verticies[2].x - verticies[1].x), 2)
        + Math.pow((verticies[2].y - verticies[1].y), 2))
      const areaOfParallelogram = base * height
      const newRadius = Math.sqrt(areaOfParallelogram / Math.PI)
      // console.log('areaOfParallelogram', areaOfParallelogram)
      // console.log('newRadius', Math.pow(newRadius, 2) * Math.PI)
      content.arc(newCenterX, newCenterY, newRadius, 0, 2 * Math.PI)
      content.strokeStyle = "yellow"
      content.stroke()
      break;

  }
  content.stroke()
  content.closePath()
}

function reset() {
  content.clearRect(0, 0, canvas.width, canvas.height)
}

function draw() {
  dots.forEach((value) => {
    drawGeometry(DOT, value)
  })

  // if (warningMessage) {
  //   content.font = "14px Arial"
  //   content.fillText("Reached max dots", warningMessage.x, warningMessage.y)
  // }

  let coordinates
  if (dots.size > 1) {
    coordinates = [...dots.values()]
    for (let i = 0; i < coordinates.length - 1; i++) {
      drawGeometry(LINE, coordinates[i], coordinates[i + 1])
    }
  }

  if (dots.size === 3 && coordinates) {
    drawGeometry(PARALLELOGRAM, null, null, coordinates)
    drawGeometry(CIRCLE, null, null, coordinates)
  }
}

function drawDot(event) {
  getPosition(event)
  if (dots.size < 3) {
    dots.set(mousePosition.x + mousePosition.y, mousePosition)
  }
  draw()
}

function dragDot(event) {
  getPosition(event)
  // for drag
  if (dots.has(mousePosition.x + mousePosition.y)) {
    console.log("happened??")
    dots.set(mousePosition.x + mousePosition.y, mousePosition)
  }
  draw()
}

function doneDrawDot() {
  isDraggingDot = false
}

function getPosition(event) {
  const canvasInfo = canvas.getBoundingClientRect()
  // retrieve relative mouse position to canvas
  // reference: https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
  mousePosition = {
    x: Math.abs(event.clientX - canvasInfo.left) / Math.abs(canvasInfo.right - canvasInfo.left) * canvas.width,
    y: Math.abs(canvasInfo.top - event.clientY) / Math.abs(canvasInfo.top - canvasInfo.bottom) * canvas.height
  }
}







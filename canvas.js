/**
 * @author: Jeong Ook Moon
 * @description: draw circle and parallelogram with identical area and center by spotting three dots on canvas
 *              user can reshape them by moving drawn dots (red circles)
 */

// drawing types
const DOT = "DOT", LINE = "LINE", CIRCLE = "CIRCLE", PARALLELOGRAM = "PARALLELOGRAM",
  TOOLTIP = "TOOLTIP", CIRCLE_RADIUS = 11, RED = "#85144b", BLUE = "#0074D9", YELLOW = "#FFDC00"

let canvas, content

// current mouse position
let mousePosition = {}
// dots storage
const dots = []
// flag to determine if user is dragging
let isDraggingDot = false
// index to determine which index is being dragged
let nearbyDotIndex = -1

// to display area of both circle and parallelogram
let areaOfParallelogram = 0.0
let areaOfCircle = 0.0

function startCanvas() {
  canvas = document.getElementById("geo_canvas")
  content = canvas.getContext("2d")

  canvas.addEventListener("mousedown", drawDot)
  window.addEventListener("mouseup", doneDrawDot)
  canvas.addEventListener("mousemove", dragDot)

  drawBoard()

  const resetButton = document.getElementById("reset_button")
  resetButton.addEventListener("click", reset)

  // modal
  const about = document.getElementById("about_program")

  const aboutButton = document.getElementById("about_button")
  aboutButton.addEventListener("click", () => about.style.display = "block")

  const closeButton = document.getElementsByClassName("close")[0];
  closeButton.addEventListener("click", () => about.style.display = "none")
}

function drawGeometry(TYPE, center = null, nextCenter = null, verticies = null) {
  content.beginPath()
  switch (TYPE) {
    // drawing circle
    // reference: https://www.w3schools.com/tags/canvas_arc.asp
    case DOT:
      content.arc(center.x, center.y, CIRCLE_RADIUS, 0, 2 * Math.PI)
      // dot color = red
      content.strokeStyle = RED
      break;

    // drawing line
    // reference: https://www.w3schools.com/tags/canvas_beginpath.asp
    case LINE:
      // line color = blue
      content.strokeStyle = BLUE
      content.moveTo(center.x, center.y)
      content.lineTo(nextCenter.x, nextCenter.y)
      break;

    // finish drawing parallelogram and circle
    case PARALLELOGRAM:
      content.strokeStyle = BLUE
      const fourthX = verticies[0].x - verticies[1].x + verticies[2].x
      const fourthY = verticies[0].y - verticies[1].y + verticies[2].y
      content.moveTo(verticies[0].x, verticies[0].y)
      content.lineTo(fourthX, fourthY)
      content.lineTo(verticies[2].x, verticies[2].y)
      content.stroke()
      content.font = "12px Arial";
      content.fillText(`(${(fourthX).toFixed(1)}, ${(fourthY).toFixed(1)})`, fourthX + 13, fourthY + 13);
      break;

    case CIRCLE:
      const fourthVertexY = verticies[0].y - verticies[1].y + verticies[2].y
      const newCenterX = (verticies[0].x + verticies[2].x) / 2.0
      const newCenterY = (verticies[1].y + fourthVertexY) / 2.0
      const base = Math.sqrt(Math.pow((verticies[1].x - verticies[0].x), 2)
        + Math.pow((verticies[1].y - verticies[0].y), 2))

      const changeInX = verticies[1].x - verticies[0].x
      const changeInY = verticies[1].y - verticies[0].y
      const slope = changeInY / changeInX
      const yIntercept = slope * (-verticies[0].x) + verticies[0].y
      // dot product, reference : https://brilliant.org/wiki/dot-product-distance-between-point-and-a-line/
      const height = Math.abs(((-slope) * verticies[2].x) + verticies[2].y - yIntercept) / Math.sqrt(Math.pow(slope, 2) + 1)

      areaOfParallelogram = base * height
      const circleRadius = Math.sqrt(areaOfParallelogram / Math.PI)
      areaOfCircle = Math.pow(circleRadius, 2) * Math.PI
      content.arc(newCenterX, newCenterY, circleRadius, 0, 2 * Math.PI)
      // circle color = yellow
      content.strokeStyle = YELLOW
      content.stroke()
      break;

    case TOOLTIP:
      content.font = "12px Arial";
      content.fillText(`(${(center.x).toFixed(1)}, ${(center.y).toFixed(1)})`, center.x + 13, center.y + 13);
  }
  content.stroke()
  content.closePath()
}

function clearCanvas() {
  content.clearRect(0, 0, canvas.width, canvas.height)
}

function reset() {
  clearCanvas()
  dots.length = 0
  drawBoard()
  areaOfCircle = 0.0
  areaOfParallelogram = 0.0
  const parallelogramArea = document.querySelector(".parallelogramArea")
  parallelogramArea.innerHTML = ``
  const circleArea = document.querySelector(".circleArea")
  circleArea.innerHTML = ``

}

// to draw grid
// reference: https://stackoverflow.com/questions/11735856/draw-grid-table-on-canvas-html5
function drawBoard() {
  // Box width
  const bw = 1024
  // Box height
  const bh = 768
  // Padding
  const p = 0

  for (let x = 0; x <= bw; x += 25) {
    content.beginPath()
    content.moveTo(0.5 + x + p, p)
    content.lineTo(0.5 + x + p, bh + p)

    for (let x = 0; x <= bh; x += 25) {
      content.moveTo(p, 0.5 + x + p)
      content.lineTo(bw + p, 0.5 + x + p)
    }
    content.strokeStyle = "#c3c3c3"
    content.stroke()
    content.closePath()
  }
}


function drawShapes() {
  dots.forEach((value) => {
    drawGeometry(DOT, value)
    drawGeometry(TOOLTIP, value)
  })

  if (dots.length > 1) {
    for (let i = 0; i < dots.length - 1; i++) {
      drawGeometry(LINE, dots[i], dots[i + 1])
    }
  }

  if (dots.length === 3) {
    drawGeometry(PARALLELOGRAM, null, null, dots)
    drawGeometry(CIRCLE, null, null, dots)
  }
}

function drawDot() {
  isDraggingDot = true
  checkResult = checkMouseNearbyDot()
  if (dots.length < 3 && !checkResult) {
    dots.push(mousePosition)
  }
  drawShapes()
}

function checkMouseNearbyDot() {
  const sum = mousePosition.x + mousePosition.y
  let result = false

  for (let i = 0; i < dots.length; i++) {
    const dotMinMax = dots[i].x + dots[i].y
    if (dotMinMax - CIRCLE_RADIUS <= sum && sum <= dotMinMax + CIRCLE_RADIUS) {
      result = true
      nearbyDotIndex = i
      break
    }
  }
  return result
}

function dragDot(event) {
  getPosition(event)
  const msg = document.querySelector(".mouse_position")
  msg.innerHTML = `x: ${mousePosition.x.toFixed(3)}, y: ${mousePosition.y.toFixed(3)}`

  if (isDraggingDot) {
    dots[nearbyDotIndex] = mousePosition
    if (dots.length > 2) {
      const parallelogramArea = document.querySelector(".parallelogramArea")
      parallelogramArea.innerHTML = `${areaOfParallelogram.toFixed(2)}`
      const circleArea = document.querySelector(".circleArea")
      circleArea.innerHTML = `${areaOfCircle.toFixed(2)}`
    }
  }
  clearCanvas()
  drawBoard()
  drawShapes()
}

function doneDrawDot() {
  isDraggingDot = false
  nearbyDotIndex = -1
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

startCanvas()

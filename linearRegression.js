// Need to scale everything to between 0 and 1 in both axes, then convert back when we plot
// on the canvas


// The data we are loading
var training = [];

// Track the cost function output each iteration
var MSE = [] 

// What is the learning rate
const lrSlider = document.querySelector("#lrslider")
lrSlider.addEventListener('change', e => {
    document.querySelector('#lr').innerHTML = e.target.value
})

// Values of b and m for linear regression
// y = mx + b (formula for a line)
var b = 0;
var m = 0;

// Current number of iterations through data
var iterations = 0;


// A function to calculate the "loss"
// Formula for doing this is "sum of squared errors"
function costFunction() {
    sum = 0;
    for (let i = 0; i < training.length; i++) {
        // Guess according to the current line
        guess = m * training[i].x + b 
        // Error is the difference from the actual y value of our data
        error = guess - training[i].y 
        sum += error * error
    }

    let avg = sum / training.length
    
    // Return average error across all X values 
    return avg
}

function gradientDescent() {
    // Change in the y intecept
    let deltaB = 0;
    // Change in the slope of the line
    let deltaM = 0;

    // Iterate through training data, and update cost function
    for (let i = 0; i < training.length; i++) {
        let x = training[i].x
        let y = training[i].y
        let yguess = m * x + b
        let error = y - yguess
        // 
        deltaB += (1 / training.length) * error;
        deltaM += (1 / training.length) * error * x
    }

    let learning_rate = lrSlider.value
    
    b += (deltaB * learning_rate)
    m += (deltaM * learning_rate)

}

function handleClick(e) {
    const {clientX, clientY} = e
    const rect = dataPlot.getBoundingClientRect()
    
    let canvasX = clientX - rect.left
    let canvasY = clientY - rect.top

    // Convert canvas points to planar coordinates
    let {x, y} = convertPoint({x: canvasX, y: canvasY}, rect)
    
    // Scale to the interval [0,1]
    x = x / rect.width
    y = y / rect.height
    
    training.push({x,y})
    plotData()
}

function plotData() {
    const rect = dataPlot.getBoundingClientRect()
    let ctx = dataPlot.getContext('2d');

    for (let i = 0; i < training.length; i++) {
        let x = training[i].x * rect.width
        let y = training[i].y * rect.height
        let canvasPoint = convertPoint({x,y}, rect)
        ctx.beginPath()
        ctx.arc(canvasPoint.x, canvasPoint.y, 4, 0, 2 * Math.PI, true)
        ctx.fill();
    }
}

function plotCostFunction() {
    let rect = costFnPlot.getBoundingClientRect()
    let ctx = costFnPlot.getContext('2d');
    ctx.strokeStyle = 'red'
    ctx.lineWidth = '3'
    // Convert canvas points to planar coordinates
    const offset = 10
    let prevEndpoint;
    MSE.forEach((val, index) => {
        let canvasY = val * 1000 // Scale to make it easier to see

        let point = convertPoint({x:index * 20 + offset ,y:canvasY}, rect)

        if (index === 0) { 
            ctx.moveTo(point.x,point.y)
            prevEndpoint = point;
        }
        else {
            ctx.moveTo(prevEndpoint.x, prevEndpoint.y)
            ctx.lineTo(point.x, point.y)
            ctx.stroke()
            prevEndpoint = point;
        }
        
    })
}

function drawLine() {
    let rect = dataPlot.getBoundingClientRect()
    let ctx = dataPlot.getContext('2d');
    let lineStart = convertPoint({x:0,y:b*rect.height}, rect)
    let lineEnd = convertPoint({x:rect.width,y:((m * rect.width) + b * rect.height)}, rect)
    ctx.beginPath()
    ctx.moveTo(lineStart.x, lineStart.y)
    ctx.lineTo(lineEnd.x, lineEnd.y)
    ctx.strokeStyle = `rgb(${getRandomInt(0,256)},${getRandomInt(0,256)},${getRandomInt(0,256)})`
    ctx.stroke()
    ctx.closePath();
}

function clearLines() {
    clearCanvas(dataPlot)
    plotData()
}

function clearCanvas(canvas) {
    canvas.getContext('2d').clearRect(0,0, dataPlot.width, dataPlot.height);
}

// Utility functions for dealing with canvas coordinates

function convertPoint(point, canvas) { 
    let {x,y} = point
    y = canvas.height - y 
    return {x,y}
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

const costFnPlot = document.querySelector('#cost-fn')
costFnCtx = costFnPlot.getContext('2d')
costFnCtx.font = "15px Arial";
costFnCtx.fillText("Cost Function",10,25); 
const dataPlot = document.querySelector('#data-plot')
dataPlotCtx = dataPlot.getContext('2d')
dataPlotCtx.font = "15px Arial"; 
dataPlotCtx.fillText("Click to add some data",10,25);
dataPlot.addEventListener('click', handleClick)


const runBtn = document.querySelector('#run-btn')
runBtn.addEventListener('click', () => {
    if (training.length == 0) {
        return document.querySelector('#line-eqn').innerHTML = 'Try adding some data first';
    }
    let error = costFunction()
    MSE.push(error)
    plotCostFunction()
    gradientDescent()
    drawLine()
    document.querySelector('#line-eqn').innerHTML = `y = ${(m * 10).toPrecision(4)}x + ${(b * 10).toPrecision(4)}`
    document.querySelector('#error').innerHTML = `Current Mean Squared Error: ${error.toPrecision(3)}`
    iterations += 1
    document.querySelector('#it').innerHTML = iterations
})

const clearLinesBtn = document.querySelector('#clear-lines')
clearLinesBtn.addEventListener('click', clearLines)

const clearAllBtn = document.querySelector('#clear-all')
clearAllBtn.addEventListener('click', () => {
    clearCanvas(costFnPlot)
    clearCanvas(dataPlot)
    training = []
    MSE = []
    iterations = 0
    document.querySelector('#line-eqn').innerHTML = ''
})

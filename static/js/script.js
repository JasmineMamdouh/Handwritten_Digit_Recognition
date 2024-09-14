const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const resultDisplay = document.getElementById('result');
const thicknessSlider = document.getElementById('thicknessSlider');
const thicknessValueDisplay = document.getElementById('thicknessValue');

let drawing = false;
let penThickness = 20; // Default pen thickness

// Set the canvas background to black when the page loads
context.fillStyle = 'black'; // Set fill color to black
context.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black

// Update pen thickness based on slider value
thicknessSlider.addEventListener('input', (event) => {
    penThickness = event.target.value; // Get the current value of the slider
    thicknessValueDisplay.innerText = penThickness; // Display the current thickness value
});

// Start drawing when the mouse is pressed down
canvas.addEventListener('mousedown', (event) => {
    drawing = true;
    context.beginPath(); // Start a new path
    context.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop); // Move to the mouse position
});

// Stop drawing when the mouse is released
canvas.addEventListener('mouseup', () => {
    drawing = false;
    context.closePath(); // Close the path
});

// Draw on the canvas when the mouse is moved
canvas.addEventListener('mousemove', (event) => {
    if (!drawing) return; // If not drawing, exit the function
    context.lineWidth = penThickness;  // Set the pen width based on slider value
    context.lineCap = 'round'; // Make the line round
    context.strokeStyle = 'white';  // Set the pen color to white
    context.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop); // Draw to the current mouse position
    context.stroke(); // Apply the stroke
});

// Clear the canvas when the user wants to start over
document.getElementById('clearButton').addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    context.fillStyle = 'black'; // Set fill color to black
    context.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black
    resultDisplay.innerText = ''; // Clear the result display
});

// Predict the digit when the button is clicked
document.getElementById('predictButton').addEventListener('click', async () => {
    const dataUrl = canvas.toDataURL('image/png'); // Get the image data
    const response = await fetch('/predict', {
        method: 'POST',
        body: JSON.stringify({ image: dataUrl }),
        headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json(); // Get the prediction result
    
    // Display the predicted digit
    resultDisplay.innerText = `Predicted Digit: ${result.digit}`;
    
    // Draw the bounding box on the same canvas
    const boundingBox = result.bounding_box;
    if (boundingBox) {
        const x1 = boundingBox[0] * canvas.width; // Scale to canvas size
        const y1 = boundingBox[1] * canvas.height; // Scale to canvas size
        const x2 = (boundingBox[0] + boundingBox[2]) * canvas.width; // Scale to canvas size
        const y2 = (boundingBox[1] + boundingBox[3]) * canvas.height; // Scale to canvas size
        // Clear previous bounding box
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black'; // Fill the canvas with black again
        context.fillRect(0, 0, canvas.width, canvas.height); // Refill the canvas
        
        // Redraw the user's drawing
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            context.drawImage(img, 0, 0);
            // Draw the bounding box
            context.beginPath();
            context.rect(x1, y1, x2 - x1, y2 - y1); // Draw the rectangle
            context.strokeStyle = 'DeepPink'; // Set the stroke color
            context.lineWidth = 2; // Set the stroke width
            context.stroke(); // Draw the bounding box
        };
    }        
});
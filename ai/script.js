// Paste your Teachable Machine model URL inside the quotes below
const URL = https://teachablemachine.withgoogle.com/models/MEwjs_vTQ/ 

let model, webcam, labelContainer, maxPredictions;
let currentRoom = "start_room"; // Initial screen state

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; 
    webcam = new tmImage.Webcam(320, 240, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    // Append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

// Predict the webcam image and trigger room changes
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    let maxPrediction = "";
    let maxProbability = 0;

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        // Find the class with the highest confidence
        if (prediction[i].probability > maxProbability) {
            maxProbability = prediction[i].probability;
            maxPrediction = prediction[i].className;
        }
    }

    // If confidence is above 85%, check and change rooms
    if (maxProbability > 0.85) {
        if (maxPrediction === "pen") {
            changeRoom("pen_room");
        } else if (maxPrediction === "boottle") {
            changeRoom("bottle_room");
        } else if (maxPrediction === "phone") {
            changeRoom("phone_room");
        }
    }
}

// Main logic to switch game screens dynamically
function changeRoom(roomName) {
    if (currentRoom === roomName) return; // Prevent loop spamming
    
    console.log("Switching screen to: " + roomName);
    
    // Hide the previously active room
    document.getElementById(currentRoom).classList.add("hidden");
    
    // Show the new room
    document.getElementById(roomName).classList.remove("hidden");
    
    // Update global state tracker
    currentRoom = roomName;

    // Optional dynamic body background adjustments based on room
    if (roomName === "pen_room") document.body.style.backgroundColor = "#130f40";
    if (roomName === "bottle_room") document.body.style.backgroundColor = "#018374";
    if (roomName === "phone_room") document.body.style.backgroundColor = "#d35400";
}
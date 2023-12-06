const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
let img;
let isDrawing = false;
let boxes = []; // Array to store box coordinates

imageInput.addEventListener('change', function (event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      img = new Image();

      img.onload = function () {
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  }
});

// Function to draw a box on the canvas
function draw() {
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height);

  boxes.forEach(box => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.startX, box.startY, box.width, box.height);
  });
}

imageCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const startX = e.offsetX;
  const startY = e.offsetY;
  const box = { startX, startY, width: 0, height: 0 };
  boxes.push(box);
  draw();
});

imageCanvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    const currentBox = boxes[boxes.length - 1];
    currentBox.width = e.offsetX - currentBox.startX;
    currentBox.height = e.offsetY - currentBox.startY;
    draw();
  }
});

imageCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

// Example function to send box data to the backend via REST API
function sendBoxDataToBackend() {
  // Replace this section with your REST API endpoint and actual data to be sent
  // For demonstration, logging the box coordinates to the console
  console.log('Box Coordinates:');
  console.log(boxes);
  // Here, you can make an AJAX request (e.g., using Fetch or Axios) to send the data to the backend
}

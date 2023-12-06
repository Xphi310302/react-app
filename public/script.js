const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
let isDrawing = false;
let startX, startY, width, height;

imageInput.addEventListener('change', function (event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

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
  ctx.drawImage(img, 0, 0);

  if (isDrawing) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, width, height);
  }
}

imageCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
  width = 0;
  height = 0;
});

imageCanvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    width = e.offsetX - startX;
    height = e.offsetY - startY;
    draw();
  }
});

imageCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

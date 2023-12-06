const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
let img;
let isDragging = false; // Flag to track dragging action
let mouseX, mouseY;
let selectedBox = null;
let boxes = []; // Array to store box coordinates
let resizingBox = null; // Variable to track the box being resized

function draw() {
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height);

  boxes.forEach((box, index) => {
    ctx.strokeStyle = selectedBox === box ? 'blue' : 'red';
    ctx.lineWidth = 1;
    ctx.strokeRect(box.startX, box.startY, box.width, box.height);

    // Draw resize handles or additional UI elements if needed
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(box.startX + box.width, box.startY + box.height, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  if (resizingBox !== null) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(resizingBox.startX, resizingBox.startY, resizingBox.width, resizingBox.height);
  }
}

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

imageCanvas.addEventListener('mousedown', (e) => {
  const rect = imageCanvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const { type, boxIndex } = findHandle(mouseX, mouseY);

  if (type === 'resize') {
    isDragging = false;
    isResizing = true;
    resizingBox = boxes[boxIndex];
    selectedBox = resizingBox; // Select the box when clicking on the resize handle
  } else if (type === 'drag') {
    isDragging = true;
    selectedBox = boxes[boxIndex];
  } else {
    if (selectedBox !== null && selectedBox === boxes[boxIndex]) {
      // If the clicked box is already selected, deselect it
      selectedBox = null;
    } else {
      isDragging = true;
      const box = { startX: mouseX, startY: mouseY, width: 0, height: 0 };
      boxes.push(box);
      selectedBox = box;
    }
  }

  draw();
});


imageCanvas.addEventListener('mousemove', (e) => {
  const rect = imageCanvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  if (isDragging) {
    if (selectedBox !== null && !isResizing) {
      const dx = mouseX - selectedBox.startX;
      const dy = mouseY - selectedBox.startY;
      selectedBox.startX = mouseX;
      selectedBox.startY = mouseY;
      selectedBox.width -= dx;
      selectedBox.height -= dy;
    } else if (isResizing && resizingBox !== null) {
      resizingBox.width = Math.max(0, mouseX - resizingBox.startX);
      resizingBox.height = Math.max(0, mouseY - resizingBox.startY);
    }
    draw();
  }
});





imageCanvas.addEventListener('mouseup', () => {
  if (isDragging || isResizing) {
    isDragging = false;
    isResizing = false;
    resizingBox = null;
    draw();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Delete') {
    if (selectedBox !== null) {
      const index = boxes.indexOf(selectedBox);
      if (index !== -1) {
        boxes.splice(index, 1);
        selectedBox = null;
        draw();
      }
    }
  }
});

imageCanvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = imageCanvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  const boxIndex = findBox(mouseX, mouseY);
  if (boxIndex !== -1) {
    boxes.splice(boxIndex, 1);
    draw();
  }
});


function findHandle(x, y) {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const resizeHandleX = box.startX + box.width;
    const resizeHandleY = box.startY + box.height;

    // Check if the click is within the circle's region
    const distX = x - resizeHandleX;
    const distY = y - resizeHandleY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance <= 6) {
      return { type: 'resize', boxIndex: i };
    }

    if (
      x >= box.startX &&
      x <= box.startX + box.width &&
      y >= box.startY &&
      y <= box.startY + box.height
    ) {
      return { type: 'drag', boxIndex: i };
    }
  }
  return { type: 'none', boxIndex: -1 };
}

function findBox(x, y) {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    if (
      x >= box.startX &&
      x <= box.startX + box.width &&
      y >= box.startY &&
      y <= box.startY + box.height
    ) {
      return i;
    }
  }
  return -1;
}

const imageInput = document.getElementById('imageInput');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
let img;
let isDragging = false; // Flag to track dragging action
let mouseX, mouseY;
let selectedBox = null;
let boxes = []; // Array to store box coordinates
let resizingBox = null; // Variable to track the box being resized
let isResizing = false; // Flag to track resize status

function draw() {
  ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height);

  boxes.forEach((box, index) => {
    ctx.strokeStyle = selectedBox === box ? 'blue' : 'red';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(box.startX, box.startY, box.width, box.height);

	 // **Comment out the following code to remove the circle**
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(box.startX + box.width, box.startY + box.height, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

		if (selectedBox === box) {
			// Display text input for the selected box
			const text = box.text || '';
			const inputText = document.getElementById('textInput');
			inputText.value = text;
			inputText.style.display = 'block';
			inputText.style.top = `${box.startY + box.height + 5}px`; // Adjust text input position
			inputText.style.left = `${box.startX}px`; // Adjust text input position
		}
  });

  if (resizingBox !== null) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(resizingBox.startX, resizingBox.startY, resizingBox.width, resizingBox.height);
  }
}

// Adding an event listener to 'imageInput' element when a file is selected
imageInput.addEventListener('change', function (event) {
	// Retrieving the selected file
	const file = event.target.files[0];
  
	// Checking if a file is selected
	if (file) {
	  // Creating a new instance of FileReader
	  const reader = new FileReader();
  
	  // Event triggered when FileReader finishes reading the file
	  reader.onload = function (e) {
		// Creating a new Image object
		img = new Image();
  
		// Event triggered when the image has finished loading
		img.onload = function () {
		  // Setting the canvas dimensions to match the loaded image
		  imageCanvas.width = img.width;
		  imageCanvas.height = img.height;
		  
		  // Drawing the image on the canvas
		  ctx.drawImage(img, 0, 0, img.width, img.height);
		};
  
		// Setting the source of the image to the result of FileReader
		img.src = e.target.result;
	  };
  
	  // Reading the selected file as a data URL
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
		// Update text for the selected box
		const inputText = document.getElementById('textInput');
		if (selectedBox !== null && inputText.value.trim() !== '') {
			selectedBox.text = inputText.value.trim();
			inputText.style.display = 'none'; // Hide text input after saving text
		}

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

function findHandle(x, y) {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    
    let topLeftX, topLeftY, bottomRightX, bottomRightY;
    if (box.width >= 0 && box.height >= 0) {
      topLeftX = box.startX;
      topLeftY = box.startY;
      bottomRightX = box.startX + box.width;
      bottomRightY = box.startY + box.height;
    } else {
      bottomRightX = box.startX;
      bottomRightY = box.startY;
      topLeftX = box.startX + box.width;
      topLeftY = box.startY + box.height;
    }

    // Calculate the center of the circle (resize handle)
    const centerX = bottomRightX;
    const centerY = bottomRightY;

    // Check if the click is within the circle's region
    const distX = x - centerX;
    const distY = y - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance <= 6) {
      return { type: 'resize', boxIndex: i };
    }

    if (
      x >= topLeftX &&
      x <= bottomRightX &&
      y >= topLeftY &&
      y <= bottomRightY
    ) {
      return { type: 'drag', boxIndex: i };
    }
  }
  return { type: 'none', boxIndex: -1 };
}

// // Function to save boxes to a JSON file
function saveBoxes() {
  // Save boxes along with their associated text
  const boxesToSave = boxes.map(box => ({
    startX: box.startX,
    startY: box.startY,
    width: box.width,
    height: box.height,
    text: box.text || '' // Ensure text property exists or set it to an empty string
  }));

  const dataToSave = JSON.stringify(boxesToSave);
  const blob = new Blob([dataToSave], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'boxes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function loadBoxes(event) {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const loadedData = JSON.parse(e.target.result);

      // Load boxes with their associated text
      boxes = loadedData.map(data => ({
        startX: data.startX,
        startY: data.startY,
        width: data.width,
        height: data.height,
        text: data.text || '' // Ensure text property exists or set it to an empty string
      }));

      draw();
    };

    reader.readAsText(file);
  }
}

// Event listener for the text input field to update box text on pressing Enter
const inputText = document.getElementById('textInput');
inputText.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    if (selectedBox !== null && inputText.value.trim() !== '') {
      selectedBox.text = inputText.value.trim();
      inputText.style.display = 'none'; // Hide text input after saving text
      draw();
    }
  }
});

// Event listener for input element to load JSON file
const loadInput = document.getElementById('loadInput');
loadInput.addEventListener('change', loadBoxes);

// Event listener for saving boxes when a button is clicked
const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', saveBoxes);

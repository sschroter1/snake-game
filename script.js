// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Define the size of each grid cell
const gridSize = 20;

// Initialize snake
let snake = [
    { x: 9 * gridSize, y: 9 * gridSize },
    { x: 8 * gridSize, y: 9 * gridSize },
    { x: 7 * gridSize, y: 9 * gridSize }
];

// Initialize direction
let dx = gridSize; // Moving right initially
let dy = 0;

// Initialize obstacles
let obstacles = generateObstacles();

// Initialize food
let food = generateFood();

// Initialize score
let score = 0;

// Initialize high score
let highScore = localStorage.getItem('highScore') || 0;
updateScore();

// Game speed (milliseconds)
let gameSpeed = 200;
let gameInterval;

// Listen for keyboard events
document.addEventListener('keydown', changeDirection);

// Start the game
startGame();

// Functions

function startGame() {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    moveSnake();
    if (checkCollision()) {
        clearInterval(gameInterval);
        alert(`Game Over! Your final score was: ${score}`);
        resetGame();
        return;
    }
    if (checkFoodCollision()) {
        score++;
        updateScore();
        food = generateFood();
        // Increase speed every 5 points
        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop(); // Remove the tail
    }
    drawEverything();
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Screen wrapping
    if (head.x >= canvasWidth) {
        head.x = 0;
    } else if (head.x < 0) {
        head.x = canvasWidth - gridSize;
    }

    if (head.y >= canvasHeight) {
        head.y = 0;
    } else if (head.y < 0) {
        head.y = canvasHeight - gridSize;
    }

    snake.unshift(head);
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    // Prevent the snake from reversing
    if (keyPressed === LEFT && dx === 0) {
        dx = -gridSize;
        dy = 0;
    }
    if (keyPressed === UP && dy === 0) {
        dx = 0;
        dy = -gridSize;
    }
    if (keyPressed === RIGHT && dx === 0) {
        dx = gridSize;
        dy = 0;
    }
    if (keyPressed === DOWN && dy === 0) {
        dx = 0;
        dy = gridSize;
    }
}

function checkCollision() {
    // Check collision with self
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }

    // Check collision with obstacles
    for (let obstacle of obstacles) {
        if (snake[0].x === obstacle.x && snake[0].y === obstacle.y) {
            return true;
        }
    }

    return false;
}

function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        return true;
    }
    return false;
}

function generateFood() {
    let newFood;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        newFood = {
            x: Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize
        };
        if (!isOccupied(newFood, snake) && !isOccupied(newFood, obstacles)) {
            return newFood;
        }
        attempts++;
    }
    // If unable to place food, return null
    return null;
}

function generateObstacles() {
    let obs = [];
    const numObstacles = Math.floor((canvasWidth / gridSize) / 5);
    let attempts = 0;
    const maxAttempts = numObstacles * 10;

    while (obs.length < numObstacles && attempts < maxAttempts) {
        let obstacle = {
            x: Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize
        };
        if (!isOccupied(obstacle, snake) && !isOccupied(obstacle, obs)) {
            obs.push(obstacle);
        }
        attempts++;
    }

    return obs;
}

function isOccupied(position, segments) {
    for (let segment of segments) {
        if (segment.x === position.x && segment.y === position.y) {
            return true;
        }
    }
    return false;
}

function drawEverything() {
    // Clear the canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the snake
    ctx.fillStyle = '#28a745';
    for (let segment of snake) {
        ctx.fillRect(segment.x, segment.y, gridSize - 2, gridSize - 2);
    }

    // Draw the food
    if (food) {
        ctx.fillStyle = '#dc3545';
        ctx.fillRect(food.x, food.y, gridSize - 2, gridSize - 2);
    }

    // Draw obstacles
    ctx.fillStyle = '#6c757d';
    for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, gridSize - 2, gridSize - 2);
    }
}

function updateScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('score').innerText = `Score: ${score} | High Score: ${highScore}`;
}

function resetGame() {
    // Reset variables
    snake = [
        { x: 9 * gridSize, y: 9 * gridSize },
        { x: 8 * gridSize, y: 9 * gridSize },
        { x: 7 * gridSize, y: 9 * gridSize }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    updateScore();
    food = generateFood();
    obstacles = generateObstacles();
    if (!food) {
        alert("You Win! No more space.");
        return;
    }
    drawEverything();
    startGame();
}
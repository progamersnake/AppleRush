class AppleRushGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.basket = document.getElementById('basket');
        this.scoreDisplay = document.getElementById('score');
        this.livesDisplay = document.getElementById('lives');
        this.levelDisplay = document.getElementById('level');
        this.statusDisplay = document.getElementById('gameStatus');
        this.startBtn = document.getElementById('startBtn');
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameRunning = false;
        this.basketX = this.gameArea.offsetWidth / 2 - 30;
        this.apples = [];
        this.applesPerLevel = 5;
        this.applesSpawned = 0;
        this.applesFallen = 0;
        
        this.keys = {};
        this.gameSpeed = 3000;
        this.spawnInterval = null;
        this.gameLoopInterval = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.startBtn.addEventListener('click', () => this.startGame());
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.startBtn.textContent = 'Restart Game';
        this.startBtn.disabled = true;
        this.statusDisplay.textContent = 'Game Started!';
        
        this.spawnApples();
        this.gameLoopInterval = setInterval(() => this.gameLoop(), 30);
    }
    
    spawnApples() {
        let spawned = 0;
        const spawnRate = 500; // ms between spawns
        
        this.spawnInterval = setInterval(() => {
            if (spawned >= this.applesPerLevel) {
                clearInterval(this.spawnInterval);
                return;
            }
            
            this.createApple();
            spawned++;
        }, spawnRate);
    }
    
    createApple() {
        const apple = document.createElement('div');
        apple.className = 'apple';
        apple.textContent = '🍎';
        
        const x = Math.random() * (this.gameArea.offsetWidth - 30);
        const duration = 4000 / (1 + this.level * 0.3);
        
        apple.style.left = x + 'px';
        apple.style.top = '-30px';
        apple.style.animationDuration = duration + 'ms';
        
        const appleObj = {
            element: apple,
            x: x,
            y: -30,
            vx: 0,
            vy: (this.gameArea.offsetHeight + 30) / (duration / 1000),
            caught: false
        };
        
        apple.addEventListener('click', () => this.catchApple(appleObj));
        
        this.gameArea.appendChild(apple);
        this.apples.push(appleObj);
    }
    
    catchApple(appleObj) {
        if (appleObj.caught) return;
        
        appleObj.caught = true;
        appleObj.element.style.animation = 'none';
        appleObj.element.style.transform = 'scale(0) rotate(360deg)';
        appleObj.element.style.transition = 'all 0.3s ease';
        
        this.score += 10 * this.level;
        this.updateDisplay();
        
        setTimeout(() => {
            appleObj.element.remove();
        }, 300);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        // Move basket
        const moveSpeed = 10;
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.basketX = Math.max(0, this.basketX - moveSpeed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.basketX = Math.min(this.gameArea.offsetWidth - 60, this.basketX + moveSpeed);
        }
        
        this.basket.style.left = this.basketX + 'px';
        
        // Check collisions
        this.apples.forEach((apple, index) => {
            if (apple.caught) return;
            
            const appleRect = apple.element.getBoundingClientRect();
            const basketRect = this.basket.getBoundingClientRect();
            const gameAreaRect = this.gameArea.getBoundingClientRect();
            
            // Check if apple passed basket
            if (apple.element.offsetTop > this.gameArea.offsetHeight) {
                apple.element.remove();
                this.apples.splice(index, 1);
                this.lives--;
                this.applesFallen++;
                this.updateDisplay();
                
                if (this.lives <= 0) {
                    this.endGame();
                }
                return;
            }
            
            // Check if caught
            if (this.checkCollision(appleRect, basketRect, gameAreaRect)) {
                this.catchApple(apple);
            }
        });
        
        // Check if level is complete
        if (this.applesSpawned >= this.applesPerLevel && this.apples.length === 0) {
            this.nextLevel();
        }
    }
    
    checkCollision(appleRect, basketRect, gameAreaRect) {
        return (
            appleRect.left < basketRect.right &&
            appleRect.right > basketRect.left &&
            appleRect.top < basketRect.bottom &&
            appleRect.bottom > basketRect.top
        );
    }
    
    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.livesDisplay.textContent = this.lives;
        this.levelDisplay.textContent = this.level;
    }
    
    nextLevel() {
        this.level++;
        this.applesPerLevel = 5 + this.level * 2;
        this.applesSpawned = 0;
        this.applesFallen = 0;
        this.statusDisplay.textContent = `Level ${this.level}! 🎉`;
        
        setTimeout(() => {
            this.spawnApples();
        }, 1500);
    }
    
    endGame() {
        this.gameRunning = false;
        clearInterval(this.spawnInterval);
        clearInterval(this.gameLoopInterval);
        
        this.statusDisplay.textContent = `Game Over! Final Score: ${this.score} | Level Reached: ${this.level}`;
        this.startBtn.disabled = false;
        
        this.apples.forEach(apple => {
            apple.element.remove();
        });
        this.apples = [];
        
        // Reset for new game
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.updateDisplay();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new AppleRushGame();
});
import { 
  Ball, 
  Paddle, 
  MeetingBlock, 
  PowerUp, 
  Particle, 
  GameState, 
  GameStats, 
  Level,
  PowerUpType,
  MeetingType 
} from '../types/GameTypes';
import { Physics } from './Physics';
import { ParticleSystem } from './ParticleSystem';
import { LevelManager } from './LevelManager';
import { AudioManager } from './AudioManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private physics: Physics;
  private particles: ParticleSystem;
  private levelManager: LevelManager;
  private audio: AudioManager;
  
  private gameState: GameState = GameState.MENU;
  private gameStats: GameStats;
  private currentLevel: Level;
  
  private ball: Ball;
  private paddle: Paddle;
  private meetingBlocks: MeetingBlock[] = [];
  private powerUps: PowerUp[] = [];
  private activePowerUps: PowerUpType[] = [];
  
  private keys: { [key: string]: boolean } = {};
  private lastTime = 0;
  private animationFrame: number | null = null;
  
  private readonly PADDLE_SPEED = 8;
  private readonly BALL_SPEED_BASE = 6;
  private readonly CANVAS_WIDTH = 1000;
  private readonly CANVAS_HEIGHT = 700;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.physics = new Physics();
    this.particles = new ParticleSystem();
    this.levelManager = new LevelManager();
    this.audio = new AudioManager();
    
    this.setupCanvas();
    this.initializeGame();
    this.setupEventListeners();
  }

  private setupCanvas(): void {
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    this.ctx.imageSmoothingEnabled = true;
  }

  private initializeGame(): void {
    this.gameStats = {
      score: 0,
      level: 1,
      lives: 3,
      meetingsCancelled: 0,
      powerUpsCollected: 0,
      timeElapsed: 0
    };

    this.currentLevel = this.levelManager.getLevel(1);
    this.resetGameObjects();
  }

  private resetGameObjects(): void {
    // Initialize paddle
    this.paddle = {
      position: { 
        x: this.CANVAS_WIDTH / 2 - 60, 
        y: this.CANVAS_HEIGHT - 40 
      },
      dimensions: { width: 120, height: 12 },
      velocity: 0
    };

    // Initialize ball
    this.ball = {
      position: { 
        x: this.CANVAS_WIDTH / 2, 
        y: this.CANVAS_HEIGHT - 60 
      },
      velocity: { x: 4, y: -this.currentLevel.ballSpeed },
      radius: 8,
      trail: []
    };

    // Load meeting blocks from current level
    this.meetingBlocks = [...this.currentLevel.meetings];
    this.powerUps = [];
    this.activePowerUps = [];
    
    // Ensure paddle is reset to default size
    this.paddle.dimensions.width = 120;
    this.activePowerUps = [];
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        this.handleSpacePress();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Touch/mouse controls for mobile
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * (this.CANVAS_WIDTH / rect.width);
      this.paddle.position.x = Math.max(0, Math.min(this.CANVAS_WIDTH - this.paddle.dimensions.width, x - this.paddle.dimensions.width / 2));
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.gameState === GameState.PLAYING) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.CANVAS_WIDTH / rect.width);
        this.paddle.position.x = Math.max(0, Math.min(this.CANVAS_WIDTH - this.paddle.dimensions.width, x - this.paddle.dimensions.width / 2));
      }
    });
  }

  private handleSpacePress(): void {
    switch (this.gameState) {
      case GameState.MENU:
        this.startGame();
        break;
      case GameState.PLAYING:
        this.togglePause();
        break;
      case GameState.PAUSED:
        this.togglePause();
        break;
      case GameState.GAME_OVER:
      case GameState.LEVEL_COMPLETE:
        this.restartGame();
        break;
    }
  }

  public startGame(): void {
    this.gameState = GameState.PLAYING;
    this.start();
  }

  public togglePause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
    }
  }

  public restartGame(): void {
    this.initializeGame();
    this.startGame();
  }

  public start(): void {
    this.gameLoop(0);
  }

  public stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private gameLoop = (currentTime: number): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.gameState === GameState.PLAYING) {
      this.update(deltaTime);
    }
    
    this.render();
    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    this.updatePaddle();
    this.updateBall();
    this.updatePowerUps(deltaTime);
    this.particles.update(deltaTime);
    this.checkCollisions();
    this.checkGameConditions();
    this.gameStats.timeElapsed += deltaTime;
  }

  private updatePaddle(): void {
    let paddleVelocity = 0;
    
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      paddleVelocity = -this.PADDLE_SPEED;
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      paddleVelocity = this.PADDLE_SPEED;
    }

    this.paddle.position.x += paddleVelocity;
    this.paddle.position.x = Math.max(0, Math.min(this.CANVAS_WIDTH - this.paddle.dimensions.width, this.paddle.position.x));
  }

  private updateBall(): void {
    // Update ball trail
    this.ball.trail.unshift({ ...this.ball.position });
    if (this.ball.trail.length > 8) {
      this.ball.trail.pop();
    }

    // Update ball position
    this.ball.position.x += this.ball.velocity.x;
    this.ball.position.y += this.ball.velocity.y;

    // Constrain ball velocity to prevent excessive speed
    this.physics.constrainBallVelocity(this.ball, this.currentLevel.ballSpeed * 1.5);

    // Wall collisions
    if (this.ball.position.x <= this.ball.radius || this.ball.position.x >= this.CANVAS_WIDTH - this.ball.radius) {
      this.ball.velocity.x *= -1;
      this.audio.playSound('wall-bounce');
    }
    
    if (this.ball.position.y <= this.ball.radius) {
      this.ball.velocity.y *= -1;
      this.audio.playSound('wall-bounce');
    }

    // Ball out of bounds (bottom)
    if (this.ball.position.y > this.CANVAS_HEIGHT + 50) {
      this.loseLife();
    }
  }

  private updatePowerUps(deltaTime: number): void {
    this.powerUps.forEach((powerUp, index) => {
      powerUp.position.y += powerUp.velocity.y;
      
      // Remove if out of bounds
      if (powerUp.position.y > this.CANVAS_HEIGHT) {
        this.powerUps.splice(index, 1);
      }
    });
  }

  private checkCollisions(): void {
    // Ball-paddle collision
    if (this.physics.checkBallPaddleCollision(this.ball, this.paddle)) {
      this.handlePaddleCollision();
    }

    // Ball-meeting block collisions
    this.meetingBlocks.forEach((block, blockIndex) => {
      if (this.physics.checkBallBlockCollision(this.ball, block)) {
        this.handleMeetingBlockCollision(block, blockIndex);
      }
    });

    // Paddle-power-up collisions
    this.powerUps.forEach((powerUp, powerUpIndex) => {
      if (this.physics.checkPaddlePowerUpCollision(this.paddle, powerUp)) {
        this.collectPowerUp(powerUp);
        this.powerUps.splice(powerUpIndex, 1);
      }
    });
  }

  private handlePaddleCollision(): void {
    const paddleCenter = this.paddle.position.x + this.paddle.dimensions.width / 2;
    const ballCenter = this.ball.position.x;
    const hitPosition = (ballCenter - paddleCenter) / (this.paddle.dimensions.width / 2);
    
    this.ball.velocity.x = hitPosition * 5;
    this.ball.velocity.y = -Math.abs(this.ball.velocity.y);
    this.audio.playSound('paddle-bounce');
  }

  private handleMeetingBlockCollision(block: MeetingBlock, index: number): void {
    block.hits++;
    
    // Create particles
    this.particles.createExplosion(
      block.position.x + block.dimensions.width / 2,
      block.position.y + block.dimensions.height / 2,
      block.color
    );

    if (block.hits >= block.maxHits) {
      // Meeting cancelled!
      this.meetingBlocks.splice(index, 1);
      this.gameStats.score += this.calculateScore(block.type);
      this.gameStats.meetingsCancelled++;
      
      // Chance to spawn power-up
      if (Math.random() < this.currentLevel.powerUpChance) {
        this.spawnPowerUp(block.position);
      }
      
      this.audio.playSound('meeting-cancelled');
    } else {
      this.audio.playSound('meeting-hit');
    }

    // Reflect ball
    this.ball.velocity.y *= -1;
  }

  private calculateScore(meetingType: MeetingType): number {
    const scoreMap = {
      [MeetingType.STANDUP]: 100,
      [MeetingType.ONE_ON_ONE]: 150,
      [MeetingType.TEAM_MEETING]: 200,
      [MeetingType.REVIEW]: 250,
      [MeetingType.PLANNING]: 300,
      [MeetingType.ALL_HANDS]: 500
    };
    return scoreMap[meetingType] || 100;
  }

  private spawnPowerUp(position: { x: number; y: number }): void {
    const powerUpTypes = Object.values(PowerUpType);
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    const powerUp: PowerUp = {
      id: `powerup-${Date.now()}`,
      position: { x: position.x, y: position.y },
      velocity: { x: 0, y: 2 },
      type: randomType,
      dimensions: { width: 24, height: 24 },
      active: false
    };
    
    this.powerUps.push(powerUp);
  }

  private collectPowerUp(powerUp: PowerUp): void {
    this.activePowerUps.push(powerUp.type);
    this.gameStats.powerUpsCollected++;
    this.applyPowerUp(powerUp.type);
    this.audio.playSound('power-up');
  }

  private applyPowerUp(type: PowerUpType): void {
    switch (type) {
      case PowerUpType.WIDE_PADDLE:
        this.paddle.dimensions.width = Math.min(200, this.paddle.dimensions.width * 1.5);
        setTimeout(() => this.removePowerUp(type), 10000);
        break;
      case PowerUpType.COFFEE_BREAK:
        // Slow down ball
        this.ball.velocity.x *= 0.7;
        this.ball.velocity.y *= 0.7;
        setTimeout(() => this.removePowerUp(type), 8000);
        break;
      case PowerUpType.SCHEDULE_CLEAR:
        // Clear 3 random meetings
        for (let i = 0; i < 3 && this.meetingBlocks.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * this.meetingBlocks.length);
          const block = this.meetingBlocks[randomIndex];
          this.particles.createExplosion(
            block.position.x + block.dimensions.width / 2,
            block.position.y + block.dimensions.height / 2,
            block.color
          );
          this.meetingBlocks.splice(randomIndex, 1);
          this.gameStats.score += this.calculateScore(block.type);
        }
        break;
    }
  }

  private removePowerUp(type: PowerUpType): void {
    const index = this.activePowerUps.indexOf(type);
    if (index > -1) {
      this.activePowerUps.splice(index, 1);
      
      switch (type) {
        case PowerUpType.WIDE_PADDLE:
          this.paddle.dimensions.width = 120;
          break;
        case PowerUpType.COFFEE_BREAK:
          // Restore ball speed
          const speedMultiplier = 1 / 0.7;
          this.ball.velocity.x *= speedMultiplier;
          this.ball.velocity.y *= speedMultiplier;
          break;
      }
    }
  }

  private checkGameConditions(): void {
    // Check if all meetings are cancelled
    if (this.meetingBlocks.length === 0) {
      this.levelComplete();
    }
  }

  private levelComplete(): void {
    this.gameState = GameState.LEVEL_COMPLETE;
    this.gameStats.level++;
    this.audio.playSound('level-complete');
    
    setTimeout(() => {
      this.loadNextLevel();
    }, 2000);
  }

  private loadNextLevel(): void {
    this.currentLevel = this.levelManager.getLevel(this.gameStats.level);
    if (this.currentLevel) {
      this.resetGameObjects();
      this.gameState = GameState.PLAYING;
    } else {
      this.gameState = GameState.VICTORY;
    }
  }

  private loseLife(): void {
    this.gameStats.lives--;
    
    // Clear all active power-ups before any other actions
    const activePowerUpsCopy = [...this.activePowerUps];
    activePowerUpsCopy.forEach(powerUpType => {
      this.removePowerUp(powerUpType);
    });
    this.activePowerUps = [];
    
    // Reset paddle to default size
    this.paddle.dimensions.width = 120;
    
    if (this.gameStats.lives <= 0) {
      this.gameState = GameState.GAME_OVER;
      this.audio.playSound('game-over');
    } else {
      // Reset ball position
      this.ball.position = { 
        x: this.CANVAS_WIDTH / 2, 
        y: this.CANVAS_HEIGHT - 60 
      };
      this.ball.velocity = { x: 4, y: -this.currentLevel.ballSpeed };
      this.audio.playSound('life-lost');
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Render calendar grid
    this.renderCalendarGrid();
    
    // Render game objects
    this.renderMeetingBlocks();
    this.renderBall();
    this.renderPaddle();
    this.renderPowerUps();
    this.particles.render(this.ctx);
    
    // Render UI
    this.renderUI();
    this.renderGameStateOverlay();
  }

  private renderCalendarGrid(): void {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dates = ['11', '12', '13', '14', '15', '16', '17'];
    
    // Header background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, 80);
    
    // Header border
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 80);
    this.ctx.lineTo(this.CANVAS_WIDTH, 80);
    this.ctx.stroke();
    
    // Draw day headers
    const dayWidth = this.CANVAS_WIDTH / 7;
    days.forEach((day, index) => {
      const x = index * dayWidth;
      
      // Day name
      this.ctx.fillStyle = '#64748b';
      this.ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(day, x + dayWidth / 2, 25);
      
      // Date
      this.ctx.fillStyle = '#1e293b';
      this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
      this.ctx.fillText(dates[index], x + dayWidth / 2, 55);
      
      // Vertical separators
      if (index > 0) {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, 80);
        this.ctx.stroke();
      }
    });
    
    // Draw time grid lines
    this.ctx.strokeStyle = '#f1f5f9';
    this.ctx.lineWidth = 0.5;
    
    for (let i = 1; i < 7; i++) {
      const x = i * dayWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 80);
      this.ctx.lineTo(x, this.CANVAS_HEIGHT - 60);
      this.ctx.stroke();
    }
    
    for (let i = 1; i < 12; i++) {
      const y = 80 + (i * (this.CANVAS_HEIGHT - 140) / 12);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.CANVAS_WIDTH, y);
      this.ctx.stroke();
    }
  }

  private renderMeetingBlocks(): void {
    this.meetingBlocks.forEach(block => {
      // Block shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.fillRect(
        block.position.x + 2, 
        block.position.y + 2, 
        block.dimensions.width, 
        block.dimensions.height
      );
      
      // Block background
      this.ctx.fillStyle = block.color;
      this.ctx.fillRect(
        block.position.x, 
        block.position.y, 
        block.dimensions.width, 
        block.dimensions.height
      );
      
      // Block border
      this.ctx.strokeStyle = this.darkenColor(block.color, 20);
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(
        block.position.x, 
        block.position.y, 
        block.dimensions.width, 
        block.dimensions.height
      );
      
      // Meeting title
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(
        block.title, 
        block.position.x + 8, 
        block.position.y + 18
      );
      
      // Health indicator
      if (block.maxHits > 1) {
        const healthWidth = (block.dimensions.width - 16) * ((block.maxHits - block.hits) / block.maxHits);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(
          block.position.x + 8, 
          block.position.y + block.dimensions.height - 6, 
          healthWidth, 
          2
        );
      }
    });
  }

  private renderBall(): void {
    // Ball trail
    this.ball.trail.forEach((pos, index) => {
      const alpha = (this.ball.trail.length - index) / this.ball.trail.length;
      this.ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.3})`;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, this.ball.radius * alpha, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Main ball
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.position.x, this.ball.position.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Ball highlight
    this.ctx.fillStyle = '#60a5fa';
    this.ctx.beginPath();
    this.ctx.arc(
      this.ball.position.x - 2, 
      this.ball.position.y - 2, 
      this.ball.radius * 0.4, 
      0, 
      Math.PI * 2
    );
    this.ctx.fill();
  }

  private renderPaddle(): void {
    // Paddle shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(
      this.paddle.position.x + 2, 
      this.paddle.position.y + 2, 
      this.paddle.dimensions.width, 
      this.paddle.dimensions.height
    );
    
    // Paddle gradient
    const gradient = this.ctx.createLinearGradient(
      this.paddle.position.x, 
      this.paddle.position.y,
      this.paddle.position.x, 
      this.paddle.position.y + this.paddle.dimensions.height
    );
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(1, '#3730a3');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      this.paddle.position.x, 
      this.paddle.position.y, 
      this.paddle.dimensions.width, 
      this.paddle.dimensions.height
    );
    
    // Paddle border
    this.ctx.strokeStyle = '#312e81';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.paddle.position.x, 
      this.paddle.position.y, 
      this.paddle.dimensions.width, 
      this.paddle.dimensions.height
    );
  }

  private renderPowerUps(): void {
    this.powerUps.forEach(powerUp => {
      // Power-up glow
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.shadowBlur = 10;
      
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillRect(
        powerUp.position.x, 
        powerUp.position.y, 
        powerUp.dimensions.width, 
        powerUp.dimensions.height
      );
      
      this.ctx.shadowBlur = 0;
      
      // Power-up icon (simplified)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        '⚡', 
        powerUp.position.x + powerUp.dimensions.width / 2, 
        powerUp.position.y + powerUp.dimensions.height / 2 + 4
      );
    });
  }

  private renderUI(): void {
    // Score panel
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.fillRect(10, 10, 300, 60);
    
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(10, 10, 300, 60);
    
    this.ctx.fillStyle = '#1e293b';
    this.ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.gameStats.score}`, 20, 30);
    this.ctx.fillText(`Level: ${this.gameStats.level}`, 20, 50);
    this.ctx.fillText(`Lives: ${this.gameStats.lives}`, 150, 30);
    this.ctx.fillText(`Meetings: ${this.gameStats.meetingsCancelled}`, 150, 50);
  }

  private renderGameStateOverlay(): void {
    if (this.gameState === GameState.MENU) {
      this.renderMenuScreen();
    } else if (this.gameState === GameState.PAUSED) {
      this.renderPausedScreen();
    } else if (this.gameState === GameState.GAME_OVER) {
      this.renderGameOverScreen();
    } else if (this.gameState === GameState.LEVEL_COMPLETE) {
      this.renderLevelCompleteScreen();
    } else if (this.gameState === GameState.VICTORY) {
      this.renderVictoryScreen();
    }
  }

  private renderMenuScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Calendar Breaker', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 100);
    
    this.ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Clear your schedule by cancelling meetings!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);
    
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Press SPACE to start', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 50);
    this.ctx.fillText('Use arrow keys or mouse to move paddle', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 80);
  }

  private renderPausedScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Meeting Paused', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
    
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Press SPACE to resume', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 40);
  }

  private renderGameOverScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#ef4444';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Schedule Overload!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText(`Final Score: ${this.gameStats.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);
    this.ctx.fillText(`Meetings Cancelled: ${this.gameStats.meetingsCancelled}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 50);
    
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Press SPACE to try again', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 100);
  }

  private renderLevelCompleteScreen(): void {
    this.ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Week Cleared!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
    
    this.ctx.font = '18px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('Preparing next week...', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 40);
  }

  private renderVictoryScreen(): void {
    this.ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Calendar Master!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 50);
    
    this.ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.fillText('You\'ve achieved perfect work-life balance!', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);
    this.ctx.fillText(`Final Score: ${this.gameStats.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 60);
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  public getCurrentState(): GameState {
    return this.gameState;
  }

  public getStats(): GameStats {
    return { ...this.gameStats };
  }
}
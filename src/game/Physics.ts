import { Ball, Paddle, MeetingBlock, PowerUp } from '../types/GameTypes';

export class Physics {
  public checkBallPaddleCollision(ball: Ball, paddle: Paddle): boolean {
    return (
      ball.position.x + ball.radius >= paddle.position.x &&
      ball.position.x - ball.radius <= paddle.position.x + paddle.dimensions.width &&
      ball.position.y + ball.radius >= paddle.position.y &&
      ball.position.y - ball.radius <= paddle.position.y + paddle.dimensions.height &&
      ball.velocity.y > 0 // Only collide when ball is moving down
    );
  }

  public checkBallBlockCollision(ball: Ball, block: MeetingBlock): boolean {
    const ballLeft = ball.position.x - ball.radius;
    const ballRight = ball.position.x + ball.radius;
    const ballTop = ball.position.y - ball.radius;
    const ballBottom = ball.position.y + ball.radius;

    const blockLeft = block.position.x;
    const blockRight = block.position.x + block.dimensions.width;
    const blockTop = block.position.y;
    const blockBottom = block.position.y + block.dimensions.height;

    return (
      ballRight >= blockLeft &&
      ballLeft <= blockRight &&
      ballBottom >= blockTop &&
      ballTop <= blockBottom
    );
  }

  public checkPaddlePowerUpCollision(paddle: Paddle, powerUp: PowerUp): boolean {
    return (
      powerUp.position.x + powerUp.dimensions.width >= paddle.position.x &&
      powerUp.position.x <= paddle.position.x + paddle.dimensions.width &&
      powerUp.position.y + powerUp.dimensions.height >= paddle.position.y &&
      powerUp.position.y <= paddle.position.y + paddle.dimensions.height
    );
  }

  public calculateBallReflection(ball: Ball, block: MeetingBlock): void {
    const ballCenterX = ball.position.x;
    const ballCenterY = ball.position.y;
    
    const blockCenterX = block.position.x + block.dimensions.width / 2;
    const blockCenterY = block.position.y + block.dimensions.height / 2;
    
    const deltaX = ballCenterX - blockCenterX;
    const deltaY = ballCenterY - blockCenterY;
    
    // Determine which side of the block was hit
    const overlapX = (block.dimensions.width / 2 + ball.radius) - Math.abs(deltaX);
    const overlapY = (block.dimensions.height / 2 + ball.radius) - Math.abs(deltaY);
    
    if (overlapX < overlapY) {
      // Hit from left or right
      ball.velocity.x *= -1;
    } else {
      // Hit from top or bottom
      ball.velocity.y *= -1;
    }
  }

  public constrainBallVelocity(ball: Ball, maxSpeed: number): void {
    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2);
    console.log(`Physics constraint - Input speed: ${speed.toFixed(2)}, Max speed: ${maxSpeed.toFixed(2)}`);
    
    if (speed > maxSpeed) {
      ball.velocity.x = (ball.velocity.x / speed) * maxSpeed;
      ball.velocity.y = (ball.velocity.y / speed) * maxSpeed;
    }
    
    // Ensure minimum speed
    const minSpeed = 3;
    if (speed < minSpeed) {
      ball.velocity.x = (ball.velocity.x / speed) * minSpeed;
      ball.velocity.y = (ball.velocity.y / speed) * minSpeed;
    }
  }
}
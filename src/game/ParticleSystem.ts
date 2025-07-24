import { Particle } from '../types/GameTypes';

export class ParticleSystem {
  private particles: Particle[] = [];

  public createExplosion(x: number, y: number, color: string): void {
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      
      const particle: Particle = {
        id: `particle-${Date.now()}-${i}`,
        position: { x, y },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        life: 1000 + Math.random() * 500,
        maxLife: 1000 + Math.random() * 500,
        color: color,
        size: 3 + Math.random() * 4
      };
      
      this.particles.push(particle);
    }
  }

  public update(deltaTime: number): void {
    this.particles = this.particles.filter(particle => {
      particle.position.x += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      particle.velocity.y += 0.2; // Gravity
      particle.life -= deltaTime;
      
      return particle.life > 0;
    });
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const currentSize = particle.size * alpha;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  public clear(): void {
    this.particles = [];
  }
}
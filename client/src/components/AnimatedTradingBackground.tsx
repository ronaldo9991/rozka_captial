import { useEffect, useRef } from 'react';

export default function AnimatedTradingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Gold color: #D4AF37 (RGB: 212, 175, 55)
    const goldColor = 'rgba(212, 175, 55,';
    const goldDark = 'rgba(212, 175, 55, 0.15)';
    const goldMedium = 'rgba(212, 175, 55, 0.3)';
    const goldLight = 'rgba(212, 175, 55, 0.5)';

    // Trading chart lines
    class ChartLine {
      x: number;
      y: number;
      amplitude: number;
      frequency: number;
      speed: number;
      color: string;
      points: Array<{ x: number; y: number }>;

      constructor() {
        this.x = 0;
        this.y = canvas.height / 2 + (Math.random() - 0.5) * 200;
        this.amplitude = 50 + Math.random() * 100;
        this.frequency = 0.01 + Math.random() * 0.02;
        this.speed = 0.5 + Math.random() * 1;
        this.color = goldColor + (0.2 + Math.random() * 0.3) + ')';
        this.points = [];
        for (let i = 0; i < canvas.width; i += 2) {
          this.points.push({ x: i, y: this.y });
        }
      }

      update() {
        this.x += this.speed;
        for (let i = 0; i < this.points.length; i++) {
          this.points[i].x -= this.speed;
          this.points[i].y = this.y + Math.sin((this.points[i].x + this.x) * this.frequency) * this.amplitude;
        }
        if (this.points[0].x < -10) {
          this.points.shift();
          this.points.push({ x: canvas.width, y: this.y });
        }
      }

      draw() {
        if (this.points.length < 2) return;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Floating particles
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 1 + Math.random() * 2;
        this.color = goldColor + (0.3 + Math.random() * 0.4) + ')';
        this.life = 0;
        this.maxLife = 200 + Math.random() * 300;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        if (this.life > this.maxLife) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.life = 0;
        }
      }

      draw() {
        const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.5;
        ctx.fillStyle = this.color.replace(/[\d\.]+\)$/, alpha + ')');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Currency symbols
    class CurrencySymbol {
      x: number;
      y: number;
      symbol: string;
      size: number;
      speed: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.symbol = ['$', '€', '£', '¥', '₿'][Math.floor(Math.random() * 5)];
        this.size = 20 + Math.random() * 30;
        this.speed = 0.2 + Math.random() * 0.5;
        this.opacity = 0.1 + Math.random() * 0.2;
      }

      update() {
        this.y -= this.speed;
        if (this.y < -50) {
          this.y = canvas.height + 50;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.fillStyle = goldColor + this.opacity + ')';
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.symbol, this.x, this.y);
      }
    }

    // Grid mesh
    class GridMesh {
      spacing: number;
      offset: number;

      constructor() {
        this.spacing = 50;
        this.offset = 0;
      }

      update() {
        this.offset += 0.2;
      }

      draw() {
        ctx.strokeStyle = goldColor + '0.05)';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = -this.offset % this.spacing; x < canvas.width; x += this.spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Horizontal lines
        for (let y = -this.offset % this.spacing; y < canvas.height; y += this.spacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }
    }

    // Initialize elements
    const chartLines: ChartLine[] = [];
    for (let i = 0; i < 3; i++) {
      chartLines.push(new ChartLine());
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle());
    }

    const currencySymbols: CurrencySymbol[] = [];
    for (let i = 0; i < 15; i++) {
      currencySymbols.push(new CurrencySymbol());
    }

    const gridMesh = new GridMesh();

    // Animated orbs
    const orbs: Array<{ x: number; y: number; radius: number; vx: number; vy: number }> = [];
    for (let i = 0; i < 3; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 100 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time++;
      
      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      gridMesh.update();
      gridMesh.draw();

      // Draw animated orbs
      orbs.forEach((orb, i) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        
        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, goldColor + '0.15)');
        gradient.addColorStop(0.5, goldColor + '0.08)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw chart lines
      chartLines.forEach(line => {
        line.update();
        line.draw();
      });

      // Draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw currency symbols
      currencySymbols.forEach(symbol => {
        symbol.update();
        symbol.draw();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

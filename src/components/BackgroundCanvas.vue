<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
export default {
  name: 'BackgroundCanvas',
  mounted() {
    this.initCanvas();
    this.animate();
  },
  data() {
    return {
      ctx: null,
      width: 0,
      height: 0,
      particles: [],
    };
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx = canvas.getContext('2d');
      this.resizeCanvas();

      // Create particles
      for (let i = 0; i < 200; i++) {
        this.particles.push(this.createParticle());
      }

      window.addEventListener('resize', this.resizeCanvas);
    },
    createParticle() {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        alpha: Math.random() * 0.5 + 0.5,
      };
    },
    resizeCanvas() {
      const canvas = this.$refs.canvas;
      this.width = canvas.width = document.documentElement.clientWidth;
      this.height = canvas.height = document.documentElement.clientHeight;
      this.particles = [];
      for (let i = 0; i < 200; i++) {
        this.particles.push(this.createParticle());
      }
    },
    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.drawBackground();
      this.updateParticles();
      requestAnimationFrame(this.animate);
    },
    drawBackground() {
      // Create a radial gradient
      const gradient = this.ctx.createRadialGradient(
        this.width / 2,
        this.height / 2,
        0,
        this.width / 2,
        this.height / 2,
        Math.max(this.width, this.height)
      );
      gradient.addColorStop(0, '#0f0f0f');
      gradient.addColorStop(1, '#1a1a1a');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw grid
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      this.ctx.lineWidth = 0.5;
      for (let i = 0; i < this.width; i += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(i, 0);
        this.ctx.lineTo(i, this.height);
        this.ctx.stroke();
      }
      for (let i = 0; i < this.height; i += 20) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, i);
        this.ctx.lineTo(this.width, i);
        this.ctx.stroke();
      }
    },
    updateParticles() {
      for (const particle of this.particles) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > this.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > this.height) particle.speedY *= -1;

        this.ctx.fillStyle = `rgba(0, 255, 255, ${particle.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCanvas);
  },
};
</script>

<style scoped>
canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}
</style>

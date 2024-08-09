<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
export default {
  name: 'BackgroundCanvas',
  mounted() {
    this.initCanvas();
  },
  data() {
    return {
      ctx: null,
      width: 0,
      height: 0,
    };
  },
  methods: {
    initCanvas() {
      const canvas = this.$refs.canvas;
      this.ctx = canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', this.resizeCanvas);
    },
    resizeCanvas() {
      const canvas = this.$refs.canvas;
      this.width = canvas.width = document.documentElement.clientWidth;
      this.height = canvas.height = document.documentElement.clientHeight;
      this.drawBackground();
    },
    drawBackground() {
      // Create a linear gradient for a professional look
      const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
      gradient.addColorStop(0, '#ffffff'); // White
      gradient.addColorStop(1, '#e0e0e0'); // Light grey

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Add subtle geometric shapes
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.addGeometricShapes();
    },
    addGeometricShapes() {
      const shapesCount = 10;
      for (let i = 0; i < shapesCount; i++) {
        this.ctx.beginPath();
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        const size = Math.random() * 100 + 50;
        this.ctx.rect(x, y, size, size);
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

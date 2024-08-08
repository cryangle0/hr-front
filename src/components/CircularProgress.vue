<template>
  <div class="progress-circle">
    <svg class="progress-ring" :width="size" :height="size">
      <circle
        class="progress-ring__circle"
        :stroke-width="strokeWidth"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
        :stroke="color"
        fill="transparent"
        :style="circleStyle"
      />
    </svg>
    <div class="progress-text">{{ progress }}%</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: Number,
    default: 100,
  },
  progress: {
    type: Number,
    default: 0,
  },
  strokeWidth: {
    type: Number,
    default: 10,
  },
  color: {
    type: String,
    default: '#4CAF50',
  },
});

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value - (props.progress / 100) * circumference.value);

const circleStyle = computed(() => ({
  strokeDasharray: `${circumference.value} ${circumference.value}`,
  strokeDashoffset: offset.value,
}));
</script>

<style scoped>
.progress-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(0.25turn);
  transform-origin: 50% 50%;
}

.progress-text {
  position: absolute;
  font-size: 2rem;
  color: white;
}
</style>

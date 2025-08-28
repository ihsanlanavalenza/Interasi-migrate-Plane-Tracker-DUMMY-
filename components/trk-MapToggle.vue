<template>
  <!-- Map Mode Toggle Buttons -->
  <button 
    class="zoom-btn toggle-3d-btn"
    :class="{ active: mapMode === '3d' }"
    @click="setMapMode('3d')"
    title="Switch to 3D View"
  >
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.101.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.655-.282 1.189-.531 1.189-.867 0-.83-1.485-1.035-2.834-1.148C9.923.089 8.96 0 8 0z"/>
      <path d="M8 15c-.74 0-1.45-.17-2.093-.48.43-.26.94-.727 1.376-1.162.186-.186.36-.361.507-.547.093-.118.18-.239.258-.363.166-.265.296-.551.284-.831-.025-.596-.57-.79-1.145-.976-.28-.091-.578-.187-.855-.313-.208-.095-.388-.202-.508-.334-.126-.138-.195-.302-.195-.495 0-.615.448-1.157 1.062-1.157.327 0 .623.157.822.431.223.306.562.306.562 0 0-.447-.327-.872-.562-1.178C6.73 8.089 6.327 8 5.938 8c-.74 0-1.344.615-1.344 1.344 0 .362.156.694.406.925.313.289.756.453 1.188.594.312.102.594.195.781.313.094.059.156.127.156.219 0 .219-.25.406-.594.406-.312 0-.594-.156-.781-.344-.094-.094-.219-.156-.344-.156-.25 0-.469.219-.469.469 0 .156.063.281.156.375.281.281.656.438 1.031.438.594 0 1.094-.281 1.094-.844 0-.219-.094-.406-.25-.531-.219-.172-.531-.281-.844-.375-.219-.063-.406-.125-.531-.219-.063-.047-.094-.109-.094-.172 0-.156.156-.281.344-.281.125 0 .25.063.344.156.156.156.375.156.375 0z"/>
    </svg>
  </button>
  <button 
    class="zoom-btn toggle-2d-btn"
    :class="{ active: mapMode === '2d' }"
    @click="setMapMode('2d')"
    title="Switch to 2D View"
  >
    <span class="button-text">2D</span>
  </button>
</template>

<script setup>
// Props
const props = defineProps({
  mapMode: {
    type: String,
    default: '3d',
    validator: (value) => ['2d', '3d'].includes(value)
  }
});

// Emits
const emit = defineEmits(['map-mode-changed']);

// Methods
const setMapMode = (mode) => {
  if (mode !== props.mapMode) {
    console.log(`Switching map mode from ${props.mapMode} to ${mode}`);
    emit('map-mode-changed', mode);
  }
};
</script>

<style scoped>
.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.zoom-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--bg-primary);
  color: var(--bg-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  background-color: var(--text-primary);
}

.zoom-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.button-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: inherit;
}
</style>

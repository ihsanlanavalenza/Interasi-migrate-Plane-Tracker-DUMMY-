<template>
  <div class="map-layers-control">
    <button 
      class="layers-toggle-btn" 
      @click="togglePanel"
      :class="{ active: showPanel }"
      title="Map Layers"
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
        <polygon points="12,5 4,9 12,13 20,9 12,5" stroke-linejoin="round" stroke-linecap="round" />
        <polygon points="12,15 4,19 12,23 20,19 12,15" stroke-linejoin="round" stroke-linecap="round" />
        <polygon points="12,10 4,14 12,18 20,14 12,10" stroke-linejoin="round" stroke-linecap="round" />
      </svg>
      <span class="btn-text">Layers</span>
    </button>

    <div v-if="showPanel" class="layers-panel">
      <div class="panel-header">
        <h4 class="panel-title">Map Layers</h4>
        <button class="close-btn" @click="togglePanel">×</button>
      </div>
      
      <div ref="layersContent" class="layers-content">
        <div class="layers-section">
          <h5 class="section-title">Airspace</h5>
          <div class="layers-list">
            <div 
              v-for="layer in airspaceLayers" 
              :key="layer.id" 
              class="layer-item"
            >
              <label class="layer-label">
                <input 
                  type="checkbox" 
                  :checked="layer.enabled"
                  @change="toggleLayer(layer)"
                  class="layer-checkbox"
                />
                <span class="checkbox-custom" :style="{ borderColor: layer.color }"></span>
                <span class="layer-color-indicator" :style="{ backgroundColor: layer.color }"></span>
                <span class="layer-name">{{ layer.name }}</span>
                <span v-if="layer.count" class="layer-count">({{ layer.count }})</span>
              </label>
            </div>
          </div>
        </div>

        <div class="layers-section">
          <h5 class="section-title">Display</h5>
          <div class="layers-list">
            <div 
              v-for="layer in displayLayers" 
              :key="layer.id" 
              class="layer-item"
            >
              <label class="layer-label">
                <input 
                  type="checkbox" 
                  v-model="layer.enabled"
                  @change="toggleLayer(layer)"
                  class="layer-checkbox"
                />
                <span class="checkbox-custom"></span>
                <span class="layer-name">{{ layer.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onMounted } from 'vue'
import { useAirspace } from '../composables/useAirspace.js'

const emit = defineEmits(['layer-toggle'])

const showPanel = ref(false)
const layersContent = ref(null)

// Get airspace data from composable
const { 
  airspaceData, 
  airspaceLoading, 
  airspaceError, 
  airspaceVisibility,
  loadAirspaceData,
  getAirspaceStats
} = useAirspace()

// Generate airspace layers dynamically based on available data
const airspaceLayers = computed(() => {
  if (airspaceLoading.value || airspaceError.value) return []
  
  const layerMap = {
    'ctr': { name: 'Control Zones (CTR)', enabled: true, priority: 1, color: '#ff6464' },
    'tma': { name: 'Terminal Areas (TMA)', enabled: true, priority: 2, color: '#64ff64' },
    'atz': { name: 'Air Traffic Zones (ATZ)', enabled: true, priority: 3, color: '#ff9600' },
    'sector': { name: 'Control Sectors', enabled: true, priority: 4, color: '#00ffff' },
    'fir': { name: 'Flight Info Regions (FIR)', enabled: false, priority: 5, color: '#6464ff' },
    'uta': { name: 'Upper Airspace (UTA)', enabled: false, priority: 6, color: '#ffff64' },
    'afiz': { name: 'Aerodrome Flight Info Zones (AFIZ)', enabled: false, priority: 7, color: '#9600ff' }
  }
  
  return Object.keys(airspaceData)
    .filter(type => airspaceData[type]?.features?.length > 0)
    .map(type => ({
      id: type.toLowerCase(),
      name: layerMap[type.toLowerCase()]?.name || type.toUpperCase(),
      enabled: airspaceVisibility[type.toLowerCase()] || false,
      priority: layerMap[type.toLowerCase()]?.priority || 99,
      color: layerMap[type.toLowerCase()]?.color || '#ffffff',
      count: airspaceData[type].features?.length || 0
    }))
    .sort((a, b) => a.priority - b.priority)
})

const displayLayers = reactive([
  { id: 'aircraft', name: 'Aircraft', enabled: true },
  { id: 'airports', name: 'Airports', enabled: true }
])

const togglePanel = async () => {
  showPanel.value = !showPanel.value
  
  // Scroll to top when opening panel
  if (showPanel.value) {
    await nextTick()
    if (layersContent.value) {
      layersContent.value.scrollTop = 0
    }
  }
}

const toggleLayer = (layer) => {
  console.log('🗺️ Toggling layer:', layer.name, 'enabled:', !layer.enabled);
  
  emit('layer-toggle', {
    layerId: layer.id,
    enabled: !layer.enabled,
    layerName: layer.name,
    layerType: airspaceLayers.value.some(l => l.id === layer.id) ? 'airspace' : 'display'
  })
}

// Load airspace data on mount
onMounted(() => {
  loadAirspaceData()
})
</script>

<style scoped>
.map-layers-control {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.layers-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #334155;
  border-radius: 8px;
  color: #e2e8f0;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  font-weight: 500;
}

.layers-toggle-btn:hover {
  background: var(--text-primary);
  border-color: var(--bg-primary);
  color: var(--bg-primary);
}

.layers-toggle-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: #60a5fa;
  color: #60a5fa;
}

.btn-text {
  font-size: 13px;
}

.layers-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #334155;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-width: 280px;
  max-width: 320px;
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(30, 41, 59, 0.8);
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.panel-title {
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 18px;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #f1f5f9;
}

.layers-content {
  padding: 16px;
  max-height: 280px;
  overflow-y: auto;
  scroll-behavior: smooth;
  flex: 1;
  min-height: 0;
}

.layers-section {
  margin-bottom: 20px;
}

.layers-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #60a5fa;
  font-size: 11px;
  font-weight: 600;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
}

.layer-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  user-select: none;
}

.layer-label:hover {
  background: rgba(51, 65, 85, 0.3);
}

.layer-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  position: relative;
  width: 16px;
  height: 16px;
  border: 1px solid #475569;
  border-radius: 3px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.layer-checkbox:checked + .checkbox-custom {
  background: #60a5fa;
  border-color: #60a5fa;
}

.layer-checkbox:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.layer-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
  opacity: 0.8;
}

.layer-name {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  flex: 1;
}

.layer-count {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
  margin-left: auto;
  flex-shrink: 0;
}

/* Custom scrollbar */
.layers-content::-webkit-scrollbar {
  width: 6px;
}

.layers-content::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.layers-content::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
  border-radius: 3px;
}

.layers-content::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.7);
}

/* Responsive design */
@media (max-width: 768px) {
  .map-layers-control {
    top: 15px;
    right: 15px;
  }

  .layers-toggle-btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .layers-panel {
    min-width: 260px;
    max-width: calc(100vw - 30px);
  }

  .panel-header {
    padding: 10px 12px;
  }

  .layers-content {
    padding: 12px;
    max-height: 300px;
  }

  .layer-name {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .map-layers-control {
    top: 10px;
    right: 10px;
  }

  .layers-toggle-btn {
    padding: 6px 10px;
  }

  .layers-panel {
    min-width: 240px;
    max-width: calc(100vw - 20px);
  }

  .layers-content {
    padding: 10px;
    max-height: 250px;
  }
}
</style>

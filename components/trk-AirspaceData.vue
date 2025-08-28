<template>
  <div class="airspace-data-panel">
    <div class="panel-header">
      <h3>Airspace Data</h3>
      <button @click="togglePanel" class="toggle-btn">
        {{ isCollapsed ? '▼' : '▲' }}
      </button>
    </div>
    
    <div v-if="!isCollapsed" class="panel-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner" />
        Loading airspace data...
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error">
        <div class="error-icon">⚠️</div>
        Error: {{ error }}
        <button @click="loadAirspaceData" class="retry-btn">Retry</button>
      </div>
      
      <!-- Airspace Filters -->
      <div v-if="!loading && !error" class="filters-section">
        <div class="filter-header">
          <h4>Filters</h4>
        </div>
        <div class="filter-controls">
          <div class="filter-group">
            <label>Type:</label>
            <select v-model="selectedType" @change="updateDisplay" class="filter-select">
              <option value="">All Types</option>
              <option value="fir">FIR</option>
              <option value="ctr">CTR</option>
              <option value="tma">TMA</option>
              <option value="atz">ATZ</option>
              <option value="uta">UTA</option>
              <option value="sector">Sector</option>
              <option value="afiz">AFIZ</option>
            </select>
          </div>
          
          <div class="filter-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="showOnlyActive" 
                @change="updateDisplay"
                class="filter-checkbox"
              />
              <span class="checkmark"></span>
              Active Only
            </label>
          </div>
        </div>
      </div>
      
      <!-- Airspace List -->
      <div v-if="!loading && !error" class="airspace-section">
        <div class="section-header">
          <h4>Airspace List</h4>
          <span class="count-badge">{{ filteredAirspace.length }}</span>
        </div>
        
        <div class="airspace-grid">
          <div 
            v-for="airspace in filteredAirspace" 
            :key="airspace.id"
            class="airspace-card"
            :class="{ 
              active: airspace.active,
              selected: selectedAirspace?.id === airspace.id 
            }"
            @click="selectAirspace(airspace)"
          >
            <div class="card-header">
              <div class="airspace-info">
                <span class="airspace-name">{{ airspace.name }}</span>
                <span class="airspace-type" :class="`type-${airspace.type.toLowerCase()}`">
                  {{ airspace.type }}
                </span>
              </div>
              <div class="status-indicator" :class="{ active: airspace.active }">
                {{ airspace.active ? '●' : '○' }}
              </div>
            </div>
            
            <div class="card-content">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Frequency:</span>
                  <span class="value">{{ airspace.frequency }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Upper:</span>
                  <span class="value">{{ airspace.upperLimit }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Lower:</span>
                  <span class="value">{{ airspace.lowerLimit }}</span>
                </div>
                <div class="detail-item full-width">
                  <span class="label">Control:</span>
                  <span class="value">{{ airspace.controlCenter }}</span>
                </div>
              </div>
              
              <div v-if="airspace.restrictions" class="restrictions">
                <span class="restrictions-icon">⚠️</span>
                {{ airspace.restrictions }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistics -->
      <div v-if="!loading && !error" class="statistics-section">
        <div class="section-header">
          <h4>Statistics</h4>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ totalAirspace }}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ activeAirspace }}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ selectedTypeCount }}</div>
            <div class="stat-label">Filtered</div>
          </div>
        </div>
      </div>

      <!-- Layers Control Section -->
      <div v-if="showLayers" class="layers-section">
        <div class="section-header">
          <h4>Layer Controls</h4>
        </div>
        <div class="layers-grid">
          <div 
            v-for="layer in layers" 
            :key="layer.id" 
            class="layer-control"
            @click="toggleLayer(layer)"
          >
            <div class="layer-toggle">
              <input 
                type="checkbox" 
                :id="layer.id" 
                v-model="layer.enabled"
                class="layer-checkbox"
              />
              <label :for="layer.id" class="toggle-switch"></label>
            </div>
            <span class="layer-name">{{ layer.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'

const { 
  airspaceData, 
  loading, 
  error, 
  loadAirspaceData, 
  getAirspaceByType, 
  getActiveAirspace 
} = useAirspace()

const _props = defineProps({
  aircraftCount: {
    type: Number,
    default: 0
  },
  connectionStatus: {
    type: String,
    default: 'Disconnected'
  },
  showLayers: {
    type: Boolean,
    default: true
  }
})

// Component state
const isCollapsed = ref(false)
const selectedType = ref('')
const showOnlyActive = ref(false)
const selectedAirspace = ref(null)

// Computed properties
const filteredAirspace = computed(() => {
  let airspace = []
  
  if (selectedType.value) {
    airspace = getAirspaceByType(selectedType.value)
  } else {
    // Get all airspace
    Object.values(airspaceData.value).forEach(typeData => {
      airspace.push(...typeData)
    })
  }
  
  if (showOnlyActive.value) {
    airspace = airspace.filter(item => item.active)
  }
  
  return airspace
})

const totalAirspace = computed(() => {
  let total = 0
  Object.values(airspaceData.value).forEach(typeData => {
    total += typeData.length
  })
  return total
})

const activeAirspace = computed(() => {
  return getActiveAirspace().length
})

const selectedTypeCount = computed(() => {
  return filteredAirspace.value.length
})

// Layers control
const layers = reactive([
  { id: 'afiz', name: 'AFIZ', enabled: true },
  { id: 'atz', name: 'ATZ', enabled: true },
  { id: 'ctr', name: 'CTR', enabled: true },
  { id: 'tma', name: 'TMA', enabled: false },
  { id: 'sector', name: 'Sector', enabled: false },
  { id: 'uta', name: 'UTA', enabled: false },
  { id: 'fir', name: 'FIR', enabled: true }
])

// Methods
const togglePanel = () => {
  isCollapsed.value = !isCollapsed.value
}

const updateDisplay = () => {
  // Trigger reactivity update
  selectedAirspace.value = null
}

const selectAirspace = (airspace) => {
  selectedAirspace.value = airspace
  // Emit event for parent components (like map) to use
  emit('airspace-selected', airspace)
}

const toggleLayer = (layer) => {
  layer.enabled = !layer.enabled
  emit('layer-toggle', {
    layerId: layer.id,
    enabled: layer.enabled,
    layerName: layer.name
  })
}

// Define emits
const emit = defineEmits(['airspace-selected', 'layer-toggle'])

// Load data on mount
onMounted(() => {
  loadAirspaceData()
})
</script>

<style scoped>
.airspace-data-panel {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  max-width: 100%;
  box-shadow: var(--shadow-medium);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-panel-header);
  border-bottom: 1px solid var(--border-primary);
}

.panel-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.toggle-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-fast);
}

.toggle-btn:hover {
  background: var(--bg-quaternary);
  border-color: var(--color-secondary);
  color: var(--text-primary);
}

.panel-content {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
}

/* Loading & Error States */
.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  gap: 10px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-secondary);
  border-top: 2px solid var(--color-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: var(--status-disconnected);
}

.error-icon {
  font-size: 24px;
}

.retry-btn {
  background: var(--color-secondary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: 10px;
}

.retry-btn:hover {
  background: var(--color-secondary-hover);
  transform: translateY(-1px);
}

/* Filters Section */
.filters-section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-panel-transparent);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
}

.filter-header {
  margin-bottom: 12px;
}

.filter-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-secondary);
  border-radius: var(--border-radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  transition: all var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 2px var(--color-secondary-alpha);
}

.checkbox-group .checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
}

.filter-checkbox {
  position: absolute;
  opacity: 0;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-secondary);
  border-radius: 3px;
  position: relative;
  transition: all var(--transition-fast);
}

.filter-checkbox:checked + .checkmark {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
}

.filter-checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.count-badge {
  background: var(--color-secondary);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

/* Airspace Section */
.airspace-section {
  margin-bottom: 24px;
}

.airspace-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.airspace-card {
  background: var(--bg-panel-transparent);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  padding: 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.airspace-card:hover {
  background: var(--bg-quaternary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
}

.airspace-card.selected {
  border-color: var(--color-secondary);
  background: var(--color-secondary-alpha);
}

.airspace-card.active {
  border-left: 3px solid var(--status-connected);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.airspace-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.airspace-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
}

.airspace-type {
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-fir { background: var(--color-secondary-alpha); color: var(--color-secondary); }
.type-ctr { background: var(--status-connected-alpha); color: var(--status-connected); }
.type-tma { background: var(--status-connecting-alpha); color: var(--status-connecting); }
.type-atz { background: var(--status-connecting-alpha); color: var(--status-connecting); }
.type-uta { background: var(--color-secondary-alpha); color: var(--color-secondary); }
.type-sector { background: var(--status-connected-alpha); color: var(--status-connected); }
.type-afiz { background: var(--status-disconnected-alpha); color: var(--status-disconnected); }

.status-indicator {
  font-size: 16px;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.status-indicator.active {
  color: var(--status-connected);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  font-size: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item .label {
  color: var(--text-muted);
  font-weight: 500;
}

.detail-item .value {
  color: var(--text-secondary);
  font-weight: 400;
}

.restrictions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--status-disconnected-alpha);
  color: var(--status-disconnected);
  border-radius: var(--border-radius-sm);
  font-size: 11px;
  font-style: italic;
}

.restrictions-icon {
  font-size: 12px;
}

/* Statistics Section */
.statistics-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--bg-panel-transparent);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  padding: 12px;
  text-align: center;
}

.stat-number {
  color: var(--color-secondary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  color: var(--text-muted);
  font-size: 11px;
  margin-top: 4px;
}

/* Layers Section */
.layers-section {
  border-top: 1px solid var(--border-primary);
  padding-top: 16px;
}

.layers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.layer-control {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-panel-transparent);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.layer-control:hover {
  background: var(--bg-quaternary);
  border-color: var(--border-secondary);
}

.layer-toggle {
  position: relative;
  flex-shrink: 0;
}

.layer-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 28px;
  height: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-secondary);
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  width: 12px;
  height: 12px;
  background: var(--text-primary);
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.layer-checkbox:checked + .toggle-switch {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
}

.layer-checkbox:checked + .toggle-switch::after {
  transform: translateX(12px);
  background: white;
}

.layer-name {
  font-size: 11px;
  font-weight: 500;
  flex: 1;
  color: var(--text-secondary);
}

/* Scrollbar styling */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary);
}

/* Responsive design */
@media (max-width: 768px) {
  .panel-content {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .layers-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>

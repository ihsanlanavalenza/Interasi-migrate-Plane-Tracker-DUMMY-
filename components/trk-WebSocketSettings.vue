<template>
  <div class="websocket-settings">
    <div class="settings-header">
      <h3>WebSocket Data Settings</h3>
      <button 
        class="toggle-btn" 
        @click="toggleSettings"
        :title="isExpanded ? 'Collapse Settings' : 'Expand Settings'"
      >
        <svg 
          :class="{ 'rotated': isExpanded }" 
          width="16" 
          height="16" 
          fill="currentColor" 
          viewBox="0 0 16 16"
        >
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
      </button>
    </div>

    <div v-if="isExpanded" class="settings-content">
      <!-- Connection Status -->
      <div class="status-section">
        <div class="status-item">
          <span class="status-label">Status:</span>
          <span :class="['status-value', `status-${connectionStatus}`]">
            {{ connectionStatusText }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Aircraft:</span>
          <span class="status-value">{{ stats.aircraftCount }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Messages:</span>
          <span class="status-value">{{ stats.messageCount }}</span>
        </div>
      </div>

      <!-- Update Settings -->
      <div class="settings-group">
        <h4>Update Settings</h4>
        <div class="setting-item">
          <label for="update-interval">Update Interval (ms):</label>
          <input
            id="update-interval"
            v-model.number="localSettings.updateInterval"
            type="number"
            min="100"
            max="10000"
            step="100"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="batch-size">Batch Size:</label>
          <input
            id="batch-size"
            v-model.number="localSettings.batchSize"
            type="number"
            min="1"
            max="200"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="compression">Enable Compression:</label>
          <input
            id="compression"
            v-model="localSettings.compressionEnabled"
            type="checkbox"
            @change="updateSettings"
          />
        </div>
      </div>

      <!-- Filter Settings -->
      <div class="settings-group">
        <h4>Data Filters</h4>
        <div class="setting-item">
          <label for="min-altitude">Min Altitude (ft):</label>
          <input
            id="min-altitude"
            v-model.number="localSettings.filterSettings.minAltitude"
            type="number"
            min="0"
            max="50000"
            step="1000"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="max-altitude">Max Altitude (ft):</label>
          <input
            id="max-altitude"
            v-model.number="localSettings.filterSettings.maxAltitude"
            type="number"
            min="1000"
            max="100000"
            step="1000"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="min-speed">Min Speed (knots):</label>
          <input
            id="min-speed"
            v-model.number="localSettings.filterSettings.minSpeed"
            type="number"
            min="0"
            max="1000"
            step="10"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="max-distance">Max Distance (km):</label>
          <input
            id="max-distance"
            v-model.number="localSettings.filterSettings.maxDistance"
            type="number"
            min="50"
            max="2000"
            step="50"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="require-callsign">Require Callsign:</label>
          <input
            id="require-callsign"
            v-model="localSettings.filterSettings.requireCallsign"
            type="checkbox"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="require-position">Require Position:</label>
          <input
            id="require-position"
            v-model="localSettings.filterSettings.requirePosition"
            type="checkbox"
            @change="updateSettings"
          />
        </div>
      </div>

      <!-- Connection Settings -->
      <div class="settings-group">
        <h4>Connection Settings</h4>
        <div class="setting-item">
          <label for="auto-reconnect">Auto Reconnect:</label>
          <input
            id="auto-reconnect"
            v-model="localSettings.connectionSettings.autoReconnect"
            type="checkbox"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="max-reconnects">Max Reconnects:</label>
          <input
            id="max-reconnects"
            v-model.number="localSettings.connectionSettings.maxReconnectAttempts"
            type="number"
            min="1"
            max="20"
            @change="updateSettings"
          />
        </div>
        <div class="setting-item">
          <label for="ping-interval">Ping Interval (ms):</label>
          <input
            id="ping-interval"
            v-model.number="localSettings.connectionSettings.pingInterval"
            type="number"
            min="10000"
            max="120000"
            step="5000"
            @change="updateSettings"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button class="action-btn primary" @click="reconnect">
          🔄 Reconnect
        </button>
        <button class="action-btn secondary" @click="resetToDefaults">
          ↻ Reset to Defaults
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTcpClient } from '../composables/useClient.js'

// Get TCP client instance
const { 
  connectionStatus, 
  tcpConfig, 
  updateWebSocketConfig, 
  getConnectionStats, 
  connect, 
  disconnect 
} = useTcpClient()

// Component state
const isExpanded = ref(false)
const stats = ref({
  isConnected: false,
  connectionStatus: 'disconnected',
  reconnectAttempts: 0,
  messageCount: 0,
  aircraftCount: 0,
  lastUpdate: null,
  connectionTime: 0
})

// Local settings (reactive copy of tcpConfig.websocket)
const localSettings = ref({
  updateInterval: 1000,
  batchSize: 50,
  compressionEnabled: true,
  filterSettings: {
    minAltitude: 0,
    maxAltitude: 50000,
    minSpeed: 0,
    maxDistance: 500,
    requireCallsign: true,
    requirePosition: true
  },
  connectionSettings: {
    autoReconnect: true,
    maxReconnectAttempts: 10,
    reconnectInterval: 5000,
    pingInterval: 30000,
    timeout: 10000
  }
})

// Computed properties
const connectionStatusText = computed(() => {
  const statusMap = {
    'connected': '🟢 Connected',
    'connecting': '🟡 Connecting...',
    'disconnected': '🔴 Disconnected',
    'error': '❌ Error',
    'failed': '💥 Failed'
  }
  return statusMap[connectionStatus.value] || '❓ Unknown'
})

// Methods
const toggleSettings = () => {
  isExpanded.value = !isExpanded.value
}

const updateSettings = () => {
  // Apply the local settings to the TCP client
  updateWebSocketConfig(localSettings.value)
  console.log('⚙️ WebSocket settings updated from UI')
}

const reconnect = async () => {
  disconnect()
  setTimeout(() => {
    connect()
  }, 1000)
}

const resetToDefaults = () => {
  localSettings.value = {
    updateInterval: 1000,
    batchSize: 50,
    compressionEnabled: true,
    filterSettings: {
      minAltitude: 0,
      maxAltitude: 50000,
      minSpeed: 0,
      maxDistance: 500,
      requireCallsign: true,
      requirePosition: true
    },
    connectionSettings: {
      autoReconnect: true,
      maxReconnectAttempts: 10,
      reconnectInterval: 5000,
      pingInterval: 30000,
      timeout: 10000
    }
  }
  updateSettings()
}

// Update stats periodically
const updateStats = () => {
  stats.value = getConnectionStats()
}

// Initialize and setup watchers
onMounted(() => {
  // Initialize local settings from tcpConfig
  if (tcpConfig.websocket) {
    localSettings.value = JSON.parse(JSON.stringify(tcpConfig.websocket))
  }
  
  // Update stats immediately and then periodically
  updateStats()
  setInterval(updateStats, 2000)
})

// Watch for connection status changes
watch(connectionStatus, () => {
  updateStats()
})
</script>

<style scoped>
.websocket-settings {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  max-width: 400px;
  color: #e2e8f0;
  font-size: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 80vh;
  overflow-y: auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.settings-header h3 {
  margin: 0;
  color: #f1f5f9;
  font-size: 16px;
  font-weight: 600;
}

.toggle-btn {
  background: transparent;
  border: 1px solid #475569;
  border-radius: 4px;
  color: #94a3b8;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #60a5fa;
  color: #60a5fa;
}

.toggle-btn svg {
  transition: transform 0.2s ease;
}

.toggle-btn svg.rotated {
  transform: rotate(45deg);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 6px;
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.status-value {
  font-weight: 600;
  font-size: 14px;
}

.status-connected {
  color: #10b981;
}

.status-connecting {
  color: #f59e0b;
}

.status-disconnected {
  color: #ef4444;
}

.status-error, .status-failed {
  color: #dc2626;
}

.settings-group {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 6px;
}

.settings-group h4 {
  margin: 0 0 12px 0;
  color: #f1f5f9;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #334155;
  padding-bottom: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
  flex: 1;
}

.setting-item input[type="number"] {
  width: 80px;
  padding: 4px 8px;
  background: rgba(51, 65, 85, 0.8);
  border: 1px solid #475569;
  border-radius: 4px;
  color: #e2e8f0;
  font-size: 12px;
}

.setting-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.setting-item input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.actions-section {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #334155;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: rgba(71, 85, 105, 0.5);
  color: #e2e8f0;
  border-color: #475569;
}

.action-btn.secondary:hover {
  background: rgba(71, 85, 105, 0.8);
  border-color: #64748b;
}

/* Scrollbar styling */
.websocket-settings::-webkit-scrollbar {
  width: 6px;
}

.websocket-settings::-webkit-scrollbar-track {
  background: rgba(51, 65, 85, 0.3);
  border-radius: 3px;
}

.websocket-settings::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
  border-radius: 3px;
}

.websocket-settings::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.7);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .websocket-settings {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    max-width: none;
    margin-bottom: 16px;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
  
  .status-section {
    flex-direction: column;
  }
  
  .actions-section {
    flex-direction: column;
  }
}
</style>

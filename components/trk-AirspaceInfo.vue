<template>
  <div :class="['airspace-info-panel', { 'maximized': props.isMaximized }]">
    <!-- Panel Header -->
    <div class="panel-header">
      <h3 class="panel-title">Airspace Information</h3>
      <div class="header-controls">
        <div class="header-stats">
          <div class="stat-normal">
            <div class="stat-value">{{ statusStats.normal }}</div>
            <div v-if="props.isMaximized" class="stat-name">Normal</div>
          </div>
          <div class="stat-caution">
            <div class="stat-value">{{ statusStats.caution }}</div>
            <div v-if="props.isMaximized" class="stat-name">Caution</div>
          </div>
          <div class="stat-warning">
            <div class="stat-value">{{ statusStats.warning }}</div>
            <div v-if="props.isMaximized" class="stat-name">Warning</div>
          </div>
          <div class="stat-danger">
            <div class="stat-value">{{ statusStats.danger }}</div>
            <div v-if="props.isMaximized" class="stat-name">Danger</div>
          </div>
        </div>
        <button 
          class="maximize-btn" 
          @click="toggleMaximize"
          :title="props.isMaximized ? 'Minimize Panel' : 'Maximize Panel'"
        >
          <svg 
            width="16" 
            height="16" 
            fill="currentColor" 
            viewBox="0 0 16 16"
          >
            <!-- Maximize icon -->
            <path v-if="!props.isMaximized" d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5v-12zM2 2v11h12V2H2z"/>
            <path v-if="!props.isMaximized" d="M8 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5H8zm-.5 1H5v6h2.5V5z"/>
            <!-- Minimize/Close icon -->
            <path v-if="props.isMaximized" d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="panel-content">
      <!-- Airspace Table -->
      <div class="table-section">
        <div class="table-container">
          <!-- Table with Header and Body together -->
          <div class="table-body">
            <table class="airspace-table">
              <thead>
                <tr>
                  <th class="col-status">Status</th>
                  <th class="col-name">Airspace Name</th>
                  <th class="col-capacity">Load %</th>
                  <th class="col-frequency">Radio Freq</th>
                  <th class="col-type">Type</th>
                  <th class="col-flights">Flights</th>
                  <th class="col-altitude">Altitude</th>
                  <th class="col-fir">FIR</th>
                </tr>
              </thead>
              <tbody>
                <!-- Loading State -->
                <tr v-if="airspaceLoading" class="loading-row">
                  <td colspan="8" class="loading-cell">
                    <div class="loading-spinner"></div>
                    <span>Loading airspace data...</span>
                  </td>
                </tr>
                
                <!-- Error State -->
                <tr v-else-if="airspaceError" class="error-row">
                  <td colspan="8" class="error-cell">
                    <div class="error-icon">⚠️</div>
                    <span>{{ airspaceError }}</span>
                    <button @click="loadAirspaceData" class="retry-btn">Retry</button>
                  </td>
                </tr>
                
                <!-- Data Rows -->
                <tr 
                  v-else 
                  v-for="airspace in airspaceTableData" 
                  :key="airspace.id" 
                  :class="['data-row', airspace.statusClass]"
                  @click="selectAirspace(airspace)"
                >
                  <td class="col-status">
                    <div class="status-indicator" :class="airspace.statusClass">
                      <span class="status-text">{{ airspace.status }}</span>
                    </div>
                  </td>
                  <td class="col-name">
                    <div class="name-info">
                      <span class="airspace-name">{{ airspace.name }}</span>
                    </div>
                  </td>
                  <td class="col-capacity">
                    <div class="capacity-info">
                      <span class="capacity-text" :class="getCapacityClass(airspace.capacity)">
                        {{ airspace.capacity }}%
                      </span>
                      <div class="capacity-bar">
                        <div 
                          class="capacity-fill" 
                          :class="getCapacityClass(airspace.capacity)"
                          :style="{ width: `${Math.min(airspace.capacity, 100)}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td class="col-frequency">
                    <span class="frequency">{{ airspace.frequency }}</span>
                  </td>
                  <td class="col-type">
                    <div class="type-container">
                      <AirspaceBadge :status="airspace.type" />
                    </div>
                  </td>
                  <td class="col-flights">
                    <span class="flight-count" :class="getFlightLevelClass(airspace.capacity)">
                      {{ airspace.flights }}
                    </span>
                  </td>
                  <td class="col-altitude">
                    <span class="altitude-range">{{ airspace.lowerLimit }}-{{ airspace.upperLimit }}</span>
                  </td>
                  <td class="col-fir">
                    <span class="fir-code">{{ airspace.fir }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AirspaceBadge from './AirspaceBadge.vue'
import { useAirspace } from '~/composables/useAirspace.js'

const { 
  airspaceData, 
  airspaceLoading, 
  airspaceError, 
  loadAirspaceData,
  getAirspaceStats
} = useAirspace()

const props = defineProps({
  aircraftCount: {
    type: Number,
    default: 0
  },
  connectionStatus: {
    type: String,
    default: 'Disconnected'
  },
  isMaximized: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-split-view'])

// Toggle maximize function
const toggleMaximize = () => {
  // Emit event to parent to handle split-screen layout
  emit('toggle-split-view', !props.isMaximized)
}

// Unified function to get status class based on capacity ranges
const getStatusClass = (status, capacity) => {
  if (!status || status === 'Inactive') {
    return 'status-inactive'
  }
  
  // Map directly based on capacity ranges
  if (capacity >= 90) return 'status-danger'
  if (capacity >= 71) return 'status-warning'
  if (capacity >= 51) return 'status-caution'
  return 'status-normal'
}

// Simulate flight count and capacity based on airspace type
const getFlightData = (airspace) => {
  const baseCapacity = {
    'FIR': 50,
    'CTR': 25,
    'TMA': 35,
    'ATZ': 15,
    'UTA': 20,
    'SECTOR': 30,
    'AFIZ': 5
  }
  
  const maxCapacity = baseCapacity[airspace.type] || 10
  const currentFlights = Math.floor(Math.random() * maxCapacity) + 1
  const capacity = Math.floor((currentFlights / maxCapacity) * 100)
  
  return {
    current: currentFlights,
    max: maxCapacity,
    capacity: capacity,
    displayText: `${currentFlights}/${maxCapacity}`
  }
}

// Convert airspace data to table format
const airspaceTableData = computed(() => {
  if (airspaceLoading.value || airspaceError.value) return []
  
  // Check if airspaceData exists and is properly initialized
  if (!airspaceData || typeof airspaceData !== 'object') {
    return []
  }
  
  const allAirspace = []
  
  // Handle new GeoJSON format
  for (const [type, data] of Object.entries(airspaceData)) {
    if (data && data.features && Array.isArray(data.features)) {
      data.features.forEach(feature => {
        if (feature && feature.properties) {
          allAirspace.push({
            id: feature.id,
            name: feature.properties.layer || feature.properties.name || `${type.toUpperCase()} Zone`,
            type: type.toUpperCase(),
            class: feature.properties.class || 'N/A',
            lowerLimit: feature.properties.lower || 'GND',
            upperLimit: feature.properties.upper || 'FL999',
            frequency: feature.properties.freq || 'N/A',
            controlCenter: feature.properties.callsign || feature.properties.unt_srvc || 'N/A',
            active: true, // Assume active since we loaded it
            coordinates: feature.geometry?.coordinates,
            remarks: feature.properties.remarks
          })
        }
      })
    }
  }
  
  return allAirspace.map(airspace => {
    const flightData = getFlightData(airspace)
    const capacity = airspace.active ? flightData.capacity : 0
    
    // Determine status based on capacity ranges
    let status
    
    if (!airspace.active) {
      status = 'Inactive'
    } else if (capacity >= 90) {
      status = 'Danger'
    } else if (capacity >= 71) {
      status = 'Warning'
    } else if (capacity >= 51) {
      status = 'Caution'
    } else {
      status = 'Normal'
    }
    
    return {
      id: airspace.id,
      status: status,
      type: airspace.type,
      name: airspace.name,
      flights: flightData.displayText,
      fir: airspace.type === 'FIR' ? 'FIR' : (airspace.controlCenter?.includes('Jakarta') ? 'JKT' : 'U.P'),
      capacity: capacity,
      statusClass: getStatusClass(status, capacity),
      frequency: airspace.frequency,
      controlCenter: airspace.controlCenter,
      upperLimit: airspace.upperLimit,
      lowerLimit: airspace.lowerLimit,
      active: airspace.active,
      currentFlights: flightData.current,
      maxFlights: flightData.max
    }
  }).sort((a, b) => b.capacity - a.capacity)
})

const statusStats = computed(() => {
  const stats = {
    normal: 0,
    caution: 0,
    warning: 0,
    danger: 0,
    active: 0,
    restricted: 0,
    totalFlights: 0
  }
  
  // Add null check for airspaceTableData
  if (!airspaceTableData.value) {
    return stats
  }
  
  airspaceTableData.value.forEach(airspace => {
    // Count by status categories
    switch (airspace.status) {
      case 'Normal':
        stats.normal++
        break
      case 'Caution':
        stats.caution++
        break
      case 'Warning':
        stats.warning++
        break
      case 'Danger':
        stats.danger++
        break
    }
    
    if (airspace.active) {
      stats.active++
    }
    if (airspace.status === 'RESTRICTED') {
      stats.restricted++
    }
    stats.totalFlights += airspace.currentFlights
  })
  
  return stats
})

// Unified utility functions for styling (combining duplicated logic)
const getCapacityClass = (capacity) => {
  if (capacity >= 90) return 'capacity-critical'
  if (capacity >= 71) return 'capacity-high'
  if (capacity >= 51) return 'capacity-medium'
  return 'capacity-low'
}

const getFlightLevelClass = (capacity) => {
  if (capacity >= 90) return 'flight-critical'
  if (capacity >= 71) return 'flight-high'
  if (capacity >= 51) return 'flight-medium'
  return 'flight-low'
}

// Methods
const selectAirspace = (airspace) => {
  console.log('Selected airspace:', airspace)
  // Add selection logic here if needed
}

// Load airspace data on mount
onMounted(() => {
  loadAirspaceData()
})
</script>

<style scoped>
.airspace-info-panel {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-medium);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Maximized panel styles - Split screen layout */
.airspace-info-panel.maximized {
  width: 100% !important;
  height: 100% !important;
  border-radius: var(--border-radius) !important;
  box-shadow: var(--shadow-md) !important;
  margin: 0 !important;
  border: 1px solid var(--border-primary);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Enhanced header styling when maximized */
.panel-header{
  padding: 12px 12px;
}
.maximized .panel-header {
  padding: 16px 16px;
  background: rgba(15, 23, 42, 0.98);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(51, 65, 85, 0.9);
}

.panel-title {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-stats {
  display: flex;
  gap: 6px;
  font-size: 10px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.stat-normal,
.stat-caution,
.stat-warning,
.stat-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 8px 8px;
  border-radius: var(--border-radius-md);
  border: 0.5px solid;
  background: transparent;
  min-width: 30px;
  text-align: center;
}

/* Change to horizontal layout when maximized */
.maximized .stat-normal,
.maximized .stat-caution,
.maximized .stat-warning,
.maximized .stat-danger {
  flex-direction: row;
  gap: 6px;
  min-width: auto;
  padding: 6px 12px;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 2px;
}

.stat-name {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* Better spacing in maximized horizontal layout */
.maximized .stat-name {
  font-size: 10px;
  margin-left: 2px;
}

/* Color each category to match status indicators */
.stat-normal {
  color: var(--status-connected);
  border-color: var(--status-connected);
  background-color: var(--bg-secondary);
}

.stat-caution {
  color: var(--status-connecting);
  border-color: var(--status-connecting);
  background-color: var(--bg-secondary);
}

.stat-warning {
  color: #f97316;
  border-color: #f97316;
  background-color: var(--bg-secondary);
}

.stat-danger {
  color: var(--status-disconnected);
  border-color: var(--status-disconnected);
  background-color: var(--bg-secondary);
}

.maximize-btn {
  background: transparent;
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--bg-secondary);
  outline: 1px solid var(--bg-quaternary)
}

.maximize-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
  transform: scale(1.05);
  background-color: var(--bg-secondary);
}

/* Enhanced maximize button when panel is maximized */
.maximized .maximize-btn {
  background: rgba(220, 38, 38, 0.1);
  border-color: #dc2626;
  color: #dc2626;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.maximized .maximize-btn:hover {
  background: rgba(220, 38, 38, 0.2);
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.05);
}

.maximize-btn svg {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.active-count {
  color: var(--status-connected);
  font-weight: 600;
}

.total-count {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Panel Content */
.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Status Summary */
.status-summary {
  padding: 16px 20px;
  background: var(--bg-panel-transparent);
  background-color: rgba(51, 65, 85, 0.9);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  padding-top: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
  outline: 1px solid var(--bg-quaternary);
  max-height: 72px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-active .stat-number {
  color: var(--status-connected);
}

.stat-restricted .stat-number {
  color: var(--status-disconnected);
}

.stat-total-flights .stat-number {
  color: var(--color-secondary);
}

/* Table Section */
.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}

.airspace-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
  table-layout: fixed;
}

.airspace-table thead {
  background: rgba(51, 65, 85, 0.9);
  position: sticky;
  z-index: 10;
  top: 0;
}

.airspace-table th {
  padding: 6px 4px;
  padding-left: 16px;
  padding-right: 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-primary);
  white-space: nowrap;
}

/* Center align specific columns */
.airspace-table th.col-frequency,
.airspace-table th.col-flights,
.airspace-table th.col-fir,
.airspace-table th.col-altitude,
.airspace-table th.col-capacity,
.airspace-table th.col-type {
  text-align: center;
}

.airspace-table td {
  padding: 8px 4px;
  font-size: 13px;
  border-bottom: 1px solid var(--border-primary);
  vertical-align: middle;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 8px;
}

.airspace-table tbody tr {
  animation: fadeIn 0.5s ease-out;
  transition: all 0.3s ease;
}

.airspace-table tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.airspace-table tbody tr:hover {
  background: rgba(57, 165, 255, 0.1);
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Column widths */
.col-status { width: 70px; padding: 8px 2px 8px 4px;}
.col-name { width: 165px; padding: 8px 2px; }
.col-capacity { width: 65px; padding: 8px 2px; }
.col-frequency { width: 75px; padding: 8px 4px; }
.col-type { width: 60px; padding: 8px 2px; }
.col-flights { width: 60px; }
.col-altitude { width: 90px; }
.col-fir { width: 50px; }

/* Data Rows */
.data-row {
  cursor: pointer;
  transition: all var(--transition-fast);
}

.data-row:hover {
  background: var(--bg-quaternary);
}

.data-row.status-danger {
  background: var(--status-disconnected-alpha);
}

.data-row.status-warning {
  background: rgba(249, 115, 22, 0.05);
}

/* Status Indicator */
/* Status Indicator */
.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--border-radius-md);
  border: 1.5px solid;
  background: transparent;
  min-width: 65px;
  width: 65px;
}

.status-text {
  white-space: nowrap;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Danger status text blinking */
.status-danger .status-text {
  animation: text-blink 1.5s ease-in-out infinite;
}

.status-normal {
  color: var(--status-connected);
  border-color: var(--status-connected);
}

.status-caution {
  color: var(--status-connecting);
  border-color: var(--status-connecting);
}

.status-warning {
  color: #f97316;
  border-color: #f97316;
}

.status-danger {
  color: var(--status-disconnected) !important;
  border-color: var(--status-disconnected) !important;
  animation: danger-blink 2s ease-in-out infinite !important;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.status-critical {
  color: var(--status-disconnected);
  border-color: var(--status-disconnected);
  font-weight: 600;
}

.status-restricted {
  color: #dc2626;
  border-color: #dc2626;
  font-weight: 500;
}

.status-inactive {
  color: #64748b;
  border-color: #64748b;
}

@keyframes text-blink {
  0% {
    opacity: 1;
    font-weight: 600;
  }
  50% {
    opacity: 0.4;
    font-weight: 700;
  }
  100% {
    opacity: 1;
    font-weight: 600;
  }
}

@keyframes danger-blink {
  0% {
    background: transparent;
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3), inset 0 0 0 0 rgba(220, 38, 38, 0);
  }
  50% {
    background: rgba(220, 38, 38, 0.1);
    box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.4), inset 0 0 6px 0 rgba(220, 38, 38, 0.2);
  }
  100% {
    background: transparent;
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3), inset 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

@keyframes pulse-danger {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.1);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    transform: scale(1);
  }
}

@keyframes blink-critical {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
}

@keyframes pulse-warning {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
    transform: scale(1.01);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
    transform: scale(1);
  }
}

@keyframes blink-restricted {
  0%, 70% {
    opacity: 1;
  }
  71%, 100% {
    opacity: 0.4;
  }
}

@keyframes pulse-dot {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Type Container */
.type-container {
  display: center;
  justify-content: center;
  text-align: center;
  align-items: center;
  width: 100%;
  padding: 2px 4px;
}

/* Override type badge color to secondary color */
.type-container :deep(.airspace-badge) {
  color: var(--color-secondary) !important;
  border-color: var(--color-secondary) !important;
  background: transparent !important;
}

/* Name Info */
.name-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-weight: var(--text-primary);
}

.airspace-name {
  color: var(--text-primary);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.frequency {
  color: var(--text-secondary);
  font-size: 12px;
  font-family: monospace;
  font-weight: 600;
  text-align: center;
  display: block;
}

/* Frequency Column */
.col-frequency {
  text-align: center;
}

/* Altitude Column */
.col-altitude {
  text-align: center;
}

.altitude-range {
  color: var(--text-secondary);
  font-size: 11px;
  font-family: monospace;
  font-weight: 600;
}

/* Flight Count */
.col-flights {
  text-align: center;
}

.flight-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  text-align: center;
  padding: 6px 10px;
  border-radius: var(--border-radius-sm);
  white-space: nowrap;
  min-width: 50px;
  height: 24px;
  font-size: 12px;
  line-height: 1;
}

.flight-critical {
  background: var(--status-disconnected-alpha);
  color: var(--status-disconnected);
}

.flight-high {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.flight-medium {
  background: var(--status-connecting-alpha);
  color: var(--status-connecting);
}

.flight-low {
  background: var(--status-connected-alpha);
  color: var(--status-connected);
}

/* FIR Code */
.col-fir {
  text-align: center;
}

.fir-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-family: monospace;
  padding: 6px 8px;
  background: var(--bg-panel-transparent);
  border-radius: var(--border-radius-md);
  border: 1.5px solid var(--border-primary);
  border-color: var(--bg-quaternary);
  min-width: 45px;
  height: 24px;
  line-height: 1;
}

/* Capacity Info */
.col-capacity {
  text-align: center;
}

.capacity-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.capacity-text {
  font-weight: 700;
  font-size: 12px;
  text-align: center;
}

.capacity-critical {
  color: var(--status-disconnected);
}

.capacity-high {
  color: #f97316;
}

.capacity-medium {
  color: var(--status-connecting);
}

.capacity-low {
  color: var(--status-connected);
}

.capacity-bar {
  width: 60px;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
}

.capacity-fill {
  height: 100%;
  transition: width var(--transition-normal);
  border-radius: 2px;
}

.capacity-fill.capacity-critical {
  background: var(--status-disconnected);
}

.capacity-fill.capacity-high {
  background: #f97316;
}

.capacity-fill.capacity-medium {
  background: var(--status-connecting);
}

.capacity-fill.capacity-low {
  background: var(--status-connected);
}

/* Loading & Error States */
.loading-row, .error-row {
  background: var(--bg-panel-transparent);
}

.loading-cell, .error-cell {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.loading-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-secondary);
  border-top: 2px solid var(--color-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  font-size: 12px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background: var(--color-secondary-hover);
  transform: translateY(-1px);
}

/* Scrollbar styling */
.table-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-body::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 3px;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary);
}

.table-body::-webkit-scrollbar-corner {
  background: var(--bg-tertiary);
}

/* Responsive design */
@media (max-width: 768px) {
  .panel-header {
    padding: 12px 16px;
  }

  .status-summary {
    padding: 12px 16px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
    gap: 8px;
    background-color: var(--bg-secondary);
  }

  .airspace-table th,
  .airspace-table td {
    padding: 8px 4px;
    font-size: 10px;
  }

  .flight-count,
  .fir-code {
    font-size: 10px;
    padding: 3px 5px;
    min-width: 28px;
    height: 18px;
  }

  .capacity-bar {
    width: 45px;
  }
}
</style>

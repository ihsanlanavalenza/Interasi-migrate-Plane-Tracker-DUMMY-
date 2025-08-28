<template>
  <div class="aircraft-tracker">
    <!-- Top Header Bar -->
    <TopHeader 
      :connection-status="connectionStatus"
      :is-connected="isConnected"
      @search="handleSearch"
    />

    <!-- Main Content Container -->
    <div class="main-container" :class="{ 
      'split-view': isSplitView, 
      'normal-split': !isSplitView && !isMapMaximized && showAircraftPanel 
    }">
      <!-- Main Content Area with Map -->
      <div class="main-content" :class="{ 
        'maximized': isMapMaximized, 
        'split-left': isSplitView,
        'normal-left': !isSplitView && !isMapMaximized && showAircraftPanel
      }">
        <!-- 3D Map Component -->
        <AircraftMap3D
          v-if="mapMode === '3d'"
          ref="map3DRef"
          :aircraft="throttledAircraftData"
          :is-maximized="isMapMaximized"
          @aircraft-clicked="handleAircraftClick"
          @layer-toggle="handleLayerToggle"
          @toggle-maximize="toggleMapMaximize"
          @map-mode-changed="handleMapModeChange"
        />

        <!-- 2D Map Component -->
        <AircraftMap2D
          v-if="mapMode === '2d'"
          ref="map2DRef"
          :aircraft="throttledAircraftData"
          :is-maximized="isMapMaximized"
          @aircraft-clicked="handleAircraftClick"
          @layer-toggle="handleLayerToggle"
          @toggle-maximize="toggleMapMaximize"
          @map-mode-changed="handleMapModeChange"
        />
      </div>

      <!-- Split-view Airspace Panel (when maximized) -->
      <div v-if="isSplitView" class="split-airspace-panel">
        <AirspaceInfo 
          :key="'airspace-panel'"
          :aircraft-count="aircraftCount"
          :connection-status="connectionStatus"
          :is-maximized="isSplitView"
          @toggle-split-view="handleSplitViewToggle"
        />
      </div>

      <!-- Right Sidebar - Normal layout with both panels -->
      <div v-if="!isMapMaximized && !isSplitView" class="right-sidebar" :class="{ 
        'split-panels': showAircraftPanel 
      }">
        <!-- Airspace Information Panel -->
        <div class="airspace-panel-container" :class="{ 
          'half-height': showAircraftPanel 
        }">
          <div class="panel-base flex flex-col h-full">
            <div class="panel-content flex-1 overflow-auto bg-panel-transparent">
              <AirspaceInfo 
                :key="'airspace-panel'"
                :aircraft-count="aircraftCount"
                :connection-status="connectionStatus"
                :is-maximized="isSplitView"
                @toggle-split-view="handleSplitViewToggle"
              />
            </div>
          </div>
        </div>

        <!-- Detected Aircraft Panel -->
        <div v-show="showAircraftPanel" class="aircraft-panel-container" :class="{ 
          'half-height': showAircraftPanel 
        }">
          <div class="panel-base flex flex-col h-full">
            <div class="panel-header">
              <h3 class="panel-title">Detected Airlines ({{ aircraftCount }})</h3>
              <button @click="toggleAircraftPanel" class="panel-toggle-btn">
                {{ showAircraftPanel ? '−' : '+' }}
              </button>
            </div>
            <div class="panel-content flex-1 overflow-auto bg-panel-transparent">
              <AircraftTable
                :aircraft="throttledAircraftData"
                :altitude-range="sensorData.altitudeRange"
                :max-rows="50"
                :is-half-height="showAircraftPanel"
              />
            </div>
          </div>
        </div>
        
        <!-- Show Aircraft Panel Button (when hidden) - Moved to bottom -->
        <div v-show="!showAircraftPanel" class="show-aircraft-panel">
          <button @click="toggleAircraftPanel" class="show-panel-btn">
            Show Detected Airlines ({{ aircraftCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- Aircraft Details Panel (overlay) -->
    <div v-if="selectedAircraft" class="aircraft-details-overlay">
      <AircraftDetails
        :aircraft="selectedAircraft"
        @close="selectedAircraft = null"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AircraftMap3D from "~/components/AircraftMap3D.vue";
import AircraftMap2D from "~/components/AircraftMap2D.vue";
import AircraftTable from "~/components/AircraftTable.vue";
import AircraftDetails from "~/components/AircraftDetails.vue";
import AirspaceInfo from "~/components/AirspaceInfo.vue";
import TopHeader from "~/components/TopHeader.vue";
import { useWebSocketClient } from "~/composables/useClient.js";

const map3DRef = ref(null);
const map2DRef = ref(null);

// Map mode state (2d or 3d)
const mapMode = ref('3d');

// Panel visibility state
const isMapMaximized = ref(false);
const showAircraftPanel = ref(true); // Show aircraft panel by default for split layout
const selectedAircraft = ref(null);
const isSplitView = ref(false); // Split-screen layout state

// WebSocket Client integration
const {
  isConnected,
  connectionStatus,
  sensorData,
  webSocketConfig,
  connect,
  disconnect: _disconnect,
} = useWebSocketClient();

// Throttled aircraft data - updates every 2 seconds to reduce visual spam
const throttledAircraftData = ref([]);
let lastUpdateTime = 0;

// Watch for aircraft data changes and throttle updates
const updateThrottledData = () => {
  const now = Date.now();
  if (now - lastUpdateTime > 2000) {
    // 2 second throttle
    throttledAircraftData.value = [...sensorData.aircraft];
    lastUpdateTime = now;
  }
};

// Set up interval to check for updates
onMounted(() => {
  setInterval(() => {
    updateThrottledData();
  }, 1000); // Check every second, but only update every 2 seconds
});

// Computed properties for status panel
const aircraftCount = computed(() => sensorData.aircraft?.length || 0);

// Map mode change handler
const handleMapModeChange = (newMode) => {
  console.log(`Switching from ${mapMode.value} to ${newMode} mode`);
  mapMode.value = newMode;
  
  // Save preference to localStorage
  localStorage.setItem('aircraft-tracker-map-mode', newMode);
};

// Map maximize toggle function
const toggleMapMaximize = () => {
  isMapMaximized.value = !isMapMaximized.value;
};

// Aircraft panel toggle function
const toggleAircraftPanel = () => {
  showAircraftPanel.value = !showAircraftPanel.value;
};

// Split-view toggle handler with smooth transitions
const handleSplitViewToggle = (shouldMaximize) => {
  isSplitView.value = shouldMaximize;
};

// Aircraft click handler
const handleAircraftClick = (aircraftData) => {
  console.log("Aircraft selected:", aircraftData);
  selectedAircraft.value = aircraftData;
};

// Layer toggle handler
const handleLayerToggle = (layerInfo) => {
  console.log("Layer toggle:", layerInfo);
  const currentMapRef = mapMode.value === '3d' ? map3DRef.value : map2DRef.value;
  if (currentMapRef?.toggleLayer) {
    currentMapRef.toggleLayer(layerInfo);
  }
};

// Search handler
const handleSearch = (query) => {
  console.log("Search query:", query);
  // Implement search functionality
  // Filter aircraft based on callsign, hex ID, or other criteria
  if (query && throttledAircraftData.value.length > 0) {
    const foundAircraft = throttledAircraftData.value.find(aircraft =>
      aircraft.callsign?.toLowerCase().includes(query.toLowerCase()) ||
      aircraft.icao?.toLowerCase().includes(query.toLowerCase()) ||
      aircraft.hexIdent?.toLowerCase().includes(query.toLowerCase())
    );
    
    if (foundAircraft) {
      selectedAircraft.value = foundAircraft;
      // Optionally center map on found aircraft
      const currentMapRef = mapMode.value === '3d' ? map3DRef.value : map2DRef.value;
      if (currentMapRef?.centerOnAircraft) {
        currentMapRef.centerOnAircraft(foundAircraft);
      }
    }
  }
};

onMounted(() => {
  console.log("🛰️ Aircraft Tracker initialized");
  console.log(
    `📡 WebSocket Client ready for aircraft data at ${webSocketConfig.host}:${webSocketConfig.port}`
  );

  // Load saved map mode preference
  const savedMapMode = localStorage.getItem('aircraft-tracker-map-mode');
  if (savedMapMode && ['2d', '3d'].includes(savedMapMode)) {
    mapMode.value = savedMapMode;
    console.log(`Loaded saved map mode: ${savedMapMode}`);
  }

  // Auto-connect to WebSocket server on page load
  console.log("🔄 Auto-connecting to WebSocket server...");
  connect();
});
</script>

<style scoped>
.aircraft-tracker {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.main-container {
  display: flex;
  flex: 1;
  height: calc(100vh - var(--header-height) - 20px);
  width: 100%;
  margin: 0;
  padding: 10px;
  background: var(--bg-primary);
  gap: 10px;
  overflow: hidden;
  box-sizing: border-box;
}

.right-sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width-sm);
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: var(--z-sidebar);
  overflow: hidden;
  height: 100%;
  position: relative; /* Added for absolute positioning of show button */
}

.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: 0;
  margin: 0;
}

/* Split-view layout styles */
.main-container.split-view {
  padding: 10px;
  gap: 10px;
}

/* Normal split layout when both panels are visible */
.main-container.normal-split {
  padding: 10px;
  gap: 10px;
}

.main-content.split-left {
  width: calc(50vw - 15px);
  position: relative;
  flex: none;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

/* Normal left layout when aircraft panel is visible */
.main-content.normal-left {
  flex: 1;
  position: relative;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.split-airspace-panel {
  width: calc(50vw - 15px);
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background: var(--bg-secondary);
  box-shadow: var(--shadow-md);
}

/* Right sidebar with split panels */
.right-sidebar.split-panels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

/* Panel containers for split layout */
.airspace-panel-container.half-height,
.aircraft-panel-container.half-height {
  height: calc(50% - 4px);
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

/* Ensure panels take full height when not split */
.airspace-panel-container:not(.half-height) {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: calc(100% - 60px); /* Reserve 60px space for show aircraft button at bottom */
}

.aircraft-panel-container:not(.half-height) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Show aircraft panel button styling */
.show-aircraft-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0;
  margin: 0;
}

.main-content.maximized {
  width: 100vw;
  flex: none;
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
}

.aircraft-details-overlay {
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: var(--z-overlay);
  width: 300px;
  max-width: calc(100vw - 40px);
}

/* Responsive design */
@media (max-width: 1400px) {
  .right-sidebar {
    width: var(--sidebar-width-sm);
    min-width: var(--sidebar-width-xs);
  }

  .aircraft-details-overlay {
    max-width: calc(100vw - 40px);
  }
  
  /* Adjust split heights for smaller screens */
  .airspace-panel-container.half-height,
  .aircraft-panel-container.half-height {
    min-height: 250px;
  }
}

@media (max-width: 1200px) {
  .right-sidebar {
    width: var(--sidebar-width-xs);
    min-width: 280px;
  }

  .aircraft-details-overlay {
    max-width: calc(100vw - 40px);
  }
  
  /* Stack panels vertically on medium screens */
  .airspace-panel-container.half-height,
  .aircraft-panel-container.half-height {
    min-height: 200px;
  }
}

@media (max-width: 968px) {
  .main-container {
    flex-direction: column;
    height: calc(100vh - var(--header-height) - 16px);
    padding: 8px;
    gap: 8px;
  }

  .main-container.normal-split {
    flex-direction: column;
  }

  .right-sidebar {
    width: 100%;
    max-width: none;
    height: 35vh;
    order: 2;
  }
  
  .right-sidebar.split-panels {
    height: 40vh;
    flex-direction: row;
    gap: 8px;
  }
  
  .airspace-panel-container.half-height,
  .aircraft-panel-container.half-height {
    height: 100%;
    width: calc(50% - 4px);
    min-height: auto;
  }

  .main-content {
    height: 65vh;
    order: 1;
  }
  
  .main-content.normal-left {
    height: 60vh;
  }

  .aircraft-details-overlay {
    top: 20px;
    left: 10px;
    width: 280px;
    max-width: calc(100vw - 20px);
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 6px;
    gap: 6px;
  }

  .right-sidebar {
    height: 30vh;
  }

  .main-content {
    height: 70vh;
  }

  .aircraft-details-overlay {
    top: 20px;
    left: 10px;
    width: 260px;
  }
}

@media (max-width: 480px) {
  .right-sidebar {
    height: 25vh;
  }

  .main-content {
    height: 75vh;
    padding: 8px;
  }

  .aircraft-details-overlay {
    top: 20px;
    left: 5px;
    width: calc(100vw - 10px);
  }
}

.panel-toggle-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.panel-toggle-btn:hover {
  background: var(--accent-hover);
}


.show-panel-btn {
  background: var(--bg-panel);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  padding: 12px 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  width: 100%;
  text-align: center;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.show-panel-btn:hover {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
</style>

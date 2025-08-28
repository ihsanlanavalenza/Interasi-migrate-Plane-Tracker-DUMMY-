<template>
  <div class="map-container">
    <!-- Leaflet 2D Map Container -->
    <div
      id="leaflet-container"
      ref="leafletContainer"
      class="leaflet-map"
    >
      <div
        v-if="!mapLoaded"
        class="loading-overlay"
      >
        <div class="loading-content">
          <div class="loading-spinner"/>
          <p>Loading 2D Map...</p>
        </div>
      </div>
    </div>

    <!-- Map Layers Control -->
    <MapLayersControl 
      @layer-toggle="handleLayerToggle"
    />

    <!-- Zoom Controls -->
    <div class="zoom-controls">
      <!-- Map Toggle Control -->
      <MapToggle
        :map-mode="'2d'"
        @map-mode-changed="handleMapModeChange"
      />
      
      <button title="Zoom In" class="zoom-btn zoom-in" @click="zoomIn">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
      </button>
      <button title="Zoom Out" class="zoom-btn zoom-out" @click="zoomOut">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
        </svg>
      </button>
      <button title="Reset View to Indonesia" class="zoom-btn reset-btn" @click="resetView">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
        </svg>
      </button>
      <button class="zoom-btn maximize-btn" @click="toggleMaximize" :title="isMaximized ? 'Exit Fullscreen' : 'Maximize Map'">
        <svg v-if="!isMaximized" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <svg v-else width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from "vue";
import MapLayersControl from './MapLayersControl.vue';
import MapToggle from './MapToggle.vue';
import { useWebSocketClient } from '../composables/useClient.js';
import { useAirspace } from '../composables/useAirspace.js';

// Props
const props = defineProps({
  aircraft: {
    type: Array,
    default: () => []
  },
  isMaximized: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['aircraft-clicked', 'zoom-in', 'zoom-out', 'reset-view', 'layer-toggle', 'toggle-maximize', 'map-mode-changed']);

const leafletContainer = ref(null);
const mapLoaded = ref(false);

// WebSocket Client for aircraft data
const { 
  isConnected: _isConnected, 
  connectionStatus, 
  lastMessage: _lastMessage, 
  messageCount, 
  sensorData, 
  webSocketConfig 
} = useWebSocketClient();

// Airspace management
const {
  airspaceData,
  airspaceLoading,
  airspaceVisibility,
  loadAirspaceData,
  toggleAirspaceVisibility,
  getAirspaceColor,
  getAirspaceAtLocation
} = useAirspace();

let map;
const aircraftMarkers = new Map();
const airspaceLayerGroups = new Map();
let animationActive = false;

const initLeafletMap = async () => {
  if (!leafletContainer.value) return;
  
  try {
    console.log('Initializing Leaflet 2D Map...');
    
    // Create Leaflet map centered on Indonesia archipelago
    map = L.map(leafletContainer.value, {
      zoomControl: false, // We'll use custom controls
    }).setView([-2.5, 117.0], 5); // Indonesia archipelago
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 18
    }).addTo(map);
    
    // Add click handler
    map.on('click', (e) => {
      console.log('Map clicked at:', e.latlng);
    });

    // Add aircraft markers
    await createAircraftMarkers();
    
    // Load and add airspace data
    await loadAirspaceData();
    await createAirspaceLayers();
    
    // Start animation
    startAircraftAnimation();
    
    mapLoaded.value = true;
    console.log('Leaflet 2D Map initialized successfully');
    
  } catch (error) {
    console.error('Error initializing Leaflet:', error);
  }
};

const createAircraftMarkers = async () => {
  // Clear existing markers
  aircraftMarkers.forEach(marker => {
    map.removeLayer(marker);
  });
  aircraftMarkers.clear();

  let aircraftData = [];
  
  // First priority: Use aircraft prop data
  if (props.aircraft && props.aircraft.length > 0) {
    aircraftData = props.aircraft.map(sensorAircraft => ({
      id: sensorAircraft.hexIdent || sensorAircraft.icao || sensorAircraft.id,
      name: sensorAircraft.callsign || sensorAircraft.hexIdent,
      position: { 
        lng: sensorAircraft.longitude, 
        lat: sensorAircraft.latitude, 
        alt: sensorAircraft.altitude || 35000 
      },
      speed: sensorAircraft.groundSpeed || sensorAircraft.speed || 450,
      heading: sensorAircraft.track || sensorAircraft.heading || 0,
      airline: getAirlineFromCallsign(sensorAircraft.callsign),
      dataSource: 'IoT Sensor (Live)'
    }));
    console.log(`🛰️ Using ${aircraftData.length} aircraft from IoT sensor (prop data)`);
  }
  // Second priority: Use direct TCP sensor data
  else if (sensorData.aircraft && sensorData.aircraft.length > 0) {
    aircraftData = sensorData.aircraft.map(sensorAircraft => ({
      id: sensorAircraft.hexIdent || sensorAircraft.icao || sensorAircraft.id,
      name: sensorAircraft.callsign || sensorAircraft.hexIdent,
      position: { 
        lng: sensorAircraft.longitude, 
        lat: sensorAircraft.latitude, 
        alt: sensorAircraft.altitude || 35000 
      },
      speed: sensorAircraft.groundSpeed || sensorAircraft.speed || 450,
      heading: sensorAircraft.track || sensorAircraft.heading || 0,
      airline: getAirlineFromCallsign(sensorAircraft.callsign),
      dataSource: 'IoT Sensor (Direct)'
    }));
    console.log(`🛰️ Using ${aircraftData.length} aircraft from TCP sensor data (direct)`);
  } 
  // Fallback: Use simulated data
  else {
    aircraftData = [
      { 
        id: 'GA123', 
        name: 'Garuda Indonesia GA123',
        position: { lng: 106.8456, lat: -6.2088, alt: 35000 },
        speed: 450,
        heading: 90,
        airline: 'Garuda Indonesia',
        dataSource: 'Simulated'
      },
      { 
        id: 'LN456', 
        name: 'Lion Air LN456',
        position: { lng: 107.6191, lat: -6.9175, alt: 38000 },
        speed: 480,
        heading: 45,
        airline: 'Lion Air',
        dataSource: 'Simulated'
      },
      { 
        id: 'SJ789', 
        name: 'Sriwijaya Air SJ789',
        position: { lng: 112.7521, lat: -7.2575, alt: 32000 },
        speed: 420,
        heading: 180,
        airline: 'Sriwijaya Air',
        dataSource: 'Simulated'
      }
    ];
    console.log('Using simulated aircraft data (no TCP sensor data available)');
  }

  // Create aircraft markers
  aircraftData.forEach(flight => {
    if (!flight.position.lat || !flight.position.lng) return;

    // Create marker using Leaflet's circleMarker for a simple dot
    const marker = L.circleMarker([flight.position.lat, flight.position.lng], {
      radius: 6,
      fillColor: '#FFD700', // Gold color
      color: '#000000', // Black border
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
      title: flight.name || flight.id
    }).addTo(map);

    // Create popup content
    const popupContent = `
      <div class="aircraft-popup">
        <h3>${flight.name || flight.id}</h3>
        <p><strong>ICAO:</strong> ${flight.id}</p>
        <p><strong>Airline:</strong> ${flight.airline || 'Unknown'}</p>
        <p><strong>Altitude:</strong> ${flight.position.alt.toLocaleString()} ft</p>
        <p><strong>Speed:</strong> ${flight.speed} knots</p>
        <p><strong>Heading:</strong> ${flight.heading}°</p>
        <p><strong>Status:</strong> En Route</p>
        <p><strong>Data Source:</strong> ${flight.dataSource}</p>
        <p><strong>WebSocket:</strong> ${webSocketConfig.host}:${webSocketConfig.port}</p>
        <p><strong>Connection:</strong> ${connectionStatus.value}</p>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Add click handler
    marker.on('click', () => {
      const mappedAircraftData = {
        icao: flight.id,
        hexIdent: flight.id,
        callsign: flight.name,
        registration: flight.registration || null,
        aircraftType: flight.aircraftType || null,
        latitude: flight.position.lat,
        longitude: flight.position.lng,
        altitude: flight.position.alt,
        groundSpeed: flight.speed,
        speed: flight.speed,
        track: flight.heading,
        heading: flight.heading,
        verticalRate: flight.verticalRate || null,
        onGround: flight.onGround || false,
        emergency: flight.emergency || false,
        alert: flight.alert || false,
        spi: flight.spi || false,
        lastSeen: flight.lastSeen || new Date(),
        messageCount: flight.messageCount || 0,
        dataSource: flight.dataSource,
        airline: flight.airline
      };
      
      console.log('Aircraft clicked:', mappedAircraftData);
      emit('aircraft-clicked', mappedAircraftData);
    });

    // Store marker with flight data
    marker.flightData = flight;
    aircraftMarkers.set(flight.id, marker);
  });
};

const createAirspaceLayers = async () => {
  if (!map || !window.L) {
    console.warn('Cannot create airspace layers: Leaflet map not ready');
    return;
  }

  console.log('🗺️ Creating airspace layers for 2D map...');
  
  // Clear existing airspace layers
  airspaceLayerGroups.forEach(layerGroup => {
    map.removeLayer(layerGroup);
  });
  airspaceLayerGroups.clear();

  let totalFeatures = 0;

  // Process each airspace type
  for (const [airspaceType, data] of Object.entries(airspaceData)) {
    if (!data || !data.features || !airspaceVisibility[airspaceType]) {
      continue;
    }

    const colors = getAirspaceColor(airspaceType);
    const fillColor = `rgba(${colors.fill[0]}, ${colors.fill[1]}, ${colors.fill[2]}, ${colors.fill[3]})`;
    const strokeColor = `rgba(${colors.outline[0]}, ${colors.outline[1]}, ${colors.outline[2]}, ${colors.outline[3]})`;

    console.log(`🗺️ Processing ${airspaceType.toUpperCase()}: ${data.features.length} features`);

    // Create layer group for this airspace type
    const layerGroup = L.layerGroup();

    for (const feature of data.features) {
      if (!feature.geometry || !feature.properties) continue;

      try {
        const airspaceName = feature.properties.layer || feature.properties.name || `${airspaceType.toUpperCase()} Zone`;
        
        // Handle MultiPolygon geometry
        if (feature.geometry.type === 'MultiPolygon') {
          for (const polygon of feature.geometry.coordinates) {
            if (!polygon || !polygon[0]) continue;
            
            // Convert coordinates to Leaflet format [lat, lng]
            const coordinates = polygon[0]; // Use outer ring
            const latLngs = [];
            
            for (const coord of coordinates) {
              if (Array.isArray(coord) && coord.length >= 2) {
                const lon = parseFloat(coord[0]);
                const lat = parseFloat(coord[1]);
                
                if (!isNaN(lon) && !isNaN(lat) && 
                    Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
                  latLngs.push([lat, lon]); // Leaflet expects [lat, lng]
                }
              }
            }
            
            if (latLngs.length < 3) continue; // Need at least 3 points for a polygon
            
            // Create polygon with styling
            const polygonLayer = L.polygon(latLngs, {
              fillColor: fillColor,
              fillOpacity: colors.fill[3],
              color: strokeColor,
              weight: 2,
              opacity: colors.outline[3]
            });

            // Create popup content
            const popupContent = `
              <div class="airspace-popup">
                <h3>${airspaceName}</h3>
                <p><strong>Type:</strong> ${airspaceType.toUpperCase()}</p>
                <p><strong>Class:</strong> ${feature.properties.class || 'N/A'}</p>
                <p><strong>Lower Limit:</strong> ${feature.properties.lower || 'N/A'}</p>
                <p><strong>Upper Limit:</strong> ${feature.properties.upper || 'N/A'}</p>
                <p><strong>Control Unit:</strong> ${feature.properties.unt_srvc || 'N/A'}</p>
                <p><strong>Callsign:</strong> ${feature.properties.callsign || 'N/A'}</p>
                <p><strong>Frequency:</strong> ${feature.properties.freq || 'N/A'}</p>
                ${feature.properties.remarks ? `<p><strong>Remarks:</strong> ${feature.properties.remarks}</p>` : ''}
                <p><strong>Source:</strong> ${feature.properties.source_aip || 'Indonesian AIP'}</p>
              </div>
            `;

            polygonLayer.bindPopup(popupContent);
            
            // Add to layer group
            layerGroup.addLayer(polygonLayer);
            totalFeatures++;
          }
        }
      } catch (error) {
        console.warn(`Error creating airspace layer for ${airspaceType}:`, error);
      }
    }

    // Add layer group to map if it has layers and is visible
    if (layerGroup.getLayers().length > 0 && airspaceVisibility[airspaceType]) {
      map.addLayer(layerGroup);
    }
    
    // Store layer group
    airspaceLayerGroups.set(airspaceType, layerGroup);
  }

  console.log(`🗺️ Created ${totalFeatures} airspace features across ${airspaceLayerGroups.size} types`);
};

const getAirlineFromCallsign = (callsign) => {
  if (!callsign) return 'Unknown';
  
  const airlineMap = {
    'GIA': 'Garuda Indonesia',
    'LNI': 'Lion Air', 
    'SJY': 'Sriwijaya Air',
    'BTK': 'Batik Air',
    'CTV': 'Citilink',
    'AWQ': 'Indonesia AirAsia',
    'JT': 'Lion Air',
    'QG': 'Citilink', 
    'ID': 'Batik Air',
    'SJ': 'Sriwijaya Air',
    'PAS': 'Pacific Air',
    'TX': 'Military/Training',
    'TNU': 'TransNusa',
    'WNI': 'Wings Air',
    'SJV': 'Super Air Jet'
  };
  
  const prefix = callsign.substring(0, 3);
  return airlineMap[prefix] || 'Unknown';
};

const startAircraftAnimation = () => {
  if (!map || animationActive) return;
  
  animationActive = true;
  
  const animate = () => {
    if (!animationActive) return;
    
    // Simple animation - move aircraft slowly
    aircraftMarkers.forEach((marker, _id) => {
      if (marker.flightData) {
        const flight = marker.flightData;
        const currentPos = marker.getLatLng();
        
        // Very slow movement for demonstration
        const speedMs = flight.speed * 0.514444; // knots to m/s
        const distance = speedMs * 0.0001; // very slow movement
        const deltaLat = (distance / 111000) * Math.cos(flight.heading * Math.PI / 180);
        const deltaLng = (distance / 111000) * Math.sin(flight.heading * Math.PI / 180);
        
        const newLat = currentPos.lat + deltaLat;
        const newLng = currentPos.lng + deltaLng;
        
        marker.setLatLng([newLat, newLng]);
      }
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

// Map control functions
const zoomIn = () => {
  if (map) {
    map.zoomIn();
  }
};

const zoomOut = () => {
  if (map) {
    map.zoomOut();
  }
};

const resetView = () => {
  if (map) {
    console.log('Resetting view to Indonesia area...');
    map.setView([-2.5, 117.0], 5); // Indonesia archipelago center with better zoom for full coverage
  }
};

const toggleLayer = (layerInfo) => {
  console.log('Toggle layer:', layerInfo);
  
  // Handle layer info object (from MapLayersControl)
  if (layerInfo && typeof layerInfo === 'object' && layerInfo.layerId) {
    const layerName = layerInfo.layerId;
    const enabled = layerInfo.enabled;
    
    if (map) {
      switch (layerName) {
        case 'aircraft':
          aircraftMarkers.forEach(marker => {
            if (enabled) {
              map.addLayer(marker);
            } else {
              map.removeLayer(marker);
            }
          });
          break;
        
        // Handle airspace layers
        default:
          if (airspaceLayerGroups.has(layerName)) {
            airspaceVisibility[layerName] = enabled;
            
            const layerGroup = airspaceLayerGroups.get(layerName);
            if (layerGroup) {
              if (enabled) {
                if (!map.hasLayer(layerGroup)) {
                  map.addLayer(layerGroup);
                }
              } else {
                if (map.hasLayer(layerGroup)) {
                  map.removeLayer(layerGroup);
                }
              }
            }
          }
          break;
      }
    }
  }
};

const centerOnAircraft = (aircraft) => {
  if (map && aircraft) {
    map.setView([aircraft.latitude, aircraft.longitude], 12);
  }
};

const handleLayerToggle = (layerInfo) => {
  toggleLayer(layerInfo);
  emit('layer-toggle', layerInfo);
};

// Map mode change handler
const handleMapModeChange = (newMode) => {
  emit('map-mode-changed', newMode);
};

// Computed property for maximize state
const isMaximized = computed(() => props.isMaximized);

// Toggle maximize function
const toggleMaximize = () => {
  emit('toggle-maximize');
};

// Expose methods to parent component
defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  toggleLayer,
  centerOnAircraft
});

const loadLeaflet = () => {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(true);
      return;
    }
    
    // Load Leaflet CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);
    
    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      console.log('Leaflet loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Leaflet');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

onMounted(async () => {
  console.log("2D Map component mounted, initializing Leaflet...");
  console.log(`WebSocket Client configured for aircraft data at ${webSocketConfig.host}:${webSocketConfig.port}`);
  
  await nextTick();
  
  // Load Leaflet and initialize 2D map
  const leafletLoaded = await loadLeaflet();
  if (leafletLoaded) {
    setTimeout(async () => {
      initLeafletMap();
      
      // Initialize airspace data after map is ready
      if (map && window.L) {
        console.log('🗺️ Loading airspace data for 2D map...');
        await loadAirspaceData();
        await createAirspaceLayers();
      }
    }, 1000);
  }
});

// Watch for aircraft prop changes
watch(() => props.aircraft, () => {
  if (map && mapLoaded.value) {
    console.log('🛰️ Aircraft prop data updated, refreshing markers');
    createAircraftMarkers();
  }
}, { deep: true });

// Watch for TCP sensor data changes
watch(() => sensorData.aircraft, () => {
  if (map && mapLoaded.value) {
    console.log('🛰️ TCP sensor data updated, refreshing markers');
    createAircraftMarkers();
  }
}, { deep: true });

// Watch for airspace visibility changes
watch(airspaceVisibility, (newVisibility) => {
  if (map && mapLoaded.value) {
    console.log('🗺️ Airspace visibility changed, updating 2D layers');
    
    for (const [airspaceType, visible] of Object.entries(newVisibility)) {
      const layerGroup = airspaceLayerGroups.get(airspaceType);
      if (layerGroup) {
        if (visible && !map.hasLayer(layerGroup)) {
          map.addLayer(layerGroup);
        } else if (!visible && map.hasLayer(layerGroup)) {
          map.removeLayer(layerGroup);
        }
      }
    }
  }
}, { deep: true });

// Watch for airspace data changes (if data is reloaded)
watch(airspaceData, async () => {
  if (map && mapLoaded.value) {
    console.log('🗺️ Airspace data updated, recreating 2D layers');
    await createAirspaceLayers();
  }
}, { deep: true });

// Watch message count
watch(messageCount, (count) => {
  console.log(`📡 Received ${count} messages from IoT sensor`);
});

onUnmounted(() => {
  try {
    // Stop animation
    animationActive = false;
    
    // Clean up Leaflet
    if (map) {
      map.remove();
    }
    
    // Clear markers
    aircraftMarkers.clear();
  } catch (error) {
    console.error("Error cleaning up Leaflet:", error);
  }
});
</script>

<style scoped>
.map-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  padding: 0;
  margin: 0;
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: row;
  gap:8px;
  z-index: 1000;
}

.zoom-controls .zoom-in + .zoom-out {
  margin-left: -4px; /* Tighter spacing between zoom in/out */
}

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
  background: var(--text-primary);
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

.reset-btn:hover {
  border-color: var(--bg-primary);
  color: var(--bg-primary);
}

.maximize-btn {
  border-top: 1px solid #334155;
  padding-top: 0;
}

.maximize-btn:hover {
  border-color: var(--bg-primary);
  color: var(--bg-primary);
}

.leaflet-map {
  width: 100%;
  height: 100%;
  min-width: 100%;
  min-height: 100%;
  max-width: 100%;
  max-height: 100%;
  font-family: sans-serif;
  position: relative;
  margin: 0;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  top: 0;
  left: 0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: white;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

/* Aircraft marker styles */
:deep(.aircraft-marker) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

:deep(.aircraft-icon) {
  transition: transform 0.3s ease;
}

:deep(.aircraft-icon svg) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Popup styles */
:deep(.leaflet-popup-content) {
  margin: 8px 12px !important;
  line-height: 1.4 !important;
}

:deep(.aircraft-popup) {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
}

:deep(.aircraft-popup h3) {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 600;
}

:deep(.aircraft-popup p) {
  margin: 4px 0;
  color: #374151;
}

:deep(.aircraft-popup strong) {
  color: #111827;
}

/* Loading spinner animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Hide Leaflet attribution */
:deep(.leaflet-control-attribution) {
  display: none !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .leaflet-map {
    width: 100vw;
    height: 100vh;
  }
}

@media (max-width: 480px) {
  .leaflet-map {
    width: 100vw;
    height: 100vh;
  }
  
  .loading-spinner {
    width: 36px;
    height: 36px;
    border-width: 2px;
  }
}
</style>

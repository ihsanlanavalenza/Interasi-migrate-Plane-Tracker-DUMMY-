<template>
  <div class="map-container">
    <!-- Cesium 3D Globe Container -->
    <div
      id="cesium-container"
      ref="cesiumContainer"
      class="cesium-map"
    >
      <div
        v-if="!mapLoaded"
        class="loading-overlay"
      >
        <div class="loading-content">
          <div class="loading-spinner"/>
          <p>Loading 3D Earth...</p>
          <p class="loading-tip">This may take a moment on first load</p>
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
        :map-mode="'3d'"
        @map-mode-changed="handleMapModeChange"
      />
      
      <button class="zoom-btn zoom-in" @click="zoomIn" title="Zoom In">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
      </button>
      <button class="zoom-btn zoom-out" @click="zoomOut" title="Zoom Out">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
        </svg>
      </button>
      <button class="zoom-btn reset-view-btn" @click="resetView" title="Reset View to Indonesia">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
          <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
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
const emit = defineEmits(['aircraft-clicked', 'zoom-in', 'zoom-out', 'reset-view', 'toggle-3d', 'layer-toggle', 'toggle-maximize', 'map-mode-changed']);

const cesiumContainer = ref(null);
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

let viewer;
const aircraftEntities = [];
const airspaceEntities = [];
let animationActive = false;

const initCesiumMap = async () => {
  if (!cesiumContainer.value) {
    console.error('Cesium container not found');
    return;
  }
  
  if (!window.Cesium) {
    console.error('Cesium not loaded');
    return;
  }
  
  try {
    console.log('Initializing Cesium 3D Globe...');
    console.log('Cesium container:', cesiumContainer.value);
    
    // Configure Cesium viewer with standard settings
    viewer = new Cesium.Viewer(cesiumContainer.value, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: true,
      sceneModePicker: false,
      selectionIndicator: true,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      shouldAnimate: false
    });
    
    console.log('Cesium viewer created:', viewer);
    
    // Enable unlimited camera movement globally
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableLook = true;
    
    // Set reasonable zoom limits but allow global dragging
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000; // 1km minimum
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50000000; // 50,000km maximum
    
    // FORCE the globe to be visible with simple settings
    viewer.scene.globe.show = true;
    viewer.scene.globe.enableLighting = false; // Keep simple for reliability
    viewer.scene.backgroundColor = Cesium.Color.BLACK;
    
    console.log('Basic viewer configuration complete');
    
    // Remove all existing imagery and add a simple, reliable provider
    viewer.imageryLayers.removeAll();
    
    // Use Cesium Ion's default imagery (most reliable)
    try {
      const defaultImagery = new Cesium.IonImageryProvider({ assetId: 3 });
      viewer.imageryLayers.addImageryProvider(defaultImagery);
      console.log('Added Cesium Ion default imagery');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      console.warn('Cesium Ion imagery failed, falling back to OpenStreetMap');
      // Fallback to OpenStreetMap if Ion fails
      const osmProvider = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
      });
      viewer.imageryLayers.addImageryProvider(osmProvider);
    }
    
    console.log('Added reliable Natural Earth II imagery with global navigation');
    
    // Set camera to see Indonesia clearly - centered on the archipelago
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.0, -2.5, 4500000), // Indonesia archipelago view from 4500km
      orientation: {
        heading: 0.0,
        pitch: Cesium.Math.toRadians(-90), // Look down at a steeper angle for better coverage
        roll: 0.0
      }
    });
    
    // Force immediate render
    viewer.scene.requestRender();
    
    console.log('Cesium viewer created with reliable Earth rendering and global navigation');

    // Add click handler for aircraft
    viewer.cesiumWidget.screenSpaceEventHandler.setInputAction((click) => {
      const pickedEntity = viewer.scene.pick(click.position);
      if (pickedEntity && pickedEntity.id && pickedEntity.id.aircraftData) {
        console.log('Aircraft clicked:', pickedEntity.id.aircraftData);
        emit('aircraft-clicked', pickedEntity.id.aircraftData);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Add sample aircraft after a delay to ensure globe is loaded
    setTimeout(async () => {
      await createSampleAircraft();
      // Load and render airspace data
      await loadAirspaceData();
      await createAirspaceEntities();
      // Start animation
      startAircraftAnimation();
      
      mapLoaded.value = true;
      console.log('Cesium 3D Globe initialized successfully');
    }, 2000);
    
  } catch (error) {
    console.error('Error initializing Cesium:', error);
  }
};

const createSampleAircraft = async () => {
  // Clear existing entities
  aircraftEntities.forEach(entity => {
    viewer.entities.remove(entity);
  });
  aircraftEntities.length = 0; // Clear array while maintaining reference

  let aircraftData = [];
  
  // First priority: Use aircraft prop data (from parent component)
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
    console.log(`Using -- ${aircraftData.length} --  aircraft from IoT sensor (prop data)`);
  }
  // Second priority: Use direct TCP sensor data (fallback)
  else if (sensorData.aircraft && sensorData.aircraft.length > 0) {
    // Use real sensor data from TCP client
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
    console.log(`Using -- ${aircraftData.length} -- aircraft from TCP sensor data (direct)`);
  } 

  else {
    // Fallback to simulated  flights
    aircraftData = [
      { 
        id: 'GA123', 
        name: 'Garuda Indonesia GA123',
        position: { lng: 106.8456, lat: -6.2088, alt: 35000 }, // Jakarta (Soekarno-Hatta)
        speed: 450,
        heading: 90,
        airline: 'Garuda Indonesia',
        dataSource: 'Simulated'
      },
      { 
        id: 'LN456', 
        name: 'Lion Air LN456',
        position: { lng: 110.4317, lat: -7.7956, alt: 38000 }, // Yogyakarta area
        speed: 480,
        heading: 45,
        airline: 'Lion Air',
        dataSource: 'Simulated'
      },
      { 
        id: 'SJ789', 
        name: 'Sriwijaya Air SJ789',
        position: { lng: 112.7521, lat: -7.2575, alt: 32000 }, // Surabaya (Juanda)
        speed: 420,
        heading: 180,
        airline: 'Sriwijaya Air',
        dataSource: 'Simulated'
      },
      { 
        id: 'ID101', 
        name: 'Batik Air ID101',
        position: { lng: 115.1667, lat: -8.7500, alt: 36000 }, // Bali (Ngurah Rai)
        speed: 460,
        heading: 270,
        airline: 'Batik Air',
        dataSource: 'Simulated'
      },
      { 
        id: 'QG555', 
        name: 'Citilink QG555',
        position: { lng: 119.5544, lat: -5.0617, alt: 33000 }, // Makassar area
        speed: 440,
        heading: 135,
        airline: 'Citilink',
        dataSource: 'Simulated'
      },
      { 
        id: 'WN321', 
        name: 'Wings Air WN321',
        position: { lng: 104.1178, lat: 1.1219, alt: 28000 }, // Batam area
        speed: 380,
        heading: 315,
        airline: 'Wings Air',
        dataSource: 'Simulated'
      }
    ];
    console.log('Using simulated Indonesian aircraft data (no TCP sensor data available)');
  }

  // Create aircraft entities
  aircraftData.forEach(flight => {
    // Validate required flight data to prevent Cesium errors
    if (!flight.position || 
        typeof flight.position.lat !== 'number' || 
        typeof flight.position.lng !== 'number' ||
        typeof flight.position.alt !== 'number' ||
        isNaN(flight.position.lat) || 
        isNaN(flight.position.lng) || 
        isNaN(flight.position.alt) ||
        Math.abs(flight.position.lat) > 90 || 
        Math.abs(flight.position.lng) > 180 ||
        flight.position.alt < 0 || 
        flight.position.alt > 60000) {
      console.warn(`Skipping aircraft ${flight.id} due to invalid position data:`, flight.position);
      return;
    }

    // Validate heading
    const heading = typeof flight.heading === 'number' && !isNaN(flight.heading) ? flight.heading : 0;
    const speed = typeof flight.speed === 'number' && !isNaN(flight.speed) && flight.speed > 0 ? flight.speed : 450;
    // Map sensor aircraft data to display format
    const mappedAircraftData = {
      icao: flight.id,
      hexIdent: flight.id,
      callsign: flight.name,
      registration: flight.registration || null,
      aircraftType: flight.aircraftType || null,
      latitude: flight.position.lat,
      longitude: flight.position.lng,
      altitude: flight.position.alt,
      groundSpeed: speed,
      speed: speed,
      track: heading,
      heading: heading,
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

    try {
      const aircraft = viewer.entities.add({
        id: flight.id,
        name: flight.name,
        position: Cesium.Cartesian3.fromDegrees(
          flight.position.lng, 
          flight.position.lat, 
          flight.position.alt
        ),
        point: {
          pixelSize: 8,
          color: Cesium.Color.YELLOW,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.NONE
        },
        label: {
          text: flight.name || flight.id, // Use callsign (name) if available, fallback to hex ID
          font: '12pt sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -50),
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          style: Cesium.LabelStyle.OUTLINE
        },
        description: `
          <div style="font-family: Arial, sans-serif;">
            <h3>${flight.name}</h3>
            <p><strong>ICAO:</strong> ${flight.id}</p>
            <p><strong>Airline:</strong> ${flight.airline || 'Unknown'}</p>
            <p><strong>Altitude:</strong> ${flight.position.alt.toLocaleString()} ft</p>
            <p><strong>Speed:</strong> ${speed} knots</p>
            <p><strong>Heading:</strong> ${heading}°</p>
            <p><strong>Status:</strong> En Route</p>
            <p><strong>Data Source:</strong> ${flight.dataSource}</p>
            <p><strong>WebSocket Server:</strong> ${webSocketConfig.host}:${webSocketConfig.port}</p>
            <p><strong>Connection:</strong> ${connectionStatus.value}</p>
          </div>
        `
      });
      
      // Store mapped aircraft data for click handler
      aircraft.aircraftData = mappedAircraftData;
      aircraft.flightData = flight;
      aircraftEntities.push(aircraft);
    } catch (error) {
      console.error(`Error creating aircraft entity for ${flight.id}:`, error);
    }
  });
};

const createAirspaceEntities = async () => {
  if (!viewer || !window.Cesium) {
    console.warn('Cannot create airspace entities: Cesium viewer not ready');
    return;
  }

  console.log('🗺️ Creating airspace entities...');
  
  // Clear existing airspace entities
  airspaceEntities.forEach(entity => {
    viewer.entities.remove(entity);
  });
  airspaceEntities.length = 0;

  let totalEntities = 0;

  // Process each airspace type
  for (const [airspaceType, data] of Object.entries(airspaceData)) {
    if (!data || !data.features || !airspaceVisibility[airspaceType]) {
      continue;
    }

    const colors = getAirspaceColor(airspaceType);
    const fillColor = Cesium.Color.fromBytes(colors.fill[0], colors.fill[1], colors.fill[2], Math.floor(colors.fill[3] * 255));
    const outlineColor = Cesium.Color.fromBytes(colors.outline[0], colors.outline[1], colors.outline[2], Math.floor(colors.outline[3] * 255));

    console.log(`🗺️ Processing ${airspaceType.toUpperCase()}: ${data.features.length} features`);

    for (const feature of data.features) {
      if (!feature.geometry || !feature.properties) continue;

      try {
        const airspaceName = feature.properties.layer || feature.properties.name || `${airspaceType.toUpperCase()} Zone`;
        
        // Handle MultiPolygon geometry
        if (feature.geometry.type === 'MultiPolygon') {
          for (let polygonIndex = 0; polygonIndex < feature.geometry.coordinates.length; polygonIndex++) {
            const polygon = feature.geometry.coordinates[polygonIndex];
            
            if (!polygon || !polygon[0]) continue;
            
            // Convert coordinates to Cesium format
            const coordinates = polygon[0]; // Use outer ring
            const positions = [];
            
            for (const coord of coordinates) {
              if (Array.isArray(coord) && coord.length >= 2) {
                const lon = parseFloat(coord[0]);
                const lat = parseFloat(coord[1]);
                
                if (!isNaN(lon) && !isNaN(lat) && 
                    Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
                  positions.push(Cesium.Cartesian3.fromDegrees(lon, lat));
                }
              }
            }
            
            if (positions.length < 3) continue; // Need at least 3 points for a polygon
            
            // Create polygon entity
            const entity = viewer.entities.add({
              id: `${airspaceType}_${feature.id}_${polygonIndex}`,
              name: airspaceName,
              polygon: {
                hierarchy: positions,
                material: fillColor,
                outline: true,
                outlineColor: outlineColor,
                outlineWidth: 2,
                extrudedHeight: 0,
                height: 0,
                show: true
              },
              description: `
                <div style="font-family: Arial, sans-serif; max-width: 300px;">
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
              `
            });
            
            // Store airspace type for layer control
            entity.airspaceType = airspaceType;
            airspaceEntities.push(entity);
            totalEntities++;
          }
        }
      } catch (error) {
        console.warn(`Error creating airspace entity for ${airspaceType}:`, error);
      }
    }
  }

  console.log(`🗺️ Created ${totalEntities} airspace entities across ${Object.keys(airspaceData).length} types`);
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
    'GA': 'Garuda Indonesia',
    'LN': 'Lion Air',
    'WN': 'Wings Air',
    'PAS': 'Pacific Air',
    'TX': 'Military/Training',
    'TNU': 'TransNusa',
    'WNI': 'Wings Air',
    'MNA': 'Mandala Airlines',
    'MYU' : 'My Indo Airlines',
    'NAM': 'Nam Air',
    'SJV': 'Super Air Jet',
    'FDX': 'FedEx',
    'UPS': 'UPS Airlines',
    'AAL': 'American Airlines',
    'DAL': 'Delta Air Lines',
    'UAL': 'United Airlines',
    'ASA': 'Alaska Airlines',
    'SWA': 'Southwest Airlines',
    'JBU': 'JetBlue Airways',
    'RPA': 'Republic Airways',
    'SKW': 'SkyWest Airlines',
    'DLH': 'Lufthansa',
    'BAW': 'British Airways',
    'AFL': 'Aeroflot',
    'AIB': 'Air India',
    'AFR': 'Air France',
    'EZY': 'easyJet',
    'RYR': 'Ryanair',
    'VLG': 'Vueling Airlines',
    'AEE': 'Aer Lingus',
    'IBK': 'Iberia',
    'SAS': 'Scandinavian Airlines',
    'KLM': 'Royal Dutch',
    'QFA': 'Qantas Airways',
    'ANZ': 'Air New Zealand',
    'CPA': 'Cathay Pacific',
    'JAL': 'Japan Airlines',
    'ANA': 'All Nippon Airways',
    'KAL': 'Korean Air',
    'CHH': 'China Airlines',
    'CCA': 'Air China',
    'CSN': 'China Southern Airlines',
    'CSZ': 'China Eastern Airlines',
    'HNA': 'Hainan Airlines',
    'CZ': 'China Southern Airlines',
    'MU': 'China Eastern Airlines',
    'CA': 'Air China',
    'CX': 'Cathay Pacific',
    'QTR': 'Qatar Airways',
    'UAE': 'Emirates',
    'ETH': 'Ethiopian Airlines',
    'SAA': 'South African Airways'
  };
  
  // Check first 3 characters, then first 2 characters for better matching
  const prefix3 = callsign.substring(0, 3);
  const prefix2 = callsign.substring(0, 2);
  
  return airlineMap[prefix3] || airlineMap[prefix2] || 'Unknown';
};

const startAircraftAnimation = () => {
  if (!viewer || animationActive || !aircraftEntities || aircraftEntities.length === 0) return;
  
  animationActive = true;
  
  const animate = () => {
    if (!animationActive || !viewer) return;
    
    // Simple animation - move aircraft slowly
    try {
      aircraftEntities.forEach(aircraft => {
        if (aircraft && aircraft.flightData && aircraft.position) {
          const flight = aircraft.flightData;
          const currentPosition = aircraft.position.getValue(Cesium.JulianDate.now());
          
          if (currentPosition && flight.speed && typeof flight.heading === 'number') {
            const cartographic = Cesium.Cartographic.fromCartesian(currentPosition);
            
            // Very slow movement for demonstration
            const speedMs = flight.speed * 0.514444; // knots to m/s
            const distance = speedMs * 0.01; // very slow movement
            const deltaLat = (distance / 111000) * Math.cos(Cesium.Math.toRadians(flight.heading));
            const deltaLon = (distance / 111000) * Math.sin(Cesium.Math.toRadians(flight.heading));
            
            const newLat = cartographic.latitude + Cesium.Math.toRadians(deltaLat);
            const newLon = cartographic.longitude + Cesium.Math.toRadians(deltaLon);
            
            // Validate new position before setting
            if (!isNaN(newLat) && !isNaN(newLon) && Math.abs(Cesium.Math.toDegrees(newLat)) <= 90 && Math.abs(Cesium.Math.toDegrees(newLon)) <= 180) {
              aircraft.position = Cesium.Cartesian3.fromRadians(newLon, newLat, cartographic.height);
            }
          }
        }
      });
    } catch (error) {
      console.error('Animation error:', error);
    }
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

// Map control functions
const zoomIn = () => {
  if (viewer && viewer.camera) {
    const currentHeight = viewer.camera.positionCartographic.height;
    const newHeight = Math.max(currentHeight * 0.5, 1000); // Minimum 1km
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromRadians(
        viewer.camera.positionCartographic.longitude,
        viewer.camera.positionCartographic.latitude,
        newHeight
      )
    });
  }
};

const zoomOut = () => {
  if (viewer && viewer.camera) {
    const currentHeight = viewer.camera.positionCartographic.height;
    const newHeight = Math.min(currentHeight * 2, 50000000); // Maximum 50,000km
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromRadians(
        viewer.camera.positionCartographic.longitude,
        viewer.camera.positionCartographic.latitude,
        newHeight
      )
    });
  }
};

const resetView = () => {
  if (viewer && viewer.camera) {
    console.log('Resetting view to Indonesia area...');
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.0, -2.5, 4500000), // Indonesia archipelago view from 4500km
      orientation: {
        heading: 0.0,
        pitch: Cesium.Math.toRadians(-90), // Look down at a steeper angle for better coverage
        roll: 0.0
      }
    });
  }
};

const toggle3D = (is3D) => {
  if (viewer) {
    if (is3D) {
      viewer.scene.mode = Cesium.SceneMode.SCENE3D;
    } else {
      viewer.scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
    }
  }
};

const toggleLayer = (layerInfo) => {
  console.log('Toggle layer:', layerInfo);
  // Implement layer visibility toggle
  if (viewer) {
    switch (layerInfo.layerId) {
      case 'aircraft':
        aircraftEntities.forEach(entity => {
          entity.show = layerInfo.enabled;
        });
        break;
      case 'terrain':
        viewer.terrainProvider = layerInfo.enabled 
          ? Cesium.createWorldTerrain()
          : new Cesium.EllipsoidTerrainProvider();
        break;
      // Handle airspace layers
      case 'ctr':
      case 'tma':
      case 'fir':
      case 'uta':
      case 'atz':
      case 'afiz':
      case 'sector':
        toggleAirspaceVisibility(layerInfo.layerId);
        airspaceEntities.forEach(entity => {
          if (entity.airspaceType === layerInfo.layerId) {
            entity.show = layerInfo.enabled;
          }
        });
        break;
      // Add more layer cases as needed
    }
  }
};

const centerOnAircraft = (aircraft) => {
  if (viewer && aircraft) {
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        aircraft.longitude, 
        aircraft.latitude, 
        aircraft.altitude + 10000
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0
      }
    });
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
  toggle3D,
  toggleLayer,
  centerOnAircraft
});

const loadCesium = async () => {
  if (window.Cesium) {
    return true;
  }
  
  return new Promise((resolve) => {
    console.log('Loading Cesium from CDN...');
    
    // Load Cesium CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/Widgets/widgets.css';
    document.head.appendChild(cssLink);
    
    // Load Cesium JavaScript
    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/Cesium.js';
    script.onload = () => {
      if (window.Cesium) {
        // Set Ion access token (updated token for better compatibility)
        window.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNzMyYjU2Zi0xMGY0LTRiN2QtOGI3Zi1hNDE4MDgzMzJlN2YiLCJpZCI6MTc2MTg2LCJpYXQiOjE2OTE5MzU5ODJ9.R7mGhLfpCl1XFxA8r-4d_O0LT_LCUOIRnNGh7uGjXEM';
        
        // Override buildModuleUrl to use our API proxy for local development
        if (window.Cesium.buildModuleUrl) {
          window.Cesium.buildModuleUrl = function(relativeUrl) {
            try {
              // For local development, use our API proxy
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return `/api/cesium-proxy?path=${encodeURIComponent(relativeUrl)}`;
              }
              // For production, use direct CDN
              return `https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/${relativeUrl}`;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_error) {
              console.warn(`Failed to build module URL for ${relativeUrl}, using CDN fallback`);
              return `https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/${relativeUrl}`;
            }
          };
        }
        
        console.log('Cesium loaded successfully with version:', window.Cesium.VERSION);
        console.log('buildModuleUrl override installed for API proxy');
        resolve(true);
      } else {
        console.error('Cesium failed to load from CDN');
        resolve(false);
      }
    };
    script.onerror = () => {
      console.error('Failed to load Cesium script from CDN');
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

onMounted(async () => {
  console.log("3D Map component mounted, initializing Cesium Globe...");
  console.log(`WebSocket Client configured for aircraft data at ${webSocketConfig.host}:${webSocketConfig.port}`);
  console.log('Cesium container element:', cesiumContainer.value);
  
  await nextTick();
  
  try {
    // Load Cesium and initialize 3D globe
    console.log('Starting Cesium loading process...');
    const cesiumLoaded = await loadCesium();
    console.log('Cesium loading result:', cesiumLoaded);
    
    if (cesiumLoaded) {
      console.log('Cesium loaded successfully, waiting before initialization...');
      // Give a bit more time for Cesium to be fully ready
      setTimeout(() => {
        console.log('Initializing Cesium map...');
        initCesiumMap();
      }, 2000);
    } else {
      console.error('Cesium failed to load. Please check your internet connection.');
      mapLoaded.value = true; // Show error state instead of loading forever
    }
  } catch (error) {
    console.error('Error during Cesium initialization:', error);
    mapLoaded.value = true; // Show error state instead of loading forever
  }
});

// Watch for airspace visibility changes
watch(() => airspaceVisibility, async () => {
  if (viewer && mapLoaded.value) {
    console.log('🗺️ Airspace visibility changed, refreshing airspace entities');
    await createAirspaceEntities();
  }
}, { deep: true });

// Watch for aircraft prop changes (primary data source)
watch(() => props.aircraft, () => {
  if (viewer && mapLoaded.value) {
    console.log('🛰️ Aircraft prop data updated, refreshing aircraft entities');
    createSampleAircraft();
  }
}, { deep: true });

// Watch for TCP sensor data changes (fallback data source)
watch(() => sensorData.aircraft, () => {
  if (viewer && mapLoaded.value) {
    console.log('🛰️ TCP sensor data updated, refreshing aircraft entities');
    createSampleAircraft();
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
    
    // Clean up Cesium
    if (viewer) {
      viewer.destroy();
    }
    
    // Clear entities
    aircraftEntities.length = 0; // Clear array while maintaining reference
    airspaceEntities.length = 0; // Clear airspace entities
  } catch (error) {
    console.error("Error cleaning up Cesium:", error);
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
  gap: 8px;
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

.maximize-btn {
  border-top: 1px solid #334155;
  padding-top: 0;
}

.maximize-btn:hover {
  background: var(--text-primary);
  border-color: var(--bg-primary);
  color: var(--bg-primary);
}

.cesium-map {
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

.loading-tip {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 8px;
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

/* Override Cesium default styles */
:deep(.cesium-viewer-bottom) {
  display: none !important;
}

:deep(.cesium-widget-credits) {
  display: none !important;
}

:deep(.cesium-viewer) {
  font-family: inherit;
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  top: 0 !important;
  left: 0 !important;
}

:deep(.cesium-widget) {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  top: 0 !important;
  left: 0 !important;
}

:deep(.cesium-canvas) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  padding: 0 !important;
  margin: 0 !important;
  top: 0 !important;
  left: 0 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cesium-map {
    width: 100vw;
    height: 100vh;
  }
}

@media (max-width: 480px) {
  .cesium-map {
    width: 100vw;
    height: 100vh;
  }
  
  .loading-spinner {
    width: 36px;
    height: 36px;
    border-width: 2px;
  }
}

/* Loading spinner animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

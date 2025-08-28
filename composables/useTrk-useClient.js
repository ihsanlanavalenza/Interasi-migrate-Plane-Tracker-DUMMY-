import { useTrackerConfig } from './useConfig.js'
import { ref, reactive, onUnmounted } from 'vue'

export const useWebSocketClient = () => {
  const { config } = useTrackerConfig()
  
  const isConnected = ref(false)
  const connectionStatus = ref('disconnected')
  const lastMessage = ref('')
  const messageCount = ref(0)
  const sensorData = reactive({
    aircraft: [],
    lastUpdate: null,
    rawData: '',
    altitudeRange: {
      min: null,
      max: null,
      withAltitude: 0,
      total: 0
    }
  })

  let ws = null
  let reconnectTimeout = null
  let reconnectAttempts = 0
  let lastPingTime = null
  let connectionStartTime = null
  let cleanupInterval = null
  const maxReconnectAttempts = 10

  // Start periodic cleanup of stale aircraft
  const startPeriodicCleanup = () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
    }
    
    cleanupInterval = setInterval(() => {
      const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000)
      const beforeCount = sensorData.aircraft.length
      
      // Filter out stale aircraft using splice to maintain reactivity
      for (let i = sensorData.aircraft.length - 1; i >= 0; i--) {
        if (sensorData.aircraft[i].lastSeen <= fifteenSecondsAgo) {
          sensorData.aircraft.splice(i, 1)
        }
      }
      
      const removedCount = beforeCount - sensorData.aircraft.length
      if (removedCount > 0) {
        console.log(`🗑️ Periodic cleanup: Removed ${removedCount} stale aircraft (not seen for 15+ seconds)`)
        sensorData.lastUpdate = new Date()
        updateAltitudeRange()
      }
    }, 5000) // Check every 5 seconds
  }

  // Stop periodic cleanup
  const stopPeriodicCleanup = () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }
  }

  // Update altitude range information
  const updateAltitudeRange = () => {
    const altitudes = sensorData.aircraft
      .filter(a => a.altitude !== null && a.altitude !== undefined)
      .map(a => a.altitude)
    
    sensorData.altitudeRange = {
      min: altitudes.length > 0 ? Math.min(...altitudes) : null,
      max: altitudes.length > 0 ? Math.max(...altitudes) : null,
      withAltitude: altitudes.length,
      total: sensorData.aircraft.length
    }
  }

  // WebSocket client configuration
  const webSocketConfig = {
    host: config.websocket.host,
    port: config.websocket.port,
    autoReconnect: true,
    maxReconnectAttempts: 10,
    reconnectInterval: 5000,
    timeout: 10000
  }

  const connect = async () => {
    try {
      console.log(`🔗 WebSocket Client: Connecting to aircraft data server at ${webSocketConfig.host}:${webSocketConfig.port}`)
      connectionStatus.value = 'connecting'
      connectionStartTime = Date.now()

      const wsUrl = `ws://${webSocketConfig.host}:${webSocketConfig.port}/`
      console.log('🔗 Connecting to WebSocket server at:', wsUrl)
      
      // Create WebSocket connection
      ws = new WebSocket(wsUrl)
      
      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws && ws.readyState === WebSocket.CONNECTING) {
          console.error('⏰ WebSocket connection timeout')
          ws.close()
        }
      }, webSocketConfig.timeout)
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        const connectionTime = Date.now() - connectionStartTime
        console.log(`✅ Connected to aircraft data WebSocket server (${connectionTime}ms)`)
        isConnected.value = true
        connectionStatus.value = 'connected'
        reconnectAttempts = 0
        
        // Start periodic cleanup of stale aircraft
        startPeriodicCleanup()
      }

      ws.onmessage = (event) => {
        try {
          lastPingTime = Date.now()
          
          // Parse WebSocket message
          let messageData
          try {
            messageData = JSON.parse(event.data)
          } catch (_parseError) {
            // Handle raw text messages if needed
            handleRawMessage(event.data)
            return
          }
          
          // Handle different message types
          if (messageData.type === 'aircraft-data') {
            // Handle individual aircraft data updates
            handleAircraftData(messageData.data || messageData)
          } else if (messageData.type === 'aircraft-list') {
            // Handle bulk aircraft data
            handleAircraftList(messageData.aircraft || messageData.data)
          } else if (messageData.type === 'connection') {
            console.log('🛰️ Server:', messageData.message)
            if (messageData.status === 'connected') {
              isConnected.value = true
              connectionStatus.value = 'connected'
            } else if (messageData.status === 'disconnected') {
              isConnected.value = false
              connectionStatus.value = 'disconnected'
            }
          } else if (messageData.type === 'error') {
            console.error('❌ Server Error:', messageData.message)
            connectionStatus.value = 'error'
          } else if (messageData.type === 'pong') {
            console.log('🏓 Received pong from server')
          } else {
            // Handle direct aircraft data without type wrapper
            if (messageData.hexIdent || messageData.icao) {
              handleAircraftData(messageData)
            }
          }
        } catch (error) {
          console.error('❌ Error processing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log(`🔌 WebSocket connection closed (code: ${event.code}, reason: ${event.reason})`)
        isConnected.value = false
        connectionStatus.value = 'disconnected'
        stopPeriodicCleanup()
        
        if (webSocketConfig.autoReconnect) {
          scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout)
        console.error('❌ WebSocket error:', error)
        ws = null
        isConnected.value = false
        connectionStatus.value = 'error'
        stopPeriodicCleanup()
      }

    } catch (error) {
      console.error('Connection error:', error)
      connectionStatus.value = 'error'
    }
  }

  // Handle raw text messages (fallback)
  const handleRawMessage = (rawData) => {
    lastMessage.value = rawData
    messageCount.value++
    sensorData.rawData = rawData
    sensorData.lastUpdate = new Date()
    
    console.log('📡 Raw message:', rawData.substring(0, 100) + '...')
  }

  // Handle individual aircraft data
  const handleAircraftData = (aircraftData) => {
    try {
      if (!aircraftData || !aircraftData.hexIdent) {
        return
      }

      // Apply data filters if needed
      if (!shouldIncludeAircraft(aircraftData)) {
        return
      }

      // Convert to standardized format
      const processedAircraft = {
        hexIdent: aircraftData.hexIdent || aircraftData.icao,
        icao: aircraftData.hexIdent || aircraftData.icao,
        callsign: aircraftData.callsign || null,
        latitude: aircraftData.latitude || aircraftData.lat,
        longitude: aircraftData.longitude || aircraftData.lng || aircraftData.lon,
        altitude: aircraftData.altitude || aircraftData.alt,
        groundSpeed: aircraftData.groundSpeed || aircraftData.speed,
        track: aircraftData.track || aircraftData.heading,
        squawk: aircraftData.squawk || null,
        verticalRate: aircraftData.verticalRate || null,
        timestamp: new Date(aircraftData.timestamp || Date.now()),
        lastSeen: new Date(),
        airline: getAirlineFromCallsign(aircraftData.callsign),
        onGround: aircraftData.onGround || false,
        emergency: aircraftData.emergency || false,
        alert: aircraftData.alert || false
      }

      updateAircraftData(processedAircraft)
      messageCount.value++
      sensorData.lastUpdate = new Date()

      // Log real-time update
      const logInfo = []
      if (processedAircraft.callsign) logInfo.push(processedAircraft.callsign)
      if (processedAircraft.altitude) logInfo.push(`${processedAircraft.altitude}ft`)
      if (processedAircraft.groundSpeed) logInfo.push(`${processedAircraft.groundSpeed}kt`)
      if (processedAircraft.latitude && processedAircraft.longitude) {
        logInfo.push(`${processedAircraft.latitude.toFixed(4)},${processedAircraft.longitude.toFixed(4)}`)
      }

      console.log(` AIRCRAFT UPDATE: ${processedAircraft.hexIdent} - ${logInfo.join(' | ')} (Total: ${sensorData.aircraft.length})`)

    } catch (error) {
      console.error('❌ Error processing aircraft data:', error)
    }
  }

  // Handle bulk aircraft data
  const handleAircraftList = (aircraftList) => {
    try {
      if (!Array.isArray(aircraftList)) {
        return
      }

      // Clear existing aircraft and add new ones
      sensorData.aircraft.splice(0, sensorData.aircraft.length)
      
      aircraftList.forEach(aircraft => {
        if (shouldIncludeAircraft(aircraft)) {
          const processedAircraft = {
            hexIdent: aircraft.hexIdent || aircraft.icao,
            icao: aircraft.hexIdent || aircraft.icao,
            callsign: aircraft.callsign || null,
            latitude: aircraft.latitude || aircraft.lat,
            longitude: aircraft.longitude || aircraft.lng || aircraft.lon,
            altitude: aircraft.altitude || aircraft.alt,
            groundSpeed: aircraft.groundSpeed || aircraft.speed,
            track: aircraft.track || aircraft.heading,
            squawk: aircraft.squawk || null,
            verticalRate: aircraft.verticalRate || null,
            timestamp: new Date(aircraft.timestamp || Date.now()),
            lastSeen: new Date(),
            airline: getAirlineFromCallsign(aircraft.callsign),
            onGround: aircraft.onGround || false,
            emergency: aircraft.emergency || false,
            alert: aircraft.alert || false
          }
          
          sensorData.aircraft.push(processedAircraft)
        }
      })

      // Sort aircraft by altitude
      sensorData.aircraft.sort((a, b) => {
        if (a.altitude === null || a.altitude === undefined) return 1
        if (b.altitude === null || b.altitude === undefined) return -1
        return a.altitude - b.altitude
      })

      updateAltitudeRange()
      sensorData.lastUpdate = new Date()
      
      console.log(`📊 Bulk update: ${sensorData.aircraft.length} aircraft loaded`)

    } catch (error) {
      console.error('❌ Error processing aircraft list:', error)
    }
  }

  // Check if aircraft should be included based on filters
  const shouldIncludeAircraft = (aircraftData) => {
    // Basic validation
    if (!aircraftData.hexIdent && !aircraftData.icao) {
      return false
    }

    // Require callsign if specified
    const hasRealCallsign = aircraftData.callsign && 
                           aircraftData.callsign.trim() !== '' &&
                           aircraftData.callsign !== aircraftData.hexIdent &&
                           aircraftData.callsign !== 'unknown'

    if (!hasRealCallsign) {
      return false
    }

    // Add more filters as needed (altitude, speed, position, etc.)
    
    return true
  }

  // Get airline from callsign
  const getAirlineFromCallsign = (callsign) => {
    if (!callsign || callsign === 'Unknown') {
      return 'Unknown'
    }

    const airlineMap = {
      // Indonesian Airlines - 3-character codes
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
      'MNA': 'Mandala Airlines',
      'MYU' : 'My Indo Airlines',
      'FDX': 'FedEx',
      'UPS': 'UPS Airlines',
      'AAL': 'American Airlines',
      'DAL': 'Delta Air Lines',
      'UAL': 'United Airlines',
      'SWA': 'Southwest Airlines',
      'JBU': 'JetBlue Airways',
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
      'SAA': 'South African Airways',
      'SJV': 'Super Air Jet',
      
      // Indonesian Airlines - 2-character codes (IATA)
      'GA': 'Garuda Indonesia',
      'QZ': 'Indonesia AirAsia',
      'IW': 'Wings Air',
      'IN': 'Nam Air',
      'IU': 'Super Air Jet',
      'XN': 'Xpress Air',
      'KD': 'Kalstar Aviation',
      'IL': 'Trigana Air',
      'IP': 'Pelita Air',
      '8B': 'TransNusa',
      
      // Regional Airlines
      'MV': 'Merpati Nusantara Airlines',
      'RI': 'Mandala Airlines',
      'SG': 'SpiceJet (Indonesia routes)',
      
      // Cargo Airlines
      'PO': 'Polar Air Cargo',
      'CV': 'Cargolux',
      
      // International Airlines common in Indonesia
      'SQ': 'Singapore Airlines',
      'MH': 'Malaysia Airlines',
      'TG': 'Thai Airways',
      'QF': 'Qantas',
      'AK': 'AirAsia Malaysia',
      'FD': 'Thai AirAsia',
      '3K': 'Jetstar Asia',
      'TR': 'Scoot',
      'MAS': 'Malaysia Airlines'
    }

    // Try different prefix lengths
    const callsignUpper = callsign.toUpperCase()
    
    // Try 3-character prefix first
    const prefix3 = callsignUpper.substring(0, 3)
    if (airlineMap[prefix3]) {
      return airlineMap[prefix3]
    }
    
    // Try 2-character prefix
    const prefix2 = callsignUpper.substring(0, 2)
    if (airlineMap[prefix2]) {
      return airlineMap[prefix2]
    }
    
    return 'Unknown'
  }

  // Update aircraft data with new information
  const updateAircraftData = (newData) => {
    const existingIndex = sensorData.aircraft.findIndex(a => a.hexIdent === newData.hexIdent)
    
    if (existingIndex >= 0) {
      // Update existing aircraft
      const existing = sensorData.aircraft[existingIndex]
      const updatedData = {}
      Object.entries(newData).forEach(([key, value]) => {
        if (value !== undefined) {
          updatedData[key] = value
        }
      })
      
      sensorData.aircraft[existingIndex] = {
        ...existing,
        ...updatedData,
        lastSeen: new Date()
      }
    } else {
      // Add new aircraft
      if (shouldIncludeAircraft(newData)) {
        sensorData.aircraft.push({
          ...newData,
          lastSeen: new Date()
        })
      }
    }

    // Remove stale aircraft (not seen for 15 seconds)
    const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000)
    const beforeCount = sensorData.aircraft.length
    
    // Filter out stale aircraft using splice to maintain reactivity
    for (let i = sensorData.aircraft.length - 1; i >= 0; i--) {
      if (sensorData.aircraft[i].lastSeen <= fifteenSecondsAgo) {
        sensorData.aircraft.splice(i, 1)
      }
    }
    
    const removedCount = beforeCount - sensorData.aircraft.length
    if (removedCount > 0) {
      console.log(`🗑️ Removed ${removedCount} stale aircraft (not seen for 15+ seconds)`)
    }
    
    // Sort aircraft by altitude
    sensorData.aircraft.sort((a, b) => {
      if (a.altitude === null || a.altitude === undefined) return 1
      if (b.altitude === null || b.altitude === undefined) return -1
      return a.altitude - b.altitude
    })
    
    updateAltitudeRange()
    sensorData.lastUpdate = new Date()
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    
    stopPeriodicCleanup()
    
    isConnected.value = false
    connectionStatus.value = 'disconnected'
    console.log('🔌 WebSocket connection closed')
  }

  const scheduleReconnect = () => {
    if (!webSocketConfig.autoReconnect) {
      console.log('🚫 Auto-reconnect disabled')
      return
    }
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++
      const delay = Math.min(
        webSocketConfig.reconnectInterval * Math.pow(2, reconnectAttempts - 1),
        30000 // Maximum 30 seconds
      )
      console.log(`🔄 Scheduling reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`)
      
      reconnectTimeout = setTimeout(() => {
        connect()
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached')
      connectionStatus.value = 'failed'
    }
  }

  // Get connection statistics
  const getConnectionStats = () => {
    return {
      isConnected: isConnected.value,
      connectionStatus: connectionStatus.value,
      reconnectAttempts,
      messageCount: messageCount.value,
      aircraftCount: sensorData.aircraft.length,
      lastUpdate: sensorData.lastUpdate,
      connectionTime: connectionStartTime ? Date.now() - connectionStartTime : 0,
      config: webSocketConfig
    }
  }

  // Auto cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    // State
    isConnected,
    connectionStatus,
    lastMessage,
    messageCount,
    sensorData,
    
    // Methods
    connect,
    disconnect,
    getConnectionStats,
    
    // Config
    webSocketConfig
  }
}

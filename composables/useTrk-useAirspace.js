// Composable for managing Indonesian airspace data (GeoJSON format)
import { ref, reactive } from 'vue'

const airspaceData = reactive({
  ctr: null,
  tma: null,
  fir: null,
  uta: null,
  atz: null,
  afiz: null,
  sector: null
})

const airspaceLoading = ref(false)
const airspaceError = ref(null)

// Airspace layer visibility state
const airspaceVisibility = reactive({
  ctr: true,     // Control Zones (CTR)
  tma: true,     // Terminal Maneuvering Areas (TMA)
  fir: false,    // Flight Information Regions (FIR) - too large, disabled by default
  uta: false,    // Upper Airspace (UTA) - high altitude, disabled by default
  atz: true,     // Air Traffic Zones (ATZ)
  afiz: false,   // Aerodrome Flight Information Zones (AFIZ)
  sector: true   // Control Sectors
})

// Color mapping for different airspace types
const airspaceColors = {
  ctr: { 
    fill: [255, 100, 100, 0.3],    // Red with transparency
    outline: [255, 100, 100, 0.8]  // Solid red outline
  },
  tma: { 
    fill: [100, 255, 100, 0.3],    // Green with transparency
    outline: [100, 255, 100, 0.8]  // Solid green outline
  },
  fir: { 
    fill: [100, 100, 255, 0.2],    // Blue with transparency
    outline: [100, 100, 255, 0.6]  // Solid blue outline
  },
  uta: { 
    fill: [255, 255, 100, 0.2],    // Yellow with transparency
    outline: [255, 255, 100, 0.7]  // Solid yellow outline
  },
  atz: { 
    fill: [255, 150, 0, 0.3],      // Orange with transparency
    outline: [255, 150, 0, 0.8]    // Solid orange outline
  },
  afiz: { 
    fill: [150, 0, 255, 0.3],      // Purple with transparency
    outline: [150, 0, 255, 0.8]    // Solid purple outline
  },
  sector: { 
    fill: [0, 255, 255, 0.25],     // Cyan with transparency
    outline: [0, 255, 255, 0.7]    // Solid cyan outline
  }
}

export const useAirspace = () => {

  
  const loadAirspaceData = async () => {
    if (airspaceLoading.value) return
    
    airspaceLoading.value = true
    airspaceError.value = null
    
    try {
      console.log('🗺️ Loading Indonesian airspace data...')
      
      const airspaceTypes = ['ctr', 'tma', 'fir', 'uta', 'atz', 'afiz', 'sector']
      const loadPromises = airspaceTypes.map(async (type) => {
        try {
          const response = await fetch(`/data/${type}.json`)
          if (!response.ok) {
            throw new Error(`Failed to load ${type.toUpperCase()} data: ${response.statusText}`)
          }
          const data = await response.json()
          airspaceData[type] = data
          console.log(`✅ Loaded ${type.toUpperCase()}: ${data.features?.length || 0} features`)
          return { type, success: true, count: data.features?.length || 0 }
        } catch (error) {
          console.warn(`⚠️ Failed to load ${type.toUpperCase()}:`, error.message)
          airspaceData[type] = null
          return { type, success: false, error: error.message }
        }
      })
      
      const results = await Promise.all(loadPromises)
      const successCount = results.filter(r => r.success).length
      const totalFeatures = results.reduce((sum, r) => sum + (r.count || 0), 0)
      
      console.log(`🗺️ Airspace loading complete: ${successCount}/${airspaceTypes.length} types loaded, ${totalFeatures} total features`)
      
    } catch (error) {
      console.error('❌ Failed to load airspace data:', error)
      airspaceError.value = error.message
    } finally {
      airspaceLoading.value = false
    }
  }
  
  const getAirspaceByType = (type) => {
    return airspaceData[type]
  }
  
  const getAllAirspace = () => {
    return airspaceData
  }
  
  const toggleAirspaceVisibility = (type) => {
    if (type in airspaceVisibility) {
      airspaceVisibility[type] = !airspaceVisibility[type]
      console.log(`🗺️ ${type.toUpperCase()} visibility: ${airspaceVisibility[type] ? 'ON' : 'OFF'}`)
    }
  }
  
  const setAirspaceVisibility = (type, visible) => {
    if (type in airspaceVisibility) {
      airspaceVisibility[type] = visible
    }
  }
  
  const getAirspaceVisibility = (type) => {
    return airspaceVisibility[type] || false
  }
  
  const getAllVisibility = () => {
    return airspaceVisibility
  }
  
  const getAirspaceColor = (type) => {
    return airspaceColors[type] || airspaceColors.sector
  }
  
  // Parse altitude strings to numeric values for comparison
  const parseAltitude = (altString) => {
    if (!altString || typeof altString !== 'string') return 0
    
    const cleaned = altString.toUpperCase().trim()
    
    // Ground/Water level
    if (cleaned.includes('GND') || cleaned.includes('WATER') || cleaned.includes('SFC')) {
      return 0
    }
    
    // Flight levels (FL XXX = XXX * 100 feet)
    if (cleaned.startsWith('FL')) {
      const flNumber = parseInt(cleaned.replace('FL', '').trim())
      return isNaN(flNumber) ? 0 : flNumber * 100
    }
    
    // Feet values
    if (cleaned.includes('FT')) {
      const match = cleaned.match(/(\d+)\s*FT/)
      if (match) {
        return parseInt(match[1])
      }
    }
    
    // Meters (convert to feet)
    if (cleaned.includes('M') && !cleaned.includes('FT')) {
      const match = cleaned.match(/(\d+)\s*M/)
      if (match) {
        return parseInt(match[1]) * 3.28084 // Convert meters to feet
      }
    }
    
    // Plain number (assume feet)
    const number = parseInt(cleaned)
    return isNaN(number) ? 0 : number
  }
  
  // Get airspace info for a specific location and altitude
  const getAirspaceAtLocation = (longitude, latitude, altitude = 0) => {
    const result = []
    
    // Check each airspace type
    for (const [type, data] of Object.entries(airspaceData)) {
      if (!data || !data.features || !airspaceVisibility[type]) continue
      
      for (const feature of data.features) {
        if (!feature.geometry || !feature.properties) continue
        
        // Check altitude constraints
        const lower = parseAltitude(feature.properties.lower)
        const upper = parseAltitude(feature.properties.upper)
        
        if (altitude < lower || (upper > 0 && altitude > upper)) {
          continue // Outside altitude range
        }
        
        // Simple point-in-polygon check for MultiPolygon
        if (feature.geometry.type === 'MultiPolygon') {
          for (const polygon of feature.geometry.coordinates) {
            if (isPointInPolygon(longitude, latitude, polygon[0])) {
              result.push({
                type,
                name: feature.properties.layer || feature.properties.name || `${type.toUpperCase()} Zone`,
                class: feature.properties.class,
                lower: feature.properties.lower,
                upper: feature.properties.upper,
                callsign: feature.properties.callsign,
                frequency: feature.properties.freq,
                service: feature.properties.unt_srvc,
                remarks: feature.properties.remarks
              })
              break
            }
          }
        }
      }
    }
    
    return result
  }
  
  // Simple point-in-polygon test using ray casting
  const isPointInPolygon = (x, y, polygon) => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i][1] > y) !== (polygon[j][1] > y)) &&
          (x < (polygon[j][0] - polygon[i][0]) * (y - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0])) {
        inside = !inside
      }
    }
    return inside
  }
  
  // Get airspace statistics
  const getAirspaceStats = () => {
    const stats = {}
    
    for (const [type, data] of Object.entries(airspaceData)) {
      stats[type] = {
        loaded: !!data,
        count: data?.features?.length || 0,
        visible: airspaceVisibility[type]
      }
    }
    
    return stats
  }
  
  // Legacy compatibility methods for existing code
  const getActiveAirspace = () => {
    const allAirspace = []
    Object.entries(airspaceData).forEach(([type, data]) => {
      if (data && data.features && airspaceVisibility[type]) {
        data.features.forEach(feature => {
          if (feature.properties) {
            allAirspace.push({
              id: feature.id,
              name: feature.properties.layer || feature.properties.name,
              type: type.toUpperCase(),
              active: true,
              upperLimit: feature.properties.upper,
              lowerLimit: feature.properties.lower,
              frequency: feature.properties.freq,
              controlCenter: feature.properties.callsign
            })
          }
        })
      }
    })
    return allAirspace
  }

  const getAirspaceById = (id) => {
    for (const [type, data] of Object.entries(airspaceData)) {
      if (data && data.features) {
        const feature = data.features.find(f => f.id === id)
        if (feature) {
          return {
            id: feature.id,
            name: feature.properties.layer || feature.properties.name,
            type: type.toUpperCase(),
            coordinates: feature.geometry.coordinates,
            upperLimit: feature.properties.upper,
            lowerLimit: feature.properties.lower,
            frequency: feature.properties.freq,
            controlCenter: feature.properties.callsign,
            active: true
          }
        }
      }
    }
    return null
  }

  const getAirspaceBoundaries = (type = null) => {
    const boundaries = []
    
    const processType = (airspaceType, data) => {
      if (data && data.features && airspaceVisibility[airspaceType]) {
        data.features.forEach(feature => {
          if (feature.geometry && feature.properties) {
            boundaries.push({
              id: feature.id,
              name: feature.properties.layer || feature.properties.name,
              type: airspaceType,
              coordinates: feature.geometry.coordinates,
              upperLimit: feature.properties.upper,
              lowerLimit: feature.properties.lower,
              frequency: feature.properties.freq,
              controlCenter: feature.properties.callsign
            })
          }
        })
      }
    }

    if (type) {
      // Return only specific type
      if (airspaceData[type]) {
        processType(type, airspaceData[type])
      }
    } else {
      // Return all types
      Object.entries(airspaceData).forEach(([airspaceType, data]) => {
        processType(airspaceType, data)
      })
    }
    
    return boundaries
  }

  const isPointInAirspace = (lat, lon, airspaceId) => {
    const airspace = getAirspaceById(airspaceId)
    if (!airspace || !airspace.coordinates) return false

    // Handle MultiPolygon coordinates
    if (Array.isArray(airspace.coordinates[0]) && Array.isArray(airspace.coordinates[0][0]) && Array.isArray(airspace.coordinates[0][0][0])) {
      // MultiPolygon format
      for (const polygon of airspace.coordinates) {
        if (isPointInPolygon(lon, lat, polygon[0])) {
          return true
        }
      }
    } else if (Array.isArray(airspace.coordinates[0]) && Array.isArray(airspace.coordinates[0][0])) {
      // Polygon format
      return isPointInPolygon(lon, lat, airspace.coordinates[0])
    }
    
    return false
  }

  return {
    // Data
    airspaceData,
    airspaceLoading,
    airspaceError,
    airspaceVisibility,
    airspaceColors,
    
    // Core Methods
    loadAirspaceData,
    getAirspaceByType,
    getAllAirspace,
    toggleAirspaceVisibility,
    setAirspaceVisibility,
    getAirspaceVisibility,
    getAllVisibility,
    getAirspaceColor,
    getAirspaceAtLocation,
    getAirspaceStats,
    parseAltitude,
    
    // Active methods (used by components)
    getActiveAirspace,
    getAirspaceById,
    getAirspaceBoundaries,
    isPointInAirspace,
    
    // Aliases for compatibility
    loading: airspaceLoading,
    error: airspaceError
  }
}

<template>
  <div class="aircraft-table-container">
    <div class="table-wrapper">
      <table class="aircraft-table table-base">
      <thead>
        <tr>
          <th>Hex ID</th>
          <th>Callsign</th>
          <th>Airline</th>
          <th>Alt</th>
          <th>Spd</th>
          <th>Hdg</th>
          <th>Pos</th>
          <th>Squawk</th>
          <th>Status</th>
          <th>Updated At</th>
        </tr>
      </thead>
        <tbody>
          <tr v-if="aircraft.length === 0">
            <td colspan="10" class="no-data text-center text-disabled">No aircraft detected yet...</td>
          </tr>
          <tr
            v-for="plane in sortedAircraft"
            :key="plane.hexIdent"
            class="aircraft-row table-row-hover"
            :class="getRowClass(plane)"
          >
            <td class="hex-id">
              <code class="code">{{ plane.hexIdent }}</code>
            </td>
            <td class="callsign">
              <span class="font-semibold text-secondary">{{ plane.callsign }}</span>
            </td>
            <td class="airline text-secondary">
              {{ plane.airline }}
            </td>
            <td class="altitude">
              <span v-if="plane.altitude" class="text-secondary">
                {{ formatAltitude(plane.altitude) }}
              </span>
              <span v-else class="no-data text-disabled">—</span>
            </td>
            <td class="speed">
              <span v-if="plane.groundSpeed" class="text-secondary">
                {{ plane.groundSpeed }} kts
              </span>
              <span v-else class="no-data text-disabled">—</span>
            </td>
            <td class="track">
              <span v-if="plane.track !== null" class="text-secondary"> {{ plane.track }}° </span>
              <span v-else class="no-data text-disabled">—</span>
            </td>
            <td class="position">
              <span v-if="plane.latitude && plane.longitude" class="text-secondary">
                {{ formatPosition(plane.latitude, plane.longitude) }}
              </span>
              <span v-else class="no-data text-disabled">—</span>
            </td>
            <td class="squawk">
              <code v-if="plane.squawk" class="code">{{ plane.squawk }}</code>
              <span v-else class="no-data text-disabled">—</span>
            </td>
            <td class="status">
              <div class="status-indicators flex gap-1">
                <span v-if="plane.emergency" class="status-badge emergency">EMG</span>
                <span v-if="plane.alert" class="status-badge alert">ALT</span>
                <span v-if="plane.spi" class="status-badge spi">SPI</span>
                <span v-if="plane.isOnGround" class="status-badge ground">GND</span>
                <span v-if="!hasAnyStatus(plane)" class="status-badge normal">OK</span>
              </div>
            </td>
            <td class="last-seen text-secondary">
              {{ formatLastSeen(plane.lastSeen) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  aircraft: {
    type: Array,
    default: () => [],
  },
  altitudeRange: {
    type: Object,
    default: () => ({ min: null, max: null, withAltitude: 0, total: 0 }),
  },
  maxRows: {
    type: Number,
    default: 100 // Default maximum of 100 rows to prevent panel overflow
  },
  isHalfHeight: {
    type: Boolean,
    default: false // Whether the panel is in split (half-height) mode
  }
})

// Calculate effective max rows based on panel size
const effectiveMaxRows = computed(() => {
  // Reduce max rows when in half-height mode to fit better
  return props.isHalfHeight ? Math.min(props.maxRows, 25) : props.maxRows;
});

// Sort aircraft by altitude and limit the number of displayed rows
const sortedAircraft = computed(() => {
  const sorted = [...props.aircraft].sort((a, b) => {
    // Handle null/undefined altitudes
    if (a.altitude == null && b.altitude == null) return 0;
    if (a.altitude == null) return 1; // null goes to end
    if (b.altitude == null) return -1; // null goes to end

    // Sort by altitude (ascending - lowest first)
    return a.altitude - b.altitude;
  });
  
  // Limit the number of rows to prevent panel overflow
  return sorted.slice(0, effectiveMaxRows.value);
});

// Computed property to check if there are more aircraft than displayed
const hasMoreAircraft = computed(() => {
  return props.aircraft.length > effectiveMaxRows.value;
});

const totalAircraftCount = computed(() => {
  return props.aircraft.length;
});

// Format altitude with commas
const formatAltitude = (altitude) => {
  return altitude.toLocaleString() + " ft";
};

// Format position coordinates
const formatPosition = (lat, lon) => {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
};

// Format last seen time
const formatLastSeen = (timestamp) => {
  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diffMs = now - lastSeen;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  } else if (diffSec < 3600) {
    return `${Math.floor(diffSec / 60)}m ago`;
  } else {
    return lastSeen.toLocaleTimeString();
  }
};

// Check if aircraft has any status flags
const hasAnyStatus = (plane) => {
  return plane.emergency || plane.alert || plane.spi || plane.isOnGround;
};

// Get row class based on aircraft status
const getRowClass = (plane) => {
  if (plane.emergency) return "emergency-row";
  if (plane.alert) return "alert-row";
  if (plane.isOnGround) return "ground-row";
  return "";
};
</script>

<style scoped>
.aircraft-table-container {
  overflow: hidden;
  height: 100%;
  max-height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 0; /* Allow flex child to shrink below content size */
  max-height: 100%; /* Ensure it doesn't grow beyond container */
}

.aircraft-table {
  font-size: 0.875rem;
  width: 100%;
  min-width: 800px; /* Ensure horizontal scrolling on narrow containers */
  border-collapse: collapse;
}

.aircraft-table thead {
  background: rgba(51, 65, 85, 0.9);
  position: sticky;
  top: 0;
  z-index: 10;
}

.aircraft-table th {
  padding: 8px 6px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-primary);
  white-space: nowrap;
  background: rgba(51, 65, 85, 0.9);
}

.aircraft-table td {
  padding: 8px 6px;
  border-bottom: 1px solid var(--border-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Overflow indicator styling */
.overflow-indicator {
  flex-shrink: 0;
  padding: 6px 12px;
  background: rgba(245, 158, 11, 0.1);
  border-top: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.overflow-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 500;
}

.overflow-icon {
  font-size: 0.875rem;
}

.overflow-note {
  font-style: italic;
  opacity: 0.8;
  font-size: 0.7rem;
}

/* Column-specific alignments */
.callsign,
.airline {
  text-align: left;
}

.status-indicators {
  flex-wrap: wrap;
  justify-content: center;
}

.emergency-row {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid var(--status-emergency);
}

.alert-row {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid var(--status-alert);
}

.ground-row {
  background: rgba(107, 114, 128, 0.1);
  border-left: 3px solid var(--status-ground);
}

.status-indicators {
  flex-wrap: wrap;
}

.status-badge.spi {
  background: #7c3aed;
  color: white;
}

/* Scrollbar styling */
.table-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--border-secondary);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary);
}

.table-wrapper::-webkit-scrollbar-corner {
  background: var(--bg-tertiary);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .aircraft-table {
    font-size: 0.7rem;
  }

  .aircraft-table-container {
    min-height: 180px;
  }

  .overflow-indicator {
    padding: 4px 8px;
  }

  .overflow-message {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .aircraft-table-container {
    min-height: 150px;
  }

  .aircraft-table {
    font-size: 0.65rem;
  }

  .overflow-indicator {
    padding: 3px 6px;
  }

  .overflow-message {
    font-size: 0.65rem;
  }
}
</style>

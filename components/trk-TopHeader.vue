<template>
  <div class="header-bar">
    <div class="header-left">
      <div class="logo-section">
        <div class="logo-icon" style="transform: scaleX(-1); font-size: 32px;">👀</div>
        <div class="logo-text">
          <h1 class="title">Indonesian Airspace Surveillance System</h1>
        </div>
      </div>
    </div>
    
    <div class="header-center">
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery"
          @input="onSearchInput"
          @keyup.enter="performSearch"
          placeholder="Cari flight, callsign, bandara..."
          class="search-input"
        />
        <button class="search-button" @click="performSearch">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="header-right">
      <div class="connection-status">
        <div class="status-indicator" :class="getStatusClass">
          <span class="status-dot"></span>
          <span class="status-text">{{ getStatusText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  connectionStatus: {
    type: String,
    default: 'Disconnected'
  },
  isConnected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['search'])

const searchQuery = ref('')

const getStatusClass = computed(() => {
  switch (props.connectionStatus.toLowerCase()) {
    case 'connected':
      return 'status-connected'
    case 'connecting':
      return 'status-connecting'
    default:
      return 'status-disconnected'
  }
})

const getStatusText = computed(() => {
  switch (props.connectionStatus.toLowerCase()) {
    case 'connected':
      return 'Terhubung'
    case 'connecting':
      return 'Menghubungkan'
    default:
      return 'Terputus'
  }
})

const onSearchInput = () => {
  // Real-time search as user types (debounced)
  if (searchQuery.value.length >= 2) {
    performSearch()
  }
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
  }
}
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-primary);
  padding: 8px 24px;
  backdrop-filter: blur(10px);
  height: var(--header-height);
  position: relative;
  z-index: var(--z-header);
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  padding-bottom: 0;
  padding-right: 12px;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  color: var(--color-secondary);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.title {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
  padding: 0 24px;
  min-width: 0;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 36px 8px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-secondary);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 14px;
  transition: all var(--transition-fast);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--border-focus);
  background: var(--bg-input-focus);
  box-shadow: var(--shadow-focus);
}

.search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  color: var(--color-secondary);
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.connection-status {
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.status-text {
  white-space: nowrap;
}

/* Responsive design */
@media (max-width: 1024px) {
  .header-bar {
    padding: 10px 20px;
  }

  .title {
    font-size: 16px;
  }

  .logo-icon {
    font-size: 24px;
  }

  .header-center {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 6px 16px;
    height: auto;
    min-height: var(--header-height);
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-left,
  .header-center,
  .header-right {
    flex: none;
  }

  .header-left {
    order: 1;
    width: auto;
  }

  .header-right {
    order: 2;
    width: auto;
  }

  .header-center {
    order: 3;
    width: 100%;
    padding: 0;
    margin-top: 8px;
  }

  .title {
    font-size: 14px;
  }

  .logo-icon {
    font-size: 20px;
  }

  .search-input {
    font-size: 13px;
    padding: 8px 36px 8px 12px;
  }

  .status-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-bar {
    padding: 6px 12px;
  }

  .title {
    font-size: 12px;
  }

  .logo-icon {
    font-size: 18px;
  }

  .logo-section {
    gap: 8px;
  }

  .search-input {
    font-size: 12px;
    padding: 6px 32px 6px 10px;
  }

  .search-button {
    padding: 4px;
  }
}
</style>

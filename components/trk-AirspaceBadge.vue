<template>
  <span 
    :class="[
      'airspace-badge',
      badgeClasses
    ]"
  >
    <slot>{{ status }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => {
      const validStatuses = ['UTA', 'AFIZ', 'SECTOR', 'ATZ', 'TMA', 'FIR', 'CTR']
      return validStatuses.includes(value.toUpperCase())
    }
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outline', 'soft'].includes(value)
  }
})

const badgeClasses = computed(() => {
  const statusUpper = props.status.toUpperCase()
  
  // Return status-specific classes based on airspace type
  const statusClasses = {
    'UTA': 'badge-uta',
    'AFIZ': 'badge-afiz', 
    'SECTOR': 'badge-sector',
    'ATZ': 'badge-atz',
    'TMA': 'badge-tma',
    'FIR': 'badge-fir',
    'CTR': 'badge-ctr'
  }
  
  const variantClass = props.variant !== 'default' ? `badge-${props.variant}` : ''
  
  return [
    statusClasses[statusUpper] || 'badge-default',
    variantClass
  ].filter(Boolean)
})
</script>

<style scoped>
.airspace-badge {
  text-align: center;
  font-size: 11px;
  }
</style>

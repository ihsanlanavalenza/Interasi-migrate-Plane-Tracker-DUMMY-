<template>
  <Teleport to="body">
    <transition name="loading-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center"
        role="status" aria-live="polite"
        :style="{ background: 'linear-gradient(135deg, #0b1220 0%, #0e2344 50%, #0c4a6e 100%)' }"
      >
        <div class="flex flex-col items-center text-white">
          <!-- Radar container -->
          <div class="relative w-32 h-32">
            <!-- outer breathing ring -->
            <div class="absolute inset-0 rounded-full border border-cyan-400/20 animate-[breath_2.8s_ease-in-out_infinite]"></div>
            <!-- static rings -->
            <div class="absolute inset-2 rounded-full border border-white/10"></div>
            <div class="absolute inset-6 rounded-full border border-white/10"></div>
            <div class="absolute inset-10 rounded-full border border-white/10"></div>
            <!-- sweep beam -->
            <div class="absolute inset-0 rounded-full overflow-hidden">
              <div class="absolute inset-0" :style="beamStyle"></div>
            </div>
            <!-- center pulse -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300 animate-[pulse-soft_1.8s_ease-in-out_infinite]"></div>
          </div>
          <div class="mt-6 flex items-center gap-2">
            <!-- tiny logo -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="opacity-90">
              <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z" fill="#fff"/>
            </svg>
            <span class="font-medium">Airspace Surveillance</span>
          </div>
          <p class="mt-1 text-white/70 text-sm">{{ message }}</p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

withDefaults(defineProps<{ message?: string, visible?: boolean }>(), {
  message: 'Initializing secure session…',
  visible: true
})

const beamStyle = computed(() => ({
  background: 'conic-gradient(from 0deg at 50% 50%, rgba(34,211,238,.55), rgba(34,211,238,0) 35%)',
  animation: 'radar-sweep 4s linear infinite'
}))
</script>

<style>
@media (prefers-reduced-motion: reduce) {
  .loading-fade-enter-active, .loading-fade-leave-active { transition: opacity .2s ease; }
}
@media (prefers-reduced-motion: no-preference) {
  .loading-fade-enter-active, .loading-fade-leave-active { transition: opacity .22s ease, transform .22s ease; }
  .loading-fade-enter-from, .loading-fade-leave-to { opacity: 0; transform: scale(.98); }
}
</style>

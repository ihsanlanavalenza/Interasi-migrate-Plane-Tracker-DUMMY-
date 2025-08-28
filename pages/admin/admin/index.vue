<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'
import { ref } from 'vue'
const auth = useAuthStore()
const ui = useUiStore()

// Simulate fetching dashboard stats
const pending = ref(true)
const stats = ref<{ title: string; value: string }[] | null>(null)

if (process.client) {
  ui.show(150)
  setTimeout(() => {
    stats.value = [
      { title: 'Active Radars', value: '12' },
      { title: 'Tracked Flights', value: '248' },
      { title: 'Alerts (24h)', value: '3' },
    ]
    pending.value = false
    ui.hide()
  }, 800)
}
</script>
<template>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <div class="relative w-full max-w-3xl">
      <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to opacity-20 blur-xl"></div>
      <div class="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 ring-1 ring-white/10">
      <h1 class="text-3xl font-bold text-white mb-2">Indonesian Airspace Surveillance System</h1>
      <div class="text-white mb-4">Selamat datang, <b>{{ auth.user?.fullName }}</b> ({{ auth.user?.role }})</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatSkeleton v-if="pending" />
          <StatSkeleton v-if="pending" />
          <StatSkeleton v-if="pending" />
          <div v-if="!pending" v-for="s in stats" :key="s.title" class="glass-card soft-shadow p-6 rounded-2xl">
            <div class="text-white/70 text-sm">{{ s.title }}</div>
            <div class="mt-2 text-3xl font-semibold">{{ s.value }}</div>
          </div>
        </div>
      <div class="flex gap-4">
        <NuxtLink to="/admin/users" class="px-4 py-2 rounded bg-primary-700 hover:bg-primary-800 text-white font-semibold transition">Manajemen User</NuxtLink>
        <button @click="auth.logout" class="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white font-semibold transition shadow-lg shadow-red-900/30">Logout</button>
      </div>
      </div>
    </div>
  </div>
</template>

<template>
  <div class="min-h-screen text-white" style="background: linear-gradient(135deg, #0a2342 0%, #1e3a8a 100%);">
    <!-- Top bar -->
    <header class="sticky top-0 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10 z-40">
      <div class="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button v-if="isAuthed" class="p-2 rounded-lg hover:bg-white/10" @click="collapsed = !collapsed" aria-label="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="#fff" stroke-opacity=".9" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <BrandLogo />x
        </div>
        <div v-if="isAuthed" class="flex items-center gap-4" @keydown.escape="open=false">
          <!-- Nav header hanya saat login -->
          
          <!-- Menu akun -->
          <div class="relative">
            <button @click="open = !open" class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to grid place-items-center">
                <IconUser class="h-4 w-4 text-white/90" />
              </div>
              <span class="text-sm text-white/90">Akun</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="opacity-80"><path d="M6 9l6 6 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div v-if="open" class="absolute right-0 mt-2 w-48 glass-card soft-shadow p-2 rounded-2xl">
              <NuxtLink to="/admin" class="block px-3 py-2 rounded-lg hover:bg-white/10">Akun</NuxtLink>
              <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10" @click="auth.logout()">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar hanya saat login -->
      <aside v-if="isAuthed" :class="['transition-all duration-300 ease-[cubic-bezier(.2,.6,.2,1)]', collapsed ? 'w-16' : 'w-60']" class="hidden md:block bg-white/5 backdrop-blur border-r border-white/10 min-h-[calc(100vh-56px)] sticky top-14">
        <nav class="p-3 space-y-1">
          <NuxtLink to="/admin" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10">
            <span class="w-5 h-5 text-white/80"><IconDashboard /></span>
            <span v-if="!collapsed">Dashboard</span>
          </NuxtLink>
          <NuxtLink v-if="auth.user && auth.user.role === 'SUPER_ADMIN'" to="/admin/users" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10">
            <span class="w-5 h-5 text-white/80"><IconUsers /></span>
            <span v-if="!collapsed">Users</span>
          </NuxtLink>
        </nav>
      </aside>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BrandLogo from '~/components/BrandLogo.vue'
import IconUser from '~/components/icons/IconUser.vue'
import IconDashboard from '~/components/icons/IconDashboard.vue'
import IconUsers from '~/components/icons/IconUsers.vue'
import { useAuthStore } from '~/stores/auth'

const collapsed = ref(false)
const open = ref(false)
const auth = useAuthStore()
const isAuthed = computed(() => !!auth.user)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="relative w-full max-w-md">
      <!-- soft glow background -->
      <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to opacity-30 blur-2xl"></div>

      <!-- card -->
      <div class="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 ring-1 ring-white/10">
        <!-- header -->
        <div class="flex flex-col items-center mb-8 text-center">
          <div class="bg-primary-700 rounded-2xl w-16 h-16 grid place-items-center mb-3 shadow-lg shadow-blue-900/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#fff" fill-opacity=".18"/>
              <path d="M12 12.5a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12.5Zm0 2c-3.8 0-7 1.92-7 4.3V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.2c0-2.38-3.2-4.3-7-4.3Z" fill="#fff"/>
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-white">Masuk ke Panel Admin</h1>
          <p class="text-white/70 text-sm mt-1">Gunakan kredensial Anda untuk melanjutkan</p>
        </div>

        <!-- form -->
        <form @submit.prevent="onSubmit" class="space-y-5">
          <!-- username -->
          <div>
            <label for="username" class="block text-sm text-white/80 mb-1.5">Username</label>
            <div class="relative group">
              <div class="flex items-center gap-2 bg-white/5 ring-1 ring-white/10 rounded-xl px-3 py-2.5 focus-within:ring-cyan-400/40 transition">
                <svg class="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
                <input id="username" v-model="form.username" autocomplete="username"
                  class="w-full bg-transparent border-0 outline-none text-white placeholder-white/40 focus:ring-0"
                  placeholder="Masukkan username" required />
              </div>
            </div>
          </div>

          <!-- password -->
          <div>
            <label for="password" class="block text-sm text-white/80 mb-1.5">Password</label>
            <div class="relative">
              <div class="flex items-center gap-2 bg-white/5 ring-1 ring-white/10 rounded-xl px-3 py-2.5 focus-within:ring-cyan-400/40 transition">
                <svg class="w-5 h-5 text-white/70" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1Zm-6 6.732V17a1 1 0 1 0 2 0v-1.268a2 2 0 1 0-2 0ZM10 7a2 2 0 1 1 4 0v2h-4V7Z"/></svg>
                <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" autocomplete="current-password"
                  class="w-full bg-transparent border-0 outline-none text-white placeholder-white/40 focus:ring-0"
                  placeholder="Masukkan password" required />
                <button type="button" @click="showPassword = !showPassword" :aria-pressed="showPassword ? 'true' : 'false'"
                  class="p-1.5 rounded-md hover:bg-white/10 text-white/80" aria-label="Tampilkan/sembunyikan password">
                  <svg v-if="!showPassword" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-5 0-9 5.5-9 7s4 7 9 7s9-5.5 9-7s-4-7-9-7Zm0 11a4 4 0 1 1 0-8a4 4 0 0 1 0 8Z"/></svg>
                  <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.52 2.1a1 1 0 0 0-1.42 1.4l3.02 3.02C3.64 8.1 2.54 9.64 2 12c0 1.5 4 7 10 7c2.14 0 4-.66 5.56-1.68l2.92 2.92a1 1 0 1 0 1.42-1.42L3.52 2.1ZM12 17c-3.8 0-6.7-3.2-7.67-5c.43-.8 1.24-1.96 2.35-2.9l2.07 2.07A4 4 0 0 0 12 16c.5 0 .98-.1 1.41-.26l1.68 1.68c-.9.35-1.9.58-3.09.58Zm8.42-5c-.37.66-1 1.63-1.92 2.56l-2.23-2.23A4 4 0 0 0 11.67 8l-2.4-2.4A9.4 9.4 0 0 1 12 7c6 0 10 5.5 10 7c0 .37-.2.93-.58 1.6L20.42 12Z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- remember -->
          <div class="flex items-center justify-between">
            <label class="inline-flex items-center gap-2 select-none">
              <input v-model="form.remember" type="checkbox" class="form-checkbox text-primary-700 rounded" />
              <span class="text-sm text-white/80">Ingat saya</span>
            </label>
          </div>

          <!-- submit -->
          <button type="submit" :aria-busy="ui.isAppLoading ? 'true' : 'false'" :disabled="ui.isAppLoading"
            class="w-full py-2.5 rounded-xl bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold transition transform active:scale-[.99] shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2">
            <span class="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" v-if="ui.isAppLoading"></span>
            <span>Masuk</span>
          </button>
        </form>

        <div v-if="error" class="mt-4 text-red-200 text-center">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useUiStore } from '~/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const form = ref({ username: '', password: '', remember: false })
const error = ref('')
const showPassword = ref(false)

const onSubmit = async () => {
  error.value = ''
  try {
    ui.show(150)
    await auth.login(form.value)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Login gagal.'
  } finally {
    ui.hide()
  }
}
</script>

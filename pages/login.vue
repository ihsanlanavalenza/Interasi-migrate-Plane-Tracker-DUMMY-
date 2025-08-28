<!-- pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form @submit.prevent="submit" class="w-full max-w-sm bg-white/80 rounded-2xl shadow p-6 space-y-4">
      <h1 class="text-xl font-semibold">Login</h1>
      <div class="space-y-2">
        <label class="block text-sm">Email</label>
        <input v-model="email" class="w-full border rounded px-3 py-2" type="email" required />
      </div>
      <div class="space-y-2">
        <label class="block text-sm">Password</label>
        <input v-model="password" class="w-full border rounded px-3 py-2" type="password" required />
      </div>
      <button class="w-full rounded-xl py-2 border">Masuk</button>
    </form>
  </div>
</template>
<script setup lang="ts">
const email = ref('')
const password = ref('')
const { login } = useAuth()
async function submit(){ await login(email.value, password.value); return navigateTo('/tracker') }
</script>

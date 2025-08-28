<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
import { ref } from 'vue'
import { useUiStore } from '~/stores/ui'
const ui = useUiStore()
const pending = ref(true)
const rows = ref<Array<{ name: string; email: string; role: string; status: string }>>([])

if (process.client) {
  ui.show(150)
  setTimeout(() => {
    rows.value = [
      { name: 'Super Admin', email: 'superadmin@airnav.id', role: 'SUPER_ADMIN', status: 'Active' },
      { name: 'ATC Satu', email: 'atc1@airnav.id', role: 'ATC', status: 'Active' },
    ]
    pending.value = false
    ui.hide()
  }, 900)
}
</script>
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="relative w-full max-w-4xl">
      <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-gradient-from to-primary-gradient-to opacity-20 blur-xl"></div>
      <div class="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 ring-1 ring-white/10">
        <h2 class="text-2xl font-bold text-white mb-2">Manajemen User</h2>
        <p class="text-white mb-6">Hanya <b>SUPER_ADMIN</b> yang bisa melihat halaman ini.</p>

        <div class="overflow-hidden rounded-xl border border-white/10">
          <table class="min-w-full text-sm text-white/80">
            <thead class="bg-white/5">
              <tr>
                <th class="text-left px-4 py-2">Nama</th>
                <th class="text-left px-4 py-2">Email</th>
                <th class="text-left px-4 py-2">Role</th>
                <th class="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <TableRowSkeleton v-if="pending" />
              <TableRowSkeleton v-if="pending" />
              <TableRowSkeleton v-if="pending" />
              <tr v-for="r in rows" :key="r.email" class="odd:bg-white/0 even:bg-white/5">
                <td class="px-4 py-3 text-white">{{ r.name }}</td>
                <td class="px-4 py-3">{{ r.email }}</td>
                <td class="px-4 py-3">{{ r.role }}</td>
                <td class="px-4 py-3">{{ r.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

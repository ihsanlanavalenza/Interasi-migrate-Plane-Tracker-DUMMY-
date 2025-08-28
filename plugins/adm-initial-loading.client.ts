import { useUiStore } from '~/stores/ui'

export default defineNuxtPlugin(() => {
  if (!process.client) return
  const ui = useUiStore()
  // Show overlay briefly on first paint
  ui.show(0)
  setTimeout(() => ui.hide(), 450)
})

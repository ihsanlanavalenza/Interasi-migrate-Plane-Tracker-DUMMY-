import { useUiStore } from '~/stores/ui'

let timer: ReturnType<typeof setTimeout> | null = null

import type { Router } from 'vue-router'

export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return

  const ui = useUiStore()
  const router = nuxtApp.$router as Router

  const start = () => {
    if (timer) return
    timer = setTimeout(() => {
      ui.show(150)
      // simple top bar
      const bar = document.getElementById('__route_progress__') || document.createElement('div')
      bar.id = '__route_progress__'
      bar.style.position = 'fixed'
      bar.style.top = '0'
      bar.style.left = '0'
      bar.style.height = '2px'
      bar.style.width = '0%'
      bar.style.zIndex = '99999'
      bar.style.background = 'linear-gradient(90deg, #22d3ee, #67e8f9)'
      bar.style.boxShadow = '0 0 12px rgba(34,211,238,.55)'
      bar.style.transition = 'width 300ms ease'
      document.body.appendChild(bar)
      requestAnimationFrame(() => { bar.style.width = '60%' })
    }, 120) // delay to avoid flicker
  }

  const done = () => {
    const bar = document.getElementById('__route_progress__')
    if (bar) {
      bar.style.width = '100%'
      setTimeout(() => { bar.remove() }, 200)
    }
    ui.hide()
    if (timer) { clearTimeout(timer); timer = null }
  }

  router.beforeEach(() => { start(); return true })
  router.afterEach(() => done())
  router.onError(() => done())
})

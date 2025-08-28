import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUiStore } from '~/stores/ui'
import type { Router } from 'vue-router'

NProgress.configure({ showSpinner: false, trickleSpeed: 160, minimum: 0.08 })

export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) return
  const ui = useUiStore()
  const router = nuxtApp.$router as Router

  const start = () => {
    ui.show(150)
    NProgress.start()
    const bar = document.getElementById('nprogress')
    if (bar) {
      const barEl = bar.querySelector('.bar') as HTMLElement | null
      if (barEl) {
        barEl.style.background = 'linear-gradient(90deg,#22d3ee,#67e8f9)'
        barEl.style.boxShadow = '0 0 12px rgba(34,211,238,.55)'
        barEl.style.height = '2px'
      }
    }
  }
  const done = () => { NProgress.done(); ui.hide() }

  router.beforeEach(() => { start(); return true })
  router.afterEach(() => done())
  router.onError(() => done())
})

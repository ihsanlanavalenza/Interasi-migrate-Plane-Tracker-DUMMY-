import { useRuntimeConfig } from '#app'

/**
 * Configuration composable for Aircraft Tracker 3D
 * Manages application configuration using environment variables
 */
export const useTrackerConfig = () => {
  const config = useRuntimeConfig()
  
  // Default configuration for development/demo
  const defaultConfig = {
    websocket: {
      host: 'localhost',
      port: 8080
    },
    app: {
      name: 'Aircraft Tracker 3D',
      description: 'A 3D aircraft tracking system'
    }
  }
  
  // Get configuration from runtime config (environment variables)
  const getConfig = () => {
    // Use Nuxt public runtime config (available on both client and server)
    return {
      websocket: {
        host: config.public.wsHost || defaultConfig.websocket.host,
        port: parseInt(config.public.wsPort) || defaultConfig.websocket.port
      },
      app: {
        name: config.public.appName || defaultConfig.app.name,
        description: config.public.appDescription || defaultConfig.app.description
      }
    }
  }
  
  return {
    config: getConfig(),
    defaultConfig
  }
}

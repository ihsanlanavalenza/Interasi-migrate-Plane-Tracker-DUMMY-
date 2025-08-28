
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'AdmAppLoading': typeof import("../components/adm-AppLoading.vue")['default']
    'AdmBrandLogo': typeof import("../components/adm-BrandLogo.vue")['default']
    'AdmLoadingOverlay': typeof import("../components/adm-LoadingOverlay.vue")['default']
    'IconsAdmIconDashboard': typeof import("../components/icons/adm-IconDashboard.vue")['default']
    'IconsAdmIconUser': typeof import("../components/icons/adm-IconUser.vue")['default']
    'IconsAdmIconUsers': typeof import("../components/icons/adm-IconUsers.vue")['default']
    'SkeletonAdmCardSkeleton': typeof import("../components/skeleton/adm-CardSkeleton.vue")['default']
    'SkeletonAdmStatSkeleton': typeof import("../components/skeleton/adm-StatSkeleton.vue")['default']
    'SkeletonAdmTableRowSkeleton': typeof import("../components/skeleton/adm-TableRowSkeleton.vue")['default']
    'TrkAircraftDetails': typeof import("../components/trk-AircraftDetails.vue")['default']
    'TrkAircraftMap2D': typeof import("../components/trk-AircraftMap2D.vue")['default']
    'TrkAircraftMap3D': typeof import("../components/trk-AircraftMap3D.vue")['default']
    'TrkAircraftTable': typeof import("../components/trk-AircraftTable.vue")['default']
    'TrkAirspaceBadge': typeof import("../components/trk-AirspaceBadge.vue")['default']
    'TrkAirspaceData': typeof import("../components/trk-AirspaceData.vue")['default']
    'TrkAirspaceInfo': typeof import("../components/trk-AirspaceInfo.vue")['default']
    'TrkMapLayersControl': typeof import("../components/trk-MapLayersControl.vue")['default']
    'TrkMapToggle': typeof import("../components/trk-MapToggle.vue")['default']
    'TrkTopHeader': typeof import("../components/trk-TopHeader.vue")['default']
    'TrkWebSocketSettings': typeof import("../components/trk-WebSocketSettings.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'NuxtPage': typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
      'LazyAdmAppLoading': LazyComponent<typeof import("../components/adm-AppLoading.vue")['default']>
    'LazyAdmBrandLogo': LazyComponent<typeof import("../components/adm-BrandLogo.vue")['default']>
    'LazyAdmLoadingOverlay': LazyComponent<typeof import("../components/adm-LoadingOverlay.vue")['default']>
    'LazyIconsAdmIconDashboard': LazyComponent<typeof import("../components/icons/adm-IconDashboard.vue")['default']>
    'LazyIconsAdmIconUser': LazyComponent<typeof import("../components/icons/adm-IconUser.vue")['default']>
    'LazyIconsAdmIconUsers': LazyComponent<typeof import("../components/icons/adm-IconUsers.vue")['default']>
    'LazySkeletonAdmCardSkeleton': LazyComponent<typeof import("../components/skeleton/adm-CardSkeleton.vue")['default']>
    'LazySkeletonAdmStatSkeleton': LazyComponent<typeof import("../components/skeleton/adm-StatSkeleton.vue")['default']>
    'LazySkeletonAdmTableRowSkeleton': LazyComponent<typeof import("../components/skeleton/adm-TableRowSkeleton.vue")['default']>
    'LazyTrkAircraftDetails': LazyComponent<typeof import("../components/trk-AircraftDetails.vue")['default']>
    'LazyTrkAircraftMap2D': LazyComponent<typeof import("../components/trk-AircraftMap2D.vue")['default']>
    'LazyTrkAircraftMap3D': LazyComponent<typeof import("../components/trk-AircraftMap3D.vue")['default']>
    'LazyTrkAircraftTable': LazyComponent<typeof import("../components/trk-AircraftTable.vue")['default']>
    'LazyTrkAirspaceBadge': LazyComponent<typeof import("../components/trk-AirspaceBadge.vue")['default']>
    'LazyTrkAirspaceData': LazyComponent<typeof import("../components/trk-AirspaceData.vue")['default']>
    'LazyTrkAirspaceInfo': LazyComponent<typeof import("../components/trk-AirspaceInfo.vue")['default']>
    'LazyTrkMapLayersControl': LazyComponent<typeof import("../components/trk-MapLayersControl.vue")['default']>
    'LazyTrkMapToggle': LazyComponent<typeof import("../components/trk-MapToggle.vue")['default']>
    'LazyTrkTopHeader': LazyComponent<typeof import("../components/trk-TopHeader.vue")['default']>
    'LazyTrkWebSocketSettings': LazyComponent<typeof import("../components/trk-WebSocketSettings.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const AdmAppLoading: typeof import("../components/adm-AppLoading.vue")['default']
export const AdmBrandLogo: typeof import("../components/adm-BrandLogo.vue")['default']
export const AdmLoadingOverlay: typeof import("../components/adm-LoadingOverlay.vue")['default']
export const IconsAdmIconDashboard: typeof import("../components/icons/adm-IconDashboard.vue")['default']
export const IconsAdmIconUser: typeof import("../components/icons/adm-IconUser.vue")['default']
export const IconsAdmIconUsers: typeof import("../components/icons/adm-IconUsers.vue")['default']
export const SkeletonAdmCardSkeleton: typeof import("../components/skeleton/adm-CardSkeleton.vue")['default']
export const SkeletonAdmStatSkeleton: typeof import("../components/skeleton/adm-StatSkeleton.vue")['default']
export const SkeletonAdmTableRowSkeleton: typeof import("../components/skeleton/adm-TableRowSkeleton.vue")['default']
export const TrkAircraftDetails: typeof import("../components/trk-AircraftDetails.vue")['default']
export const TrkAircraftMap2D: typeof import("../components/trk-AircraftMap2D.vue")['default']
export const TrkAircraftMap3D: typeof import("../components/trk-AircraftMap3D.vue")['default']
export const TrkAircraftTable: typeof import("../components/trk-AircraftTable.vue")['default']
export const TrkAirspaceBadge: typeof import("../components/trk-AirspaceBadge.vue")['default']
export const TrkAirspaceData: typeof import("../components/trk-AirspaceData.vue")['default']
export const TrkAirspaceInfo: typeof import("../components/trk-AirspaceInfo.vue")['default']
export const TrkMapLayersControl: typeof import("../components/trk-MapLayersControl.vue")['default']
export const TrkMapToggle: typeof import("../components/trk-MapToggle.vue")['default']
export const TrkTopHeader: typeof import("../components/trk-TopHeader.vue")['default']
export const TrkWebSocketSettings: typeof import("../components/trk-WebSocketSettings.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const LazyAdmAppLoading: LazyComponent<typeof import("../components/adm-AppLoading.vue")['default']>
export const LazyAdmBrandLogo: LazyComponent<typeof import("../components/adm-BrandLogo.vue")['default']>
export const LazyAdmLoadingOverlay: LazyComponent<typeof import("../components/adm-LoadingOverlay.vue")['default']>
export const LazyIconsAdmIconDashboard: LazyComponent<typeof import("../components/icons/adm-IconDashboard.vue")['default']>
export const LazyIconsAdmIconUser: LazyComponent<typeof import("../components/icons/adm-IconUser.vue")['default']>
export const LazyIconsAdmIconUsers: LazyComponent<typeof import("../components/icons/adm-IconUsers.vue")['default']>
export const LazySkeletonAdmCardSkeleton: LazyComponent<typeof import("../components/skeleton/adm-CardSkeleton.vue")['default']>
export const LazySkeletonAdmStatSkeleton: LazyComponent<typeof import("../components/skeleton/adm-StatSkeleton.vue")['default']>
export const LazySkeletonAdmTableRowSkeleton: LazyComponent<typeof import("../components/skeleton/adm-TableRowSkeleton.vue")['default']>
export const LazyTrkAircraftDetails: LazyComponent<typeof import("../components/trk-AircraftDetails.vue")['default']>
export const LazyTrkAircraftMap2D: LazyComponent<typeof import("../components/trk-AircraftMap2D.vue")['default']>
export const LazyTrkAircraftMap3D: LazyComponent<typeof import("../components/trk-AircraftMap3D.vue")['default']>
export const LazyTrkAircraftTable: LazyComponent<typeof import("../components/trk-AircraftTable.vue")['default']>
export const LazyTrkAirspaceBadge: LazyComponent<typeof import("../components/trk-AirspaceBadge.vue")['default']>
export const LazyTrkAirspaceData: LazyComponent<typeof import("../components/trk-AirspaceData.vue")['default']>
export const LazyTrkAirspaceInfo: LazyComponent<typeof import("../components/trk-AirspaceInfo.vue")['default']>
export const LazyTrkMapLayersControl: LazyComponent<typeof import("../components/trk-MapLayersControl.vue")['default']>
export const LazyTrkMapToggle: LazyComponent<typeof import("../components/trk-MapToggle.vue")['default']>
export const LazyTrkTopHeader: LazyComponent<typeof import("../components/trk-TopHeader.vue")['default']>
export const LazyTrkWebSocketSettings: LazyComponent<typeof import("../components/trk-WebSocketSettings.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>

export const componentNames: string[]

import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "adm-auth" | "adm-default"
declare module 'nuxt/app' {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}
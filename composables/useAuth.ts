// composables/useAuth.ts
export function useAuth() {
  const token = useCookie<string | null>('accessToken')
  const role = useState<string>('role', ()=>'VIEWER')
  const isLoggedIn = computed(()=> !!token.value)
  async function login(email:string, password:string){
    const cfg = useRuntimeConfig()
    const res = await $fetch<{accessToken:string, role:string}>(`${cfg.public.apiBase}/auth/login`, {
      method:'POST', body:{email,password}
    })
    token.value = res.accessToken
    role.value = res.role
    return true
  }
  function logout(){
    token.value = null
    role.value = 'VIEWER'
    return true
  }
  return { isLoggedIn, role, login, logout }
}

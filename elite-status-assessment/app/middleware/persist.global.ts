export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    // Intercept fetch responses for our submit endpoint by monkey-patching once
    const w = window as any
    if (!w.__esa_fetch_patched__) {
      w.__esa_fetch_patched__ = true
      const original = window.fetch
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const res = await original(input, init)
        try {
          const url = typeof input === 'string' ? input : (input as URL).toString()
          if (url.includes('/api/quiz/submit') && init?.method?.toUpperCase() === 'POST') {
            const cloned = res.clone()
            cloned.json().then((data) => {
              const bodyStr = (init?.body as any) || '{}'
              let payload: any = {}
              try { payload = typeof bodyStr === 'string' ? JSON.parse(bodyStr) : bodyStr } catch {}

              const record = {
                email: payload.email,
                answers: payload.answers,
                score: payload.score,
                type: data?.type,
                celebrity: data?.celebrity,
                timestamp: payload.timestamp
              }
              const raw = localStorage.getItem('esa_submissions')
              const arr = raw ? JSON.parse(raw) : []
              arr.push(record)
              localStorage.setItem('esa_submissions', JSON.stringify(arr))
            }).catch(() => {})
          }
        } catch {}
        return res
      }
    }
  }
})
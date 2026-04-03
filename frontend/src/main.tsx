import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return

  try {
    const { worker } = await import('./mocks/browser')

    // Race against a 5s timeout — app always renders even if SW is slow
    await Promise.race([
      worker.start({ onUnhandledRequest: 'bypass' }),
      new Promise<void>((resolve) => setTimeout(resolve, 5000)),
    ])
  } catch (err) {
    console.warn('[MSW] Failed to start service worker:', err)
    console.warn('[MSW] App will render without mock API. Run: npx msw init public/ --save')
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  )
})

import { Outlet, createRootRoute } from '@tanstack/react-router'
export const Route = createRootRoute({
  component: () => <div style={{padding:'20px', fontFamily:'sans-serif'}}><h1>Ghana AI Friend 🇬🇭</h1><Outlet /></div>
})

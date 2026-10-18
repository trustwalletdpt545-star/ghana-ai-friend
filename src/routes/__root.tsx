import { createRootRoute, Outlet } from '@tanstack/react-router'
export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <script src="https://cdn.tailwindcss.com"></script>
    </>
  ),
})

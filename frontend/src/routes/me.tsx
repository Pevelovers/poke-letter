import { createFileRoute } from '@tanstack/react-router'

import { MyTreePage } from '@/pages/me/MyTreePage'

export const Route = createFileRoute('/me')({
  component: MyTreePage,
})

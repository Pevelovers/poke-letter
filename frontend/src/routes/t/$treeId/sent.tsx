import { createFileRoute } from '@tanstack/react-router'

import { SentPage } from '@/pages/write/SentPage'

interface SentSearch {
  pokemon?: string
  ball?: number
}

export const Route = createFileRoute('/t/$treeId/sent')({
  validateSearch: (search: Record<string, unknown>): SentSearch => ({
    pokemon: typeof search.pokemon === 'string' ? search.pokemon : undefined,
    ball: typeof search.ball === 'number' ? search.ball : undefined,
  }),
  component: SentRoute,
})

function SentRoute() {
  const { treeId } = Route.useParams()
  const { pokemon, ball } = Route.useSearch()
  return <SentPage treeId={treeId} pokemon={pokemon} ballId={ball} />
}

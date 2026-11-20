import { createFileRoute } from '@tanstack/react-router'

import { SentPage } from '@/pages/write/SentPage'

interface SentSearch {
  pokemon?: string
  shiny?: boolean
  ball?: number
}

export const Route = createFileRoute('/t/$treeId/sent')({
  validateSearch: (search: Record<string, unknown>): SentSearch => ({
    pokemon: typeof search.pokemon === 'string' ? search.pokemon : undefined,
    shiny: search.shiny === true ? true : undefined,
    ball: typeof search.ball === 'number' ? search.ball : undefined,
  }),
  component: SentRoute,
})

function SentRoute() {
  const { treeId } = Route.useParams()
  const { pokemon, shiny, ball } = Route.useSearch()
  return <SentPage treeId={treeId} pokemon={pokemon} shiny={shiny} ballId={ball} />
}

import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useMemo, useState } from 'react'

import { charactersQuery } from '@/api/queries'
import type { Character, PokemonType } from '@/api/types'
import { PixelImage } from '@/components/common/PixelImage'
import { ToggleChip } from '@/components/common/ToggleChip'
import { VirtualGrid } from '@/components/common/VirtualGrid'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageLayout } from '@/components/layout/PageLayout'
import { Input } from '@/components/ui/input'
import { spriteSize } from '@/config/assets'
import { strings } from '@/config/strings'
import { filterCharacters, indexCharacters } from '@/lib/character-filter'
import { cn } from '@/lib/utils'

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const TYPES = Object.keys(strings.pokemonTypes) as PokemonType[]

interface PokemonPickerPageProps {
  selectedId: number | null
  onSelect: (character: Character) => void
  onBack: () => void
}

/**
 * 포켓몬 선택기 (F-CHR-01). 목록을 한 번 받아 FE에서 검색·필터한다.
 * 입력은 디바운싱하지 않고 useDeferredValue로 화면이 멈추지 않게 한다.
 */
export function PokemonPickerPage({ selectedId, onSelect, onBack }: PokemonPickerPageProps) {
  const { data, isError } = useQuery(charactersQuery)
  const [query, setQuery] = useState('')
  const [generations, setGenerations] = useState<number[]>([])
  const [types, setTypes] = useState<PokemonType[]>([])
  const deferredQuery = useDeferredValue(query)

  // 초성 문자열은 목록을 받을 때 한 번만 계산한다
  const indexed = useMemo(() => indexCharacters(data?.characters ?? []), [data])
  const results = useMemo(
    () => filterCharacters(indexed, { query: deferredQuery, generations, types }),
    [indexed, deferredQuery, generations, types],
  )
  // 대체 팩이면 세대·타입이 없으므로 필터를 숨긴다
  const showFilters = data?.pack === 'pokemon'

  return (
    <PageLayout
      headerLeft={<BackHeader title={strings.picker.pokemonTitle} onBack={onBack} />}
      className="gap-3"
    >
      <label className="sr-only" htmlFor="pokemon-search">
        {strings.picker.searchLabel}
      </label>
      <Input
        id="pokemon-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={strings.picker.searchPlaceholder}
        autoComplete="off"
        className="h-11 rounded-xl bg-card text-base"
      />

      {showFilters && (
        <div className="flex flex-col gap-2">
          <ChipRow label={strings.picker.generation}>
            {GENERATIONS.map((generation) => (
              <ToggleChip
                key={generation}
                label={strings.picker.generationChip(generation)}
                pressed={generations.includes(generation)}
                onPressedChange={() => setGenerations((prev) => toggle(prev, generation))}
              />
            ))}
          </ChipRow>
          <ChipRow label={strings.picker.type}>
            {TYPES.map((type) => (
              <ToggleChip
                key={type}
                label={strings.pokemonTypes[type]}
                pressed={types.includes(type)}
                onPressedChange={() => setTypes((prev) => toggle(prev, type))}
              />
            ))}
          </ChipRow>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span aria-live="polite">{data && strings.picker.resultCount(results.length)}</span>
        {(generations.length > 0 || types.length > 0) && (
          <button
            type="button"
            className="underline"
            onClick={() => {
              setGenerations([])
              setTypes([])
            }}
          >
            {strings.picker.resetFilters}
          </button>
        )}
      </div>

      {isError && <p className="py-10 text-center">{strings.picker.loadError}</p>}
      {data && results.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">{strings.picker.empty}</p>
      )}
      <VirtualGrid
        items={results}
        columns={3}
        rowHeight={124}
        getKey={(character) => character.characterId}
        className="h-[55svh]"
        renderItem={(character) => (
          <PokemonCell
            character={character}
            selected={character.characterId === selectedId}
            onSelect={() => onSelect(character)}
          />
        )}
      />
    </PageLayout>
  )
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="-mx-4 flex gap-1.5 overflow-x-auto px-4">
      {children}
    </div>
  )
}

function PokemonCell({
  character,
  selected,
  onSelect,
}: {
  character: Character
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      // 리전폼은 이름이 같으므로 이미지로 구분한다 (POL-CHR-06). 스크린리더용으로만 도감 번호를 붙인다
      aria-label={`${character.name} No.${character.dexNo}${character.form === 'base' ? '' : ` ${character.form}`}`}
      className={cn(
        'flex h-full w-full flex-col items-center justify-center rounded-xl border-2',
        selected ? 'border-primary bg-primary/5' : 'border-transparent',
      )}
    >
      {/* 고정 크기라 스크롤 중에 칸이 흔들리지 않는다 */}
      <PixelImage
        src={character.imageUrl}
        alt=""
        width={spriteSize.pokemon.width}
        height={spriteSize.pokemon.height}
        scale={1}
      />
      <span className="truncate text-sm">{character.name}</span>
    </button>
  )
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

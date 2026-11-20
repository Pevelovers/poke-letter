import type { Character, PokemonType } from '@/api/types'

import { matchesName, normalizeQuery, toSearchableName, type SearchableName } from './hangul'

export interface CharacterFilter {
  query: string
  generations: number[]
  types: PokemonType[]
}

/**
 * 세대별 스타팅 포켓몬의 도감 번호 (1~9세대, 각 3마리).
 * 검색어와 필터가 없을 때 선택기 첫 화면에 보여 준다. 이름은 서버 목록에서 가져온다 (POL-IP-04).
 */
export const STARTER_DEX_NOS: ReadonlySet<number> = new Set([
  1, 4, 7, 152, 155, 158, 252, 255, 258, 387, 390, 393, 495, 498, 501, 650, 653, 656, 722, 725, 728,
  810, 813, 816, 906, 909, 912,
])

export function isEmptyFilter(filter: CharacterFilter): boolean {
  return filter.query.trim() === '' && filter.generations.length === 0 && filter.types.length === 0
}

/** 첫 화면용 스타팅 포켓몬. 리전폼은 빼고 기본 폼만 보여 준다 */
export function starterCharacters(indexed: IndexedCharacter[]): Character[] {
  return indexed
    .map(({ character }) => character)
    .filter((character) => character.form === 'base' && STARTER_DEX_NOS.has(character.dexNo))
}

export interface IndexedCharacter {
  character: Character
  searchable: SearchableName
}

/** 초성 문자열은 목록을 받을 때 한 번만 계산한다 */
export function indexCharacters(characters: Character[]): IndexedCharacter[] {
  return characters.map((character) => ({
    character,
    searchable: toSearchableName(character.name),
  }))
}

/**
 * 선택기 필터 (POL-CHR-08, 09).
 * 같은 필터 안은 OR, 세대·타입·이름 검색끼리는 AND. 복합 타입은 하나만 맞아도 포함한다.
 * 숫자만 입력하면 도감 번호로 찾는다.
 */
export function filterCharacters(
  indexed: IndexedCharacter[],
  filter: CharacterFilter,
): Character[] {
  const trimmed = filter.query.replace(/\s+/g, '')
  const dexNo = /^\d+$/.test(trimmed) ? Number(trimmed) : null
  const query = normalizeQuery(trimmed)

  return indexed
    .filter(({ character, searchable }) => {
      if (dexNo !== null) {
        if (character.dexNo !== dexNo) return false
      } else if (!matchesName(searchable, query)) {
        return false
      }
      if (
        filter.generations.length > 0 &&
        !filter.generations.includes(character.generation ?? -1)
      ) {
        return false
      }
      if (
        filter.types.length > 0 &&
        !character.types?.some((type) => filter.types.includes(type))
      ) {
        return false
      }
      return true
    })
    .map(({ character }) => character)
}

import { mockCharacters } from '@/api/mock/characters'

import { filterCharacters, indexCharacters, type CharacterFilter } from './character-filter'

const indexed = indexCharacters(mockCharacters)
const names = (filter: Partial<CharacterFilter>) =>
  filterCharacters(indexed, { query: '', generations: [], types: [], ...filter }).map(
    (character) => `${character.name}/${character.form}`,
  )

describe('filterCharacters (POL-CHR-08)', () => {
  it('같은 필터 안은 OR, 필터끼리는 AND로 묶는다', () => {
    expect(names({ generations: [1], types: ['fire', 'flying'] })).toEqual([
      '파이리/base',
      '리자몽/base',
      '피존/base',
      '식스테일/base',
      '프리져/base',
    ])
  })

  it('세대는 폼이 처음 나온 세대로 거른다', () => {
    expect(names({ query: 'ㄹㅇㅊ', generations: [7] })).toEqual(['라이츄/alola'])
    expect(names({ query: 'ㄹㅇㅊ' })).toEqual(['라이츄/base', '라이츄/alola'])
  })

  it('숫자만 입력하면 도감 번호로 찾는다', () => {
    expect(names({ query: '128' })).toHaveLength(4)
    expect(names({ query: '25' })).toEqual(['피카츄/base'])
  })

  it('검색과 필터를 함께 쓴다', () => {
    expect(names({ query: '켄타', types: ['water'] })).toEqual(['켄타로스/paldea-aqua'])
  })
})

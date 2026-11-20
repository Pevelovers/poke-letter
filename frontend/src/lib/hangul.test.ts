import { matchesName, normalizeQuery, toSearchableName } from './hangul'

const match = (name: string, query: string) =>
  matchesName(toSearchableName(name), normalizeQuery(query))

describe('이름 검색 (POL-CHR-09)', () => {
  it('어느 위치든 부분 일치한다', () => {
    expect(match('이브이', '이브')).toBe(true)
    expect(match('피카츄', '카츄')).toBe(true)
    expect(match('피카츄', '라이')).toBe(false)
  })

  it('초성으로 찾고, 초성과 완성 글자를 섞어 쓸 수 있다', () => {
    expect(match('피카츄', 'ㅍㅋㅊ')).toBe(true)
    expect(match('피카츄', '피ㅋ츄')).toBe(true)
    expect(match('라이츄', 'ㄹㅇㅊ')).toBe(true)
    expect(match('피카츄', 'ㅍㅊ')).toBe(false)
  })

  it('공백을 무시한다', () => {
    expect(match('피카츄', '피 카')).toBe(true)
  })

  it('쌍자음은 따로 구분한다', () => {
    expect(match('꼬부기', 'ㄱ')).toBe(true) // '기'의 초성
    expect(match('꼬부기', 'ㄱㅂ')).toBe(false)
    expect(match('꼬부기', 'ㄲㅂ')).toBe(true)
  })

  it('빈 검색어는 모두 일치한다', () => {
    expect(match('피카츄', '')).toBe(true)
  })
})

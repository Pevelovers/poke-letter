import { countChars, hasFinalConsonant } from './text'

describe('countChars', () => {
  it('한글과 이모지를 한 글자로 센다', () => {
    expect(countChars('지우의 트리')).toBe(6)
    expect(countChars('🎄🎁')).toBe(2)
  })
})

describe('hasFinalConsonant', () => {
  it('마지막 글자의 받침을 확인한다', () => {
    expect(hasFinalConsonant('이브이')).toBe(false)
    expect(hasFinalConsonant('켄타로스')).toBe(false)
    expect(hasFinalConsonant('잠만보')).toBe(false)
    expect(hasFinalConsonant('뮤츠')).toBe(false)
    expect(hasFinalConsonant('프리져')).toBe(false)
    expect(hasFinalConsonant('나옹')).toBe(true)
  })
})

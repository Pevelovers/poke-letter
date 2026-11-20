import { countChars } from './text'

describe('countChars', () => {
  it('한글과 이모지를 한 글자로 센다', () => {
    expect(countChars('지우의 트리')).toBe(6)
    expect(countChars('🎄🎁')).toBe(2)
  })
})

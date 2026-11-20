import { pickRandom, randomInt, rollShiny } from './random'

describe('randomInt', () => {
  afterEach(() => vi.restoreAllMocks())

  it('범위 밖의 값은 버리고 다시 뽑는다 (모듈러 편향 방지)', () => {
    // n = 3이면 2^32 - (2^32 % 3) = 4294967295 이상은 버린다
    const values = [4294967295, 7]
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      ;(array as Uint32Array)[0] = values.shift()!
      return array
    })

    expect(randomInt(3)).toBe(1)
    expect(values).toHaveLength(0)
  })

  it('0 이상 n 미만만 나온다', () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomInt(7)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(7)
    }
  })

  it('잘못된 n은 거절한다', () => {
    expect(() => randomInt(0)).toThrow(RangeError)
    expect(() => randomInt(1.5)).toThrow(RangeError)
  })
})

describe('rollShiny', () => {
  afterEach(() => vi.restoreAllMocks())

  it('50개 중 0이 나올 때만 이로치다', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues')
    spy.mockImplementationOnce((array) => {
      ;(array as Uint32Array)[0] = 50 // 50 % 50 = 0
      return array
    })
    expect(rollShiny()).toBe(true)
    spy.mockImplementationOnce((array) => {
      ;(array as Uint32Array)[0] = 51
      return array
    })
    expect(rollShiny()).toBe(false)
  })

  it('많이 뽑으면 약 2%가 나온다', () => {
    let hits = 0
    for (let i = 0; i < 20000; i++) if (rollShiny()) hits++
    // 기대값 400, 표준편차 약 20. 넉넉히 ±100
    expect(hits).toBeGreaterThan(300)
    expect(hits).toBeLessThan(500)
  })
})

describe('pickRandom', () => {
  it('빈 목록이면 undefined', () => {
    expect(pickRandom([])).toBeUndefined()
    expect(pickRandom(['a'])).toBe('a')
  })
})

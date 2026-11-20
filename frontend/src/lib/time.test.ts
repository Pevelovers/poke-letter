import { daysUntil, isDaytimeInSeoul } from './time'

const REVEAL_AT = '2026-12-25T00:00:00+09:00'

describe('daysUntil', () => {
  it('한국 시간 자정을 기준으로 남은 날을 센다', () => {
    expect(daysUntil(REVEAL_AT, new Date('2026-12-02T00:00:00+09:00'))).toBe(23)
    expect(daysUntil(REVEAL_AT, new Date('2026-12-24T23:59:00+09:00'))).toBe(1)
  })

  it('해외 기기 시각이어도 한국 날짜로 계산한다', () => {
    // 뉴욕 12/24 10:00 = 한국 12/25 00:00
    expect(daysUntil(REVEAL_AT, new Date('2026-12-24T10:00:00-05:00'))).toBe(0)
  })

  it('공개일이 지나면 0이다', () => {
    expect(daysUntil(REVEAL_AT, new Date('2026-12-30T12:00:00+09:00'))).toBe(0)
  })
})

describe('isDaytimeInSeoul', () => {
  it('서울 일출과 일몰 사이면 낮이다', () => {
    expect(isDaytimeInSeoul(new Date('2026-12-10T12:00:00+09:00'))).toBe(true)
    expect(isDaytimeInSeoul(new Date('2026-12-10T06:00:00+09:00'))).toBe(false)
    expect(isDaytimeInSeoul(new Date('2026-12-10T19:00:00+09:00'))).toBe(false)
  })

  it('12/25 0시 개봉은 밤이다', () => {
    expect(isDaytimeInSeoul(new Date('2026-12-25T00:00:00+09:00'))).toBe(false)
  })

  it('표 밖의 날짜도 판단한다', () => {
    expect(isDaytimeInSeoul(new Date('2026-11-20T12:00:00+09:00'))).toBe(true)
  })
})

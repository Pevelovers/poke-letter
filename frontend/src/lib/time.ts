import { SEOUL_SUN_TIMES } from './sun-times'

const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** 기기 시각과 상관없이 한국 시간의 달력 값을 돌려준다 */
function toKstParts(date: Date) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS)
  return {
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
    minutes: kst.getUTCHours() * 60 + kst.getUTCMinutes(),
    dayNumber: Math.floor(kst.getTime() / DAY_MS),
  }
}

/** 공개일까지 남은 날 수 (KST 자정 기준). 공개일 당일과 그 뒤는 0 */
export function daysUntil(revealAt: string, now: Date): number {
  const diff = toKstParts(new Date(revealAt)).dayNumber - toKstParts(now).dayNumber
  return Math.max(0, diff)
}

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 서울 일출·일몰 시각으로 낮인지 판단한다 (F-TRE-10).
 * 표에 없는 날짜(서비스 기간 밖)는 표의 가장 가까운 끝 값을 쓴다.
 */
export function isDaytimeInSeoul(now: Date): boolean {
  const { month, day, minutes } = toKstParts(now)
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const row =
    SEOUL_SUN_TIMES.find(([date]) => date === key) ??
    (month >= 2 && month <= 11 ? SEOUL_SUN_TIMES.at(-1)! : SEOUL_SUN_TIMES[0])
  return minutes >= toMinutes(row[1]) && minutes < toMinutes(row[2])
}

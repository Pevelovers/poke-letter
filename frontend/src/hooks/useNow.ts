import { useEffect, useState } from 'react'

/**
 * 현재 시각. 렌더링 중에 Date를 직접 부르지 않도록 상태로 두고 주기적으로 갱신한다.
 * 낮·밤 전환과 D-day 표시는 분 단위면 충분하다.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])
  return now
}

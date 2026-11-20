/**
 * 암호학적 난수로 0 이상 n 미만의 정수를 균등하게 뽑는다.
 *
 * `값 % n`을 그대로 쓰면 2^32가 n으로 나누어떨어지지 않을 때 작은 수가 조금 더 자주 나온다
 * (모듈러 편향). n의 배수가 되는 범위(limit) 밖의 값은 버리고 다시 뽑는다(거절 샘플링).
 */
export function randomInt(n: number): number {
  if (!Number.isInteger(n) || n <= 0 || n > 2 ** 32) {
    throw new RangeError(`randomInt: n은 1 이상 2^32 이하의 정수여야 합니다 (${n})`)
  }
  const range = 2 ** 32
  const limit = range - (range % n)
  const buffer = new Uint32Array(1)
  for (;;) {
    crypto.getRandomValues(buffer)
    if (buffer[0] < limit) return buffer[0] % n
  }
}

/** 이로치 당첨 확률 1/50 = 2% (POL-CHR-12) */
export const SHINY_ODDS = 50

export function rollShiny(): boolean {
  return randomInt(SHINY_ODDS) === 0
}

export function pickRandom<T>(items: readonly T[]): T | undefined {
  return items.length === 0 ? undefined : items[randomInt(items.length)]
}

/**
 * 글자 수를 센다. 서버(Java codePointCount)와 같이 코드 포인트 기준이라 이모지도 한 글자다.
 * 합성 이모지(가족, 국기 등)는 여러 글자로 세지만 서버와 결과가 같다.
 */
export function countChars(value: string): number {
  return Array.from(value).length
}

/** 마지막 글자에 받침이 있는지 (조사 와/과 고르기). 한글이 아니면 받침 없음으로 본다 */
export function hasFinalConsonant(word: string): boolean {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return false
  return (code - 0xac00) % 28 !== 0
}

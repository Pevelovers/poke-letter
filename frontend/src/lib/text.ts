/**
 * 글자 수를 센다. 서버(Java codePointCount)와 같이 코드 포인트 기준이라 이모지도 한 글자다.
 * 합성 이모지(가족, 국기 등)는 여러 글자로 세지만 서버와 결과가 같다.
 */
export function countChars(value: string): number {
  return Array.from(value).length
}

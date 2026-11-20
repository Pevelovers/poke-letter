/**
 * 포켓몬 이름 검색 (POL-CHR-09). 라이브러리 없이 구현한다.
 * - 어느 위치든 부분 일치, 공백 무시
 * - 입력의 초성(ㄱ~ㅎ)은 이름 글자의 초성과, 완성 글자는 그대로 비교한다 (섞어 쓸 수 있음)
 * - 쌍자음은 따로 구분한다 (ㄱ으로 꼬부기가 나오지 않음)
 */

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] // prettier-ignore

const SYLLABLE_START = 0xac00
const SYLLABLE_END = 0xd7a3
const SYLLABLES_PER_CHOSUNG = 21 * 28

function isChosung(char: string): boolean {
  return CHOSUNG.includes(char)
}

/** 완성 글자의 초성. 한글 완성 글자가 아니면 그 글자 그대로 */
function chosungOf(char: string): string {
  const code = char.charCodeAt(0)
  if (code < SYLLABLE_START || code > SYLLABLE_END) return char
  return CHOSUNG[Math.floor((code - SYLLABLE_START) / SYLLABLES_PER_CHOSUNG)]
}

/** 검색 대상 이름을 미리 계산해 둔다. 목록을 받을 때 한 번만 만든다 */
export interface SearchableName {
  chars: string[]
  chosungs: string[]
}

export function toSearchableName(name: string): SearchableName {
  const chars = Array.from(name.replace(/\s+/g, ''))
  return { chars, chosungs: chars.map(chosungOf) }
}

export function normalizeQuery(query: string): string[] {
  return Array.from(query.replace(/\s+/g, ''))
}

export function matchesName(target: SearchableName, query: string[]): boolean {
  if (query.length === 0) return true
  const last = target.chars.length - query.length
  for (let start = 0; start <= last; start++) {
    let matched = true
    for (let i = 0; i < query.length; i++) {
      const q = query[i]
      const actual = isChosung(q) ? target.chosungs[start + i] : target.chars[start + i]
      if (actual !== q) {
        matched = false
        break
      }
    }
    if (matched) return true
  }
  return false
}

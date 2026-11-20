import type { BallView } from '../types'

/**
 * 목 API용 데이터. 이미지는 외부 스프라이트 URL을 그대로 쓴다 (POL-IP-03).
 *
 * 장식 볼 38종 (design.md §3 분류 순서: 일반 8, 특수 12, 구 볼 7, 히스이 11).
 * ballId와 스프라이트는 PokéAPI 아이템 값이다 (2026-11-20 확인). 실제 서비스에서는 시드가 넣는다.
 */
const ITEM_SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'

const ballRows: Array<[name: string, itemKey: string, ballId: number]> = [
  ['몬스터볼', 'poke-ball', 4],
  ['슈퍼볼', 'great-ball', 3],
  ['하이퍼볼', 'ultra-ball', 2],
  ['마스터볼', 'master-ball', 1],
  ['사파리볼', 'safari-ball', 5],
  ['파크볼', 'park-ball', 456],
  ['컴퍼티션볼', 'sport-ball', 457],
  ['울트라볼', 'beast-ball', 887],
  ['네트볼', 'net-ball', 6],
  ['다이브볼', 'dive-ball', 7],
  ['네스트볼', 'nest-ball', 8],
  ['리피트볼', 'repeat-ball', 9],
  ['타이머볼', 'timer-ball', 10],
  ['럭셔리볼', 'luxury-ball', 11],
  ['프리미어볼', 'premier-ball', 12],
  ['다크볼', 'dusk-ball', 13],
  ['힐볼', 'heal-ball', 14],
  ['퀵볼', 'quick-ball', 15],
  ['프레셔스볼', 'cherish-ball', 16],
  ['드림볼', 'dream-ball', 617],
  ['루어볼', 'lure-ball', 449],
  ['레벨볼', 'level-ball', 450],
  ['문볼', 'moon-ball', 451],
  ['헤비볼', 'heavy-ball', 452],
  ['스피드볼', 'fast-ball', 453],
  ['프렌드볼', 'friend-ball', 454],
  ['러브러브볼', 'love-ball', 455],
  ['스트레인지볼', 'strange-ball', 1663],
  ['몬스터볼(히스이)', 'lapoke-ball', 2220],
  ['슈퍼볼(히스이)', 'lagreat-ball', 2221],
  ['하이퍼볼(히스이)', 'laultra-ball', 2222],
  ['헤비볼(히스이)', 'laheavy-ball', 2223],
  ['메가톤볼', 'laleaden-ball', 2224],
  ['기가톤볼', 'lagigaton-ball', 2225],
  ['페더볼', 'lafeather-ball', 2226],
  ['윙볼', 'lawing-ball', 2227],
  ['제트볼', 'lajet-ball', 2228],
  ['오리진볼', 'laorigin-ball', 2229],
]

export const mockBalls: BallView[] = ballRows.map(([name, itemKey, ballId]) => ({
  ballId,
  name,
  imageUrl: `${ITEM_SPRITE}/${itemKey}.png`,
}))

export const mockNicknames = [
  '이슬',
  '웅이',
  '피카츄친구',
  '눈사람',
  '산타',
  '루돌프',
  '초코',
  '별빛',
  '하늘',
  '겨울잠',
  '호빵',
  '귤',
  '썰매',
]

/** 목 모드에서 공유 링크로 바로 볼 수 있는 예시 트리 */
export const DEMO_TREE_ID = 'demoTree01'

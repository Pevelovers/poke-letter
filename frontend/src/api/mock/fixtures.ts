import type { BallView } from '../types'

/**
 * 목 API용 샘플 데이터. 개발 화면 확인용으로 몇 개만 둔다.
 * 전체 목록은 저장소에 두지 않는다 (POL-IP-04). 이미지는 외부 스프라이트 URL을 그대로 쓴다 (POL-IP-03).
 */
const ITEM_SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'

export const mockBalls: BallView[] = [
  { ballId: 4, name: '몬스터볼', imageUrl: `${ITEM_SPRITE}/poke-ball.png` },
  { ballId: 3, name: '슈퍼볼', imageUrl: `${ITEM_SPRITE}/great-ball.png` },
  { ballId: 2, name: '하이퍼볼', imageUrl: `${ITEM_SPRITE}/ultra-ball.png` },
  { ballId: 1, name: '마스터볼', imageUrl: `${ITEM_SPRITE}/master-ball.png` },
  { ballId: 12, name: '프리미어볼', imageUrl: `${ITEM_SPRITE}/premier-ball.png` },
  { ballId: 11, name: '럭셔리볼', imageUrl: `${ITEM_SPRITE}/luxury-ball.png` },
  { ballId: 6, name: '네트볼', imageUrl: `${ITEM_SPRITE}/net-ball.png` },
  { ballId: 15, name: '퀵볼', imageUrl: `${ITEM_SPRITE}/quick-ball.png` },
  { ballId: 16, name: '다크볼', imageUrl: `${ITEM_SPRITE}/dusk-ball.png` },
  { ballId: 14, name: '힐볼', imageUrl: `${ITEM_SPRITE}/heal-ball.png` },
  { ballId: 576, name: '드림볼', imageUrl: `${ITEM_SPRITE}/dream-ball.png` },
  { ballId: 499, name: '러브러브볼', imageUrl: `${ITEM_SPRITE}/love-ball.png` },
]

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

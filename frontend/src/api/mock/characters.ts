import type { Character, PokemonType } from '../types'

/**
 * 목 API용 포켓몬 샘플. 세대별 스타팅 포켓몬 27마리와 검색·필터·리전폼 확인용 일부만 둔다.
 * 전체 목록은 저장소에 두지 않는다 (POL-IP-04). 이미지는 외부 스프라이트 URL을 쓴다 (POL-IP-03).
 */
const SPRITE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

type Row = [
  dexNo: number,
  form: string,
  formNo: number,
  name: string,
  generation: number,
  types: PokemonType[],
  spriteId: number,
]

const rows: Row[] = [
  [1, 'base', 0, '이상해씨', 1, ['grass', 'poison'], 1],
  [4, 'base', 0, '파이리', 1, ['fire'], 4],
  [6, 'base', 0, '리자몽', 1, ['fire', 'flying'], 6],
  [7, 'base', 0, '꼬부기', 1, ['water'], 7],
  [16, 'base', 0, '피존', 1, ['normal', 'flying'], 16],
  [25, 'base', 0, '피카츄', 1, ['electric'], 25],
  [26, 'base', 0, '라이츄', 1, ['electric'], 26],
  [26, 'alola', 1, '라이츄', 7, ['electric', 'psychic'], 10100],
  [37, 'base', 0, '식스테일', 1, ['fire'], 37],
  [37, 'alola', 1, '식스테일', 7, ['ice'], 10103],
  [52, 'base', 0, '나옹', 1, ['normal'], 52],
  [54, 'base', 0, '고라파덕', 1, ['water'], 54],
  [94, 'base', 0, '팬텀', 1, ['ghost', 'poison'], 94],
  [124, 'base', 0, '루주라', 1, ['ice', 'psychic'], 124],
  [128, 'base', 0, '켄타로스', 1, ['normal'], 128],
  [128, 'paldea-combat', 5, '켄타로스', 9, ['fighting'], 10250],
  [128, 'paldea-blaze', 6, '켄타로스', 9, ['fighting', 'fire'], 10251],
  [128, 'paldea-aqua', 7, '켄타로스', 9, ['fighting', 'water'], 10252],
  [131, 'base', 0, '라프라스', 1, ['water', 'ice'], 131],
  [133, 'base', 0, '이브이', 1, ['normal'], 133],
  [143, 'base', 0, '잠만보', 1, ['normal'], 143],
  [144, 'base', 0, '프리져', 1, ['ice', 'flying'], 144],
  [150, 'base', 0, '뮤츠', 1, ['psychic'], 150],
  [152, 'base', 0, '치코리타', 2, ['grass'], 152],
  [175, 'base', 0, '토게피', 2, ['fairy'], 175],
  [215, 'base', 0, '포푸니', 2, ['dark', 'ice'], 215],
  [225, 'base', 0, '딜리버드', 2, ['ice', 'flying'], 225],
  [361, 'base', 0, '눈꼬마', 3, ['ice'], 361],
  [471, 'base', 0, '글레이시아', 4, ['ice'], 471],
  [778, 'base', 0, '따라큐', 7, ['ghost', 'fairy'], 778],
  [875, 'base', 0, '빙큐보', 8, ['ice'], 875],
  [906, 'base', 0, '나오하', 9, ['grass'], 906],
  [155, 'base', 0, '브케인', 2, ['fire'], 155],
  [158, 'base', 0, '리아코', 2, ['water'], 158],
  [252, 'base', 0, '나무지기', 3, ['grass'], 252],
  [255, 'base', 0, '아차모', 3, ['fire'], 255],
  [258, 'base', 0, '물짱이', 3, ['water'], 258],
  [387, 'base', 0, '모부기', 4, ['grass'], 387],
  [390, 'base', 0, '불꽃숭이', 4, ['fire'], 390],
  [393, 'base', 0, '팽도리', 4, ['water'], 393],
  [495, 'base', 0, '주리비얀', 5, ['grass'], 495],
  [498, 'base', 0, '뚜꾸리', 5, ['fire'], 498],
  [501, 'base', 0, '수댕이', 5, ['water'], 501],
  [650, 'base', 0, '도치마론', 6, ['grass'], 650],
  [653, 'base', 0, '푸호꾸', 6, ['fire'], 653],
  [656, 'base', 0, '개구마르', 6, ['water'], 656],
  [722, 'base', 0, '나몰빼미', 7, ['grass', 'flying'], 722],
  [725, 'base', 0, '냐오불', 7, ['fire'], 725],
  [728, 'base', 0, '누리공', 7, ['water'], 728],
  [810, 'base', 0, '흥나숭', 8, ['grass'], 810],
  [813, 'base', 0, '염버니', 8, ['fire'], 813],
  [816, 'base', 0, '울머기', 8, ['water'], 816],
  [909, 'base', 0, '뜨아거', 9, ['fire'], 909],
  [912, 'base', 0, '꾸왁스', 9, ['water'], 912],
]

export const mockCharacters: Character[] = rows
  .map(([dexNo, form, formNo, name, generation, types, spriteId]) => ({
    characterId: dexNo * 100 + formNo,
    dexNo,
    form,
    name,
    generation,
    types,
    imageUrl: `${SPRITE}/${spriteId}.png`,
    shinyImageUrl: `${SPRITE}/shiny/${spriteId}.png`,
  }))
  .sort((a, b) => a.characterId - b.characterId)

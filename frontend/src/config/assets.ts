/**
 * 화면에 쓰는 이미지 경로를 한곳에 모은다. 디자인을 바꿀 때 이 파일만 고친다.
 *
 * `public/art-temp/`의 이미지는 AI로 만든 임시본이라 저장소에 커밋하지 않는다(.gitignore).
 * 파일이 없어도 화면이 깨지지 않도록, 이 이미지를 쓰는 컴포넌트는 CSS 대체 표현을 함께 둔다.
 */
export const assets = {
  backgroundDay: '/art-temp/bg-day.png',
  backgroundNight: '/art-temp/bg-night.png',
  /** 포켓몬·볼 이미지를 불러오지 못했을 때 보여 주는 기본 오너먼트 (F-CHR-04) */
  defaultOrnament: '/art-temp/ornament-default.png',
} as const

/** 출처 표기가 필요한 에셋. 하단 고지에 보여 준다 (#50) */
export const credits = {
  dpptFont: {
    name: 'Pokemon DPPt',
    author: 'aztecwarrior28',
    url: 'https://fontstruct.com/fontstructions/show/1951915',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
} as const

/**
 * 트리: 가문비나무(Large Spruce, Green_Teal, 눈 많음, CC0, public/art/tree/large-spruce/CREDITS.md).
 * 가로로 이어 붙인 27프레임 스프라이트시트를 넘기며 눈 애니메이션을 재생한다 (#41)
 */
export const treeSprite = {
  src: '/art/tree/large-spruce/high/spritesheet.png',
  frameWidth: 74,
  frameHeight: 129,
  frames: 27,
  /** 초당 프레임. 에디터에서 맞춘 값 */
  fps: 10,
  /** 화면 배율. 세로 3배, 가로는 폭을 넓히려고 3배의 120% (에디터에서 정함) */
  scale: 3,
  widthRatio: 1.2,
} as const

/** 도트 이미지 원본 크기(px). 화면에서는 정수 배율로만 키운다 */
export const spriteSize = {
  ball: { width: 30, height: 30 },
  pokemon: { width: 96, height: 96 },
} as const

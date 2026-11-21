/**
 * 화면에 쓰는 이미지 경로를 한곳에 모은다. 디자인을 바꿀 때 이 파일만 고친다.
 *
 * `public/art-temp/`의 이미지는 AI로 만든 임시본이라 저장소에 커밋하지 않는다(.gitignore).
 * 파일이 없어도 화면이 깨지지 않도록, 이 이미지를 쓰는 컴포넌트는 CSS 대체 표현을 함께 둔다.
 */
export const assets = {
  tree: '/art-temp/tree.png',
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

/** 도트 이미지 원본 크기(px). 화면에서는 정수 배율로만 키운다 */
export const spriteSize = {
  tree: { width: 150, height: 180 },
  ball: { width: 30, height: 30 },
  pokemon: { width: 96, height: 96 },
} as const

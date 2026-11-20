/**
 * API 요청·응답 타입 (docs/api/api-spec.md 기준).
 * 백엔드 springdoc이 준비되면 `pnpm api:generate`로 만든 타입으로 바꾼다.
 */

export type LoginProvider = 'google' | 'kakao' | 'naver'

export interface AppConfigResponse {
  revealAt: string
  serverTime: string
  loginProviders: LoginProvider[]
  characterPack: 'pokemon' | 'ornament'
  notice: string | null
}

export interface MeResponse {
  provider: LoginProvider
  tree: { treeId: string; name: string; messageCount: number } | null
}

export interface CreateTreeRequest {
  name: string
}

export interface CreateTreeResponse {
  treeId: string
  name: string
  shareUrl: string
}

export interface BallView {
  ballId: number
  name: string
  imageUrl: string
}

export interface Decoration {
  messageId: number
  nickname: string
  ball: BallView
  createdAt: string
}

export interface PageInfo {
  number: number
  size: number
  totalPages: number
}

export interface TreeResponse {
  treeId: string
  name: string
  isOwner: boolean
  revealed: boolean
  messageCount: number
  full: boolean
  decorations: Decoration[]
  page: PageInfo
}

export interface ErrorResponse {
  code: string
  message: string
  fields?: Record<string, string>
}

export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

export interface Character {
  characterId: number
  dexNo: number
  form: string
  /** 리전폼도 원래 이름 그대로다 (POL-CHR-06) */
  name: string
  /** 대체 팩이면 null */
  generation: number | null
  types: PokemonType[] | null
  imageUrl: string
  /** 이로치 스프라이트. 없는 폼은 imageUrl과 같다 (POL-CHR-12) */
  shinyImageUrl: string
}

export interface CharactersResponse {
  pack: 'pokemon' | 'ornament'
  characters: Character[]
}

export interface BallsResponse {
  pack: 'pokemon' | 'ornament'
  balls: BallView[]
}

/** 앱 설정 값. 바꿀 때 이 파일 한곳만 고친다. */
export const appConfig = {
  /** 비공식 고지의 연락처 (POL-IP-01) */
  contactEmail: 'pokeletter.contact@gmail.com',
  /**
   * 목(mock) API 사용 여부. 백엔드가 준비되기 전까지 기본으로 켠다.
   * 실제 서버에 붙일 때는 `frontend/.env.local`에 `VITE_API_MOCK=false`를 넣는다.
   */
  useMockApi: import.meta.env.VITE_API_MOCK !== 'false',
} as const

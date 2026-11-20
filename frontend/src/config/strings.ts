/**
 * 화면 문구를 한곳에 모은다 (국제화 F-I18N 대비).
 * 컴포넌트에는 문구를 직접 쓰지 않고 여기서 가져온다.
 */
export const strings = {
  appName: 'PokéLetter',
  common: {
    loading: '불러오는 중이에요',
    retry: '다시 시도',
    back: '뒤로',
    networkError: '연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.',
    revealDate: '12월 25일에 열려요',
    dDay: (days: number) => (days > 0 ? `D-${days}` : 'D-DAY'),
    revealed: '메시지가 열렸어요!',
  },
  notice: {
    title: '비공식 팬 프로젝트',
    lines: [
      'PokéLetter는 비공식 팬 프로젝트이며 공식 서비스와 관련이 없어요.',
      '포켓몬 관련 명칭과 이미지의 권리는 각 권리자에게 있어요.',
      '비상업적으로 운영해요.',
    ],
    contact: (email: string) => `문의: ${email}`,
  },
  landing: {
    headline: '친구에게 포켓몬과 함께\n크리스마스 메시지를 받아 보세요',
    description: '트리를 만들고 링크를 공유하면, 친구들이 포켓몬과 메시지를 담은 볼을 달아 줘요.',
    reveal: '받은 메시지는 12월 25일 0시에 한꺼번에 열려요.',
    start: '내 트리 만들기',
    myTree: '내 트리 보기',
  },
  login: {
    title: '로그인',
    description: '트리를 만들려면 로그인해 주세요.\n메시지를 보내는 친구는 로그인하지 않아도 돼요.',
    providers: {
      google: '구글로 시작하기',
      kakao: '카카오로 시작하기',
      naver: '네이버로 시작하기',
    },
  },
  me: {
    loggedInWith: {
      google: '구글로 로그인했어요',
      kakao: '카카오로 로그인했어요',
      naver: '네이버로 로그인했어요',
    },
    logout: '로그아웃',
    createTitle: '트리 이름을 정해 주세요',
    createPlaceholder: '예: 지우의 트리',
    createSubmit: '트리 만들기',
    creating: '만드는 중',
    nameRequired: '트리 이름을 입력해 주세요.',
    inappropriateName: '사용할 수 없는 표현이 있어요. 다른 이름을 입력해 주세요.',
    share: '공유하기',
    shareTitle: (name: string) => `${name}에 메시지를 남겨 주세요`,
    copied: '링크를 복사했어요',
    messageCount: (count: number) => `장식 ${count}개`,
    emptyTree: '아직 장식이 없어요. 링크를 공유해 보세요!',
    lockedMessage: '12월 25일에 열려요',
  },
  tree: {
    prevPage: '이전 장식',
    nextPage: '다음 장식',
    page: (current: number, total: number) => `${current} / ${total}`,
  },
} as const

export type Strings = typeof strings

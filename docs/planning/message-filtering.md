# 악성 메시지 필터링 — 라이브러리 리서치

> Source: Deep Interview, 2026-11-16 (웹 검색 + GitHub/npm 메타데이터 조회, 2026-11-16 기준)

## 후보

| 이름 | 언어 | 라이선스 | 최근 활동 | 규모 | 비고 |
|---|---|---|---|---|---|
| [badwords-ko](https://github.com/yoonheyjung/badwords-ko) | JavaScript (npm) | MIT | 저장소 push 2026-05, npm 최신 1.0.4 (2023-09) | ★21 | 영어 `bad-words` 패키지 구조를 참고한 단어 목록 방식 |
| [korcen.ts](https://github.com/Tanat05/korcen.ts) | TypeScript (npm `korcen`) | Apache-2.0 | push 2026-05, npm 1.0.1 (2025-05) | ★8 | Python [Korcen](https://github.com/Tanat05/Korcen)(★30, MIT)의 TS 포팅. 키워드 기반 |
| [korean-profanity-filter](https://github.com/lisuugi/korean-profanity-filter) | Java | Apache-2.0 | push 2025-08 | ★3 | Aho-Corasick 기반. 사용자가 적어 검증 사례가 부족함 |
| [LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words) `ko` 목록 | 단어 목록 | CC-BY-4.0 (출처 표기 필요) | push 2024-08 | 72줄 | 라이브러리가 아니라 사전만 제공 |
| KISO 욕설 필터링 서비스(KSS) | 외부 서비스 | — | — | — | 오픈소스가 아님. 도입 조건 미확인 |

※ 별 개수와 날짜는 GitHub API와 npm 조회 결과다. 각 라이브러리의 탐지 품질은 직접 테스트하지 않았다.

## 판단 기준

1. **필터는 반드시 서버(BE)에서 실행해야 한다.** FE에서만 검사하면 API를 직접 호출해 우회할 수 있다. FE 검사는 "입력 중 미리 알려 주기" 용도로만 쓴다.
2. 한국어 욕설은 우회 표기가 많다(예: 자음만 쓰기, 숫자·특수문자 끼워 넣기, 띄어쓰기). 단어 목록만으로는 한계가 있으므로 **정규화**(공백·특수문자 제거, 숫자→문자 치환 등)가 필요하다.
3. 오탐(정상 단어가 걸림)이 롤링페이퍼 경험을 해칠 수 있다. 차단보다 "경고 후 수정 요청"이 덜 불쾌하다.

## 제안 (확정 아님)

- **BE(Java):** 검증된 Java 라이브러리가 마땅치 않으므로, MIT·CC-BY 사전(badwords-ko, LDNOOBW `ko`)을 합쳐 BE에 단어 목록 파일로 두고 **정규화 + Aho-Corasick(또는 단순 포함 검사)**로 직접 구현하는 방안. 단어 목록이 수백 개 수준이라 구현은 작다.
  - LDNOOBW를 쓰면 CC-BY-4.0에 따라 출처를 표기해야 한다.
- **FE:** 같은 단어 목록을 공유하거나 `badwords-ko`로 입력 중 경고만 표시.
- **보완책:** 트리 주인의 메시지 삭제(MVP 확정)와 Rate Limit을 함께 둔다. 필터만으로 모든 악성 메시지를 막을 수는 없다.

## Open Questions

- 필터에 걸리면 어떻게 할지: 전송 차단 / 해당 단어 마스킹(`***`) / 그대로 저장하되 트리 주인에게 숨김
- 닉네임에도 같은 필터를 적용할지 (12/25 전에 공개되는 정보이므로 적용을 권장)

# API 명세

> 버전 1.1 · 2026-11-20 · 상태: **확정** (구현 중 바뀌는 내용은 새 버전으로 기록)
> 2026-11-20 개정 (#38, BE 구현 전이라 하위 호환 없이 바꿈): 숨김 랜덤을 없애고 선택기의 랜덤 선택 버튼으로 바꿈, 선택 확인 창, 이로치 2%, 공개 전 이로치 볼 반짝임, 공개 후 트리에 포켓몬 표시
> 근거: [기능 정의서](../product/features.md), [정책 정의서](../product/policies.md), [ERD](../product/erd.md)
> 구현 후에는 springdoc이 만드는 OpenAPI(`/v3/api-docs`)가 단일 출처가 되고, FE 타입은 `pnpm api:generate`로 생성한다. 이 문서는 구현 전 합의용 계약이다.

## 공통

- **Base URL:** `https://pokeletter.duckdns.org/api/v1` (FE와 같은 도메인, 로컬은 Vite 프록시)
- **형식:** JSON, UTF-8, 필드는 camelCase
- **시각:** ISO-8601, 오프셋 포함 (`2026-12-25T00:00:00+09:00`)
- **인증:** OAuth 로그인 후 세션 쿠키 (`HttpOnly`, `Secure`, `SameSite=Lax`)
- **CSRF:** 로그인이 필요한 `POST`·`DELETE`는 `X-XSRF-TOKEN` 헤더를 보내야 한다. 값은 `XSRF-TOKEN` 쿠키에서 읽는다 (POL-ABU-04). 익명 메시지 작성은 세션이 없으므로 대상이 아니다
- **ID:** 트리는 `treeId` = `trees.public_id`(10자 문자열), 메시지는 숫자 `messageId`, 캐릭터는 숫자 `characterId`

### 에러 응답

```json
{ "code": "TREE_NOT_FOUND", "message": "트리를 찾을 수 없어요." }
```

| HTTP | code | 상황 |
|---|---|---|
| 400 | `INVALID_INPUT` | 길이, 필수값 등 검증 실패. `fields`에 필드별 사유를 넣는다 |
| 422 | `INAPPROPRIATE_CONTENT` | 메시지 닉네임·내용에 욕설·음담패설이 있고 `allowMasking=false`. 저장하지 않는다. `fields`에 칸 이름만 넣고 감지된 단어는 넣지 않는다 (POL-FLT-07) |
| 400 | `INAPPROPRIATE_NAME` | 트리 이름에 욕설·음담패설이 있음. 감지된 단어는 응답에 넣지 않는다 (POL-FLT-06) |
| 401 | `UNAUTHORIZED` | 로그인 필요 |
| 403 | `FORBIDDEN` | 내 트리가 아님, CSRF 실패 |
| 403 | `NOT_REVEALED` | 공개 시각 전에 내용을 요청함 |
| 404 | `TREE_NOT_FOUND` / `MESSAGE_NOT_FOUND` / `CHARACTER_NOT_FOUND` / `BALL_NOT_FOUND` | |
| 409 | `TREE_ALREADY_EXISTS` | 이미 트리가 있음 (POL-TRE-01) |
| 409 | `TREE_FULL` | 트리당 최대 메시지 수 초과 (POL-ABU-03) |
| 429 | `TOO_MANY_REQUESTS` | Rate Limit 초과. `Retry-After` 헤더 포함 (POL-ABU-01) |
| 500 | `INTERNAL_ERROR` | |

```json
{
  "code": "INVALID_INPUT",
  "message": "입력값을 확인해 주세요.",
  "fields": { "content": "1~500자로 입력해 주세요." }
}
```

---

## 1. 설정

### `GET /config` — 앱 설정 (누구나)

FE가 시작할 때 한 번 부른다.

```json
{
  "revealAt": "2026-12-25T00:00:00+09:00",
  "serverTime": "2026-12-01T10:00:00+09:00",
  "loginProviders": ["google", "kakao"],
  "characterPack": "pokemon",
  "notice": null
}
```

| 필드 | 설명 |
|---|---|
| serverTime | 남은 시간 표시에 쓴다. 공개 여부 판단은 서버가 한다 (POL-RVL-04) |
| loginProviders | 켜진 제공자만 (POL-ACC-02) |
| characterPack | `pokemon` 또는 `ornament`. `ornament`면 FE는 포켓몬 선택기 대신 오너먼트 선택기를 보여 준다 (POL-IP-02) |
| notice | 공지 배너 문구 또는 `null` (F-OPS-03) |

## 2. 인증

Spring Security가 제공하는 경로를 그대로 쓴다. JSON API가 아니라 브라우저 이동 경로다.

| 경로 | 설명 |
|---|---|
| `GET /oauth2/authorization/{provider}` | 로그인 시작. `provider` = `google` \| `kakao` \| `naver` |
| `GET /login/oauth2/code/{provider}` | 제공자 콜백 (OAuth 앱 등록 시 Redirect URI) → 성공하면 `/me`로 이동 |

OAuth 앱에 등록할 Redirect URI (운영 + 로컬):

| 제공자 | 운영 | 로컬 |
|---|---|---|
| 구글 | `https://pokeletter.duckdns.org/login/oauth2/code/google` | `http://localhost:8080/login/oauth2/code/google` |
| 카카오 | `https://pokeletter.duckdns.org/login/oauth2/code/kakao` | `http://localhost:8080/login/oauth2/code/kakao` |
| 네이버 | `https://pokeletter.duckdns.org/login/oauth2/code/naver` | `http://localhost:8080/login/oauth2/code/naver` |

- 로컬 포트는 Spring 기본값(8080) 기준이다. FE를 Vite 프록시로 띄울 때 콜백을 어느 포트로 받을지는 구현할 때 맞춘다
- 운영 서버는 리버스 프록시 뒤에 있으므로 Spring이 `X-Forwarded-*` 헤더로 `https://pokeletter.duckdns.org` 주소를 만들게 한다 (`server.forward-headers-strategy`)

OAuth 앱 등록 결과 (2026-11-18)

| 제공자 | 등록 계정 | 요청 정보 | 구현 시 주의 |
|---|---|---|---|
| 구글 | 서비스 전용 계정 `pokeletter.contact@gmail.com` | 범위 `openid`만 (민감하지 않은 범위라 게시할 때 인증 불필요) | Spring은 범위를 지정하지 않으면 `openid`, `profile`, `email`을 모두 요청하므로 `scope: openid`를 반드시 명시한다. 현재 "테스트" 상태라 테스트 사용자만 로그인할 수 있다. 출시 전에 "앱 게시"로 바꾼다. 로고는 올리지 않는다(브랜드 인증 필요) |
| 카카오 | 운영자 개인 카카오 계정 | 동의항목 모두 "사용 안 함". 회원번호만 받는다 | `client-id`는 **REST API 키**. 리다이렉트 URI와 Client Secret도 REST API 키에 등록되어 있다. OpenID Connect는 끔. 로그아웃 리다이렉트 URI, 호출 허용 IP는 설정하지 않음 |
| 네이버 | 운영자 개인 네이버 계정 | 제공 정보 선택 안 함 (회원 고유 식별자만) | "개발 중" 상태라 관리자·테스터만 로그인할 수 있다. 검수는 배포 후 신청한다 |

- 클라이언트 ID·시크릿은 저장소에 두지 않고 환경 변수로만 넣는다 (POL-OPS-04)
- 카카오 "연결 해제 웹훅"(사용자가 카카오 설정에서 연결을 끊을 때 알림)은 설정하지 않았다. P2 후보 (F-ACC-07)

> 위 두 경로는 `/api/v1` 아래가 아니다. 리버스 프록시에서 함께 백엔드로 넘겨야 한다.

### `GET /me` — 내 정보 (로그인)

```json
{
  "provider": "kakao",
  "tree": { "treeId": "aB3dE5fG7h", "name": "지우의 트리", "messageCount": 12 }
}
```
- 트리가 없으면 `"tree": null`
- 로그인하지 않았으면 `401`

### `POST /auth/logout` — 로그아웃 (로그인, CSRF)

`204 No Content`

### `DELETE /me` — 탈퇴 (로그인, CSRF)

계정, 트리, 받은 메시지를 즉시 삭제하고 세션을 끝낸다 (POL-PRV-03). `204 No Content`

## 3. 트리

### `POST /trees` — 트리 만들기 (로그인, CSRF)

요청
```json
{ "name": "지우의 트리" }
```
응답 `201 Created`
```json
{ "treeId": "aB3dE5fG7h", "name": "지우의 트리", "shareUrl": "https://pokeletter.duckdns.org/t/aB3dE5fG7h" }
```
- `name`: 1~20자. 욕설·음담패설이 있으면 마스킹하지 않고 `400 INAPPROPRIATE_NAME`으로 거절한다 (POL-TRE-02, POL-FLT-06)
- 이미 트리가 있으면 `409 TREE_ALREADY_EXISTS`

### `GET /trees/{treeId}` — 트리 보기 (누구나)

쿼리: `page` (0부터, 기본 0), 페이지당 10개 (A-04)

```json
{
  "treeId": "aB3dE5fG7h",
  "name": "지우의 트리",
  "isOwner": false,
  "revealed": false,
  "messageCount": 23,
  "full": false,
  "decorations": [
    { "messageId": 101, "nickname": "피카츄친구", "ball": { "ballId": 4, "name": "몬스터볼", "imageUrl": "https://..." }, "shiny": true, "character": null, "createdAt": "2026-12-02T21:14:00+09:00" }
  ],
  "page": { "number": 0, "size": 10, "totalPages": 3 }
}
```
- **메시지 내용은 공개 여부와 상관없이 이 응답에 없다** (POL-RVL-03)
- `character`: 공개 전에는 `null` (POL-RVL-01). 공개 후에는 `{ "characterId", "name", "imageUrl" }`이고 **누구나 받는다.** FE는 공개 후 트리에 볼 대신 포켓몬을 단다 (POL-RVL-03). 이로치면 `imageUrl`이 이로치 이미지다
- `shiny`: 이로치 당첨 여부. 공개 전에도 내려준다. FE는 공개 전 이로치 볼에 반짝임을 표시한다 (POL-CHR-12)
- `isOwner`: 로그인한 주인이면 `true` → FE가 삭제·개봉 버튼을 보여 준다
- `full`: 메시지가 최대치(200개)면 `true` → FE가 "메시지 남기기" 버튼을 숨긴다 (F-TRE-09)
- `ball`: 장식으로 달린 볼. 작성자가 고른 것이라 공개 전에도 보여 준다 (POL-CHR-10). 대체 팩이면 일반 크리스마스 볼로 바꿔 돌려준다 (POL-IP-02)

### `GET /t/{treeId}` — 공유 링크 HTML (누구나, `/api` 밖)

JSON API가 아니다. 리버스 프록시가 `/t/*` 요청을 백엔드로 넘기고, 백엔드는 FE의 `index.html`에 트리별 Open Graph 메타 태그를 채워 돌려준다 (F-TRE-08). 그 뒤 화면은 SPA가 그린다.

```html
<meta property="og:title" content="지우의 트리에 메시지를 남겨 주세요">
<meta property="og:description" content="PokéLetter · 12월 25일에 열려요">
<meta property="og:image" content="https://pokeletter.duckdns.org/og/default.png">
```
- 트리 이름은 HTML 이스케이프해서 넣는다 (XSS 방지)
- 없는 트리면 공통 메타 태그로 돌려주고 화면에서 "트리를 찾을 수 없어요"를 보여 준다
- `og:image`는 [가정 아님, 제안] 공통 이미지 1장으로 시작한다. 트리별 이미지 생성은 하지 않는다

## 4. 메시지

### `POST /trees/{treeId}/messages` — 메시지 보내기 (누구나)

요청
```json
{ "nickname": "피카츄친구", "content": "메리 크리스마스!", "characterId": 13300, "shiny": false, "ballId": 4, "allowMasking": false }
```
응답 `201 Created`
```json
{
  "messageId": 101,
  "nickname": "피카츄친구",
  "ball": { "ballId": 4, "name": "몬스터볼", "imageUrl": "https://..." },
  "shiny": false,
  "character": { "characterId": 13300, "name": "이브이", "imageUrl": "https://..." }
}
```
- `character`는 항상 있다. 이로치면 `imageUrl`이 이로치 이미지다
- 검증: `nickname` 1~10자, `content` 1~500자, `characterId` 필수(활성 캐릭터, 없으면 `404 CHARACTER_NOT_FOUND`) (POL-MSG-01, 02)
- `shiny` (기본 `false`): FE가 확인 창에서 뽑은 이로치 당첨 결과 (POL-CHR-12). 서버는 검증하지 않고 저장한다
- 숨김 랜덤(`random`)과 `selectionType`은 없앴다. 랜덤 선택은 FE 선택기에서 한다 (POL-CHR-03, 04)
- `ballId` 필수: 활성 볼이어야 한다. 없으면 `404 BALL_NOT_FOUND`. FE는 작성 폼을 열 때 몬스터볼을 미리 선택해 둔다 (POL-CHR-10)
- `allowMasking` (기본 `true`): 필터에 걸렸을 때 마스킹해서 저장해도 되는지 (POL-FLT-07)
  - `false`: 걸리면 저장하지 않고 `422 INAPPROPRIATE_CONTENT` (`fields: ["content"]` 등). 걸리지 않으면 그대로 저장
  - `true`: 걸려도 마스킹해서 저장한다
  - FE 흐름: 첫 전송은 `false` → `422`면 보낸 닉네임·내용을 메모리에 기억 → 같은 내용이면 요청 없이 막음 → 바뀌었으면 `true`로 전송
  - 기본값이 `true`라 F-MSG-04(P1)를 구현하기 전의 FE는 이 필드 없이 보내면 지금처럼 바로 마스킹 저장된다
- 저장 전에 닉네임과 내용을 마스킹한다. 응답에는 마스킹된 닉네임을 돌려준다 (POL-FLT-01~03)
- `422` 거부도 Rate Limit 횟수에 포함한다 (POL-FLT-07)
- Rate Limit 초과 `429`, 트리 메시지 수 초과 `409 TREE_FULL`
- FE는 `429`를 받으면 `Retry-After`로 남은 시간을 보여 주고, 임시 저장을 지우지 않는다 (POL-MSG-05)

### `GET /trees/{treeId}/messages` — 메시지 열어 보기 (트리 주인)

쿼리: `page`, `size`(기본 20)

공개 전 → `403 NOT_REVEALED`
공개 후 →
```json
{
  "messages": [
    {
      "messageId": 101,
      "nickname": "피카츄친구",
      "content": "메리 크리스마스!",
      "shiny": true,
      "character": { "characterId": 13300, "name": "이브이", "imageUrl": "https://.../shiny/133.png" },
      "ball": { "ballId": 4, "name": "몬스터볼", "imageUrl": "https://..." },
      "createdAt": "2026-12-02T21:14:00+09:00"
    }
  ],
  "page": { "number": 0, "size": 20, "totalPages": 2 }
}
```
- 주인이 아니면 `403 FORBIDDEN`

### `GET /trees/{treeId}/messages/{messageId}` — 메시지 하나 열기 (트리 주인)

개봉 연출에서 한 개씩 열 때 쓴다. 응답은 위 목록의 항목 하나와 같다. 공개 전 `403 NOT_REVEALED`.

### `DELETE /trees/{treeId}/messages/{messageId}` — 메시지 삭제 (트리 주인, CSRF)

`204 No Content` · 영구 삭제 (POL-MSG-06) · 공개 전에도 가능

### `GET /trees/{treeId}/messages/export` — 내보내기 (트리 주인) · P2

공개 후에만 가능. `text/plain; charset=utf-8`, `Content-Disposition: attachment` (A-12)

## 5. 캐릭터

### `GET /characters` — 선택 가능한 캐릭터 목록 (누구나)

선택기에서 한 번 받아 FE에서 검색한다. 약 1,100개.

```json
{
  "pack": "pokemon",
  "characters": [
    { "characterId": 2500, "dexNo": 25, "form": "base", "name": "피카츄", "generation": 1, "types": ["electric"], "imageUrl": "https://..." },
    { "characterId": 2600, "dexNo": 26, "form": "base", "name": "라이츄", "generation": 1, "types": ["electric"], "imageUrl": "https://..." },
    { "characterId": 2601, "dexNo": 26, "form": "alola", "name": "라이츄", "generation": 7, "types": ["electric", "psychic"], "imageUrl": "https://...", "shinyImageUrl": "https://..." }
  ]
}
```
- `Cache-Control: public, max-age=86400` + `ETag`. 목록이 거의 바뀌지 않는다
- 활성 팩이 `ornament`면 오너먼트 N종을 같은 형식으로 돌려준다 (POL-IP-02)
- `characterId` = 도감 번호 × 100 + 폼 번호 (ERD)
- `shinyImageUrl`: 이로치 스프라이트. 없는 폼은 `imageUrl`과 같은 값을 준다 (POL-CHR-12). 위 예시는 줄였고 모든 항목에 있다
- `name`: **리전폼도 원래 이름 그대로**다. 같은 이름이 둘 이상 나올 수 있고, 이미지와 `form`으로 구분한다 (POL-CHR-06)
- `generation`: 폼이 처음 나온 세대 1~9 (POL-CHR-07)
- `types`: 1~2개, PokéAPI 영문 타입 이름. 한국어 표기 18종은 FE가 고정 매핑으로 가진다. 세대·타입 필터는 FE에서 처리한다 (POL-CHR-08)
- 활성 팩이 `ornament`면 `generation`, `types`는 `null`이고 FE는 필터를 숨긴다

### `GET /balls` — 장식용 볼 목록 (누구나)

볼 선택기와 트리 화면에서 쓴다. 38종.

```json
{
  "pack": "pokemon",
  "balls": [
    { "ballId": 4, "name": "몬스터볼", "imageUrl": "https://..." },
    { "ballId": 1785, "name": "몬스터볼(히스이)", "imageUrl": "https://..." }
  ]
}
```
- `ballId` = PokéAPI 아이템 id. 예시의 히스이 볼 id는 설명용이다
- `name`: 일반 볼과 이름이 겹치는 히스이 볼 4종만 `(히스이)`를 붙인다 (POL-CHR-10)
- `Cache-Control: public, max-age=86400` + `ETag`
- 활성 팩이 `ornament`면 일반 크리스마스 볼 M종을 같은 형식으로 돌려준다 (POL-IP-02)

### `GET /trees/{treeId}/collection` — 받은 포켓몬 모아보기 (트리 주인) · P1

공개 전 `403 NOT_REVEALED`

```json
{
  "items": [
    {
      "character": { "characterId": 2500, "name": "피카츄", "imageUrl": "https://..." },
      "shiny": false,
      "times": 3,
      "senders": ["피카츄친구", "로켓단", "웅이"],
      "firstReceivedAt": "2026-12-02T21:14:00+09:00"
    }
  ],
  "distinctCount": 9
}
```
- 전체 수, 수집률, 빈칸은 내려주지 않는다 (POL-CHR-05)
- 같은 포켓몬이라도 이로치는 따로 묶는다 (POL-CHR-12)

---

## 권한 요약

| 엔드포인트 | 누구나 | 로그인 | 트리 주인 | 공개 후만 |
|---|---|---|---|---|
| `GET /config` | ✓ | | | |
| `GET /me` | | ✓ | | |
| `POST /auth/logout`, `DELETE /me` | | ✓ | | |
| `POST /trees` | | ✓ | | |
| `GET /trees/{id}` | ✓ | | | |
| `POST /trees/{id}/messages` | ✓ | | | |
| `GET /trees/{id}/messages`, `.../{messageId}` | | | ✓ | ✓ |
| `DELETE /trees/{id}/messages/{messageId}` | | | ✓ | |
| `GET /trees/{id}/messages/export` | | | ✓ | ✓ |
| `GET /characters` | ✓ | | | |
| `GET /balls` | ✓ | | | |
| `GET /trees/{id}/collection` | | | ✓ | ✓ |
| `GET /actuator/health` (경로는 `/api` 밖) | ✓ | | | |

## 보안 구현 메모

- `SecurityConfig`: `/api/v1/config`, `GET /api/v1/trees/*`, `POST /api/v1/trees/*/messages`, `GET /api/v1/characters`, `GET /api/v1/balls`, `GET /t/*`, OAuth 경로, 헬스 체크만 `permitAll`. 나머지는 인증 필요
- 트리 주인 확인은 컨트롤러가 아니라 서비스 계층에서 `tree.owner_id == 로그인 사용자`로 한다
- 공개 여부 확인(`now >= revealAt`)도 서비스 계층에서 하고, 테스트에서 시각을 바꿀 수 있도록 `Clock`을 주입한다
- 현재 `SecurityConfig`는 CSRF를 끈 상태다(개발 환경 세팅 시점). 세션 쿠키 인증을 도입할 때 CSRF를 켜고, 익명 메시지 작성 경로만 예외로 둔다

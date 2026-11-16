# AGENTS.md — 협업 컨벤션 지침

이 문서는 **사람과 AI 에이전트 모두**가 따르는 이 저장소의 협업 규칙입니다.
AI 에이전트는 커밋·브랜치·PR·이슈를 만들기 전에 반드시 이 문서를 확인하고 그대로 따릅니다.
규칙이 모호하면 추측하지 말고 작업자(사람)에게 확인합니다.

---

## 0. 프로젝트 구조 전제

프론트엔드와 백엔드가 한 저장소에 있는 모노레포입니다.

```
poke-letter/
├── frontend/        # React + TypeScript
├── backend/         # Java + Spring Boot
├── docs/            # 설계 문서, API 명세 등
├── .github/         # 이슈/PR 템플릿, 워크플로
└── AGENTS.md
```

| 영역 | 경로 | scope 값 |
|---|---|---|
| 프론트엔드 | `frontend/**` | `fe` |
| 백엔드 | `backend/**` | `be` |
| API 계약(요청/응답 형태, 엔드포인트) | API 명세, DTO, FE API 클라이언트 | `api` |
| DB 스키마/마이그레이션 | `backend/**/db/**` 등 | `db` |
| CI/CD, 배포, 인프라 | `.github/workflows/**`, Docker 등 | `infra` |
| 문서 | `docs/**`, `*.md` | `docs` |
| 저장소 전체 설정 | 루트 설정 파일 | `repo` |

### 기술 스택과 코드 규칙

스택과 실행 방법은 [README.md](README.md)에 있습니다. 코드를 쓸 때 다음을 지킵니다.

- **FE**
  - 패키지 매니저는 `pnpm`만 사용합니다 (`npm`, `yarn` 금지).
  - 라우트는 `src/routes/`에 파일로 추가합니다. `src/routeTree.gen.ts`는 자동 생성 파일이므로 직접 수정하지 않습니다.
  - 서버 데이터는 TanStack Query로 다루고, Zustand에는 클라이언트 전용 상태만 둡니다.
  - API 타입과 훅은 `pnpm api:generate`로 생성합니다. `src/api/generated/`는 직접 수정하지 않습니다.
  - UI 컴포넌트는 `pnpm dlx shadcn@latest add <name>`으로 추가합니다.
  - React Compiler를 사용하므로 `useMemo`/`useCallback`은 필요한 경우에만 씁니다.
  - import 경로는 `@/` 별칭을 사용합니다.
- **BE**
  - DB 스키마는 Flyway 마이그레이션(`src/main/resources/db/migration/V<번호>__<설명>.sql`)으로만 변경합니다. `ddl-auto`는 `validate`로 유지합니다.
  - 이미 `main`에 병합된 마이그레이션 파일은 수정하지 않고, 새 버전 파일을 추가합니다.
  - 비밀 정보는 `application.yml`에 직접 쓰지 않고 환경 변수(`${DB_PASSWORD}` 등)로 주입합니다.
  - API 컨트롤러에는 springdoc 어노테이션으로 명세를 남깁니다. 이 명세가 FE 타입 생성의 원본입니다.

---

## 1. 브랜치 전략

- `main`은 항상 배포 가능한 상태를 유지합니다. **`main`에 직접 커밋·푸시하지 않습니다.**
- 모든 작업은 이슈에서 시작하고, 이슈 하나당 브랜치 하나를 만듭니다.
- 브랜치는 짧게 유지하고(가능하면 3일 이내), PR로 `main`에 병합합니다.

### 브랜치 이름

```
<type>/<이슈번호>-<짧은-설명>
```

- `type`: 커밋 type과 동일 (`feat`, `fix`, `refactor`, `docs`, `chore` …)
- 설명: 영어 소문자, 단어는 `-`로 연결, 3~5단어

```
feat/12-login-api
fix/34-letter-list-pagination
refactor/40-auth-service
chore/51-upgrade-spring-boot
```

이슈 없이 하는 아주 작은 작업(오타 수정 등)만 이슈 번호를 생략할 수 있습니다: `docs/fix-readme-typo`

---

## 2. 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)를 따르며, **scope는 필수**입니다.

```
<type>(<scope>): <제목>

<본문 — 선택>

<꼬리말 — 선택>
```

### type

| type | 의미 |
|---|---|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 코드 구조 개선 |
| `perf` | 성능 개선 |
| `style` | 포매팅, 세미콜론 등 동작과 무관한 변경 (CSS 디자인 변경은 `feat`/`fix`) |
| `test` | 테스트 추가·수정 |
| `docs` | 문서만 변경 |
| `build` | 빌드 설정, 의존성 (`package.json`, `build.gradle` 등) |
| `ci` | CI 설정 변경 |
| `chore` | 그 외 잡무 (설정 파일, 스크립트 등) |
| `revert` | 이전 커밋 되돌리기 |

### scope

0장의 표에 있는 값만 사용합니다: `fe`, `be`, `api`, `db`, `infra`, `docs`, `repo`
- 하나의 커밋은 **하나의 scope**만 다룹니다. FE와 BE를 함께 바꿔야 하면 커밋을 나눕니다.
- 예외: API 계약 변경으로 FE·BE를 원자적으로 함께 바꿔야 하는 경우에만 `api` scope로 한 커밋에 담을 수 있습니다.

### 제목 규칙

- 한국어로, 50자 이내, 끝에 마침표 없음
- "~ 추가", "~ 수정", "~ 제거"처럼 **무엇을 했는지** 명확하게 씁니다
- "수정함", "작업", "update" 같은 모호한 제목 금지

### 본문 규칙

- 제목과 한 줄 띄우고 작성, 한 줄 72자 내외에서 줄바꿈
- **무엇을, 왜** 바꿨는지 씁니다 (어떻게는 코드가 설명합니다)

### 꼬리말

- 관련 이슈: `Closes #12`, `Refs #34`
- 하위 호환이 깨지는 변경: `BREAKING CHANGE: <설명>` (API 응답 형태 변경 등은 반드시 표기)
- AI 에이전트가 작성한 커밋: `Co-Authored-By: <에이전트 이름> <이메일>` 트레일러를 붙입니다

### 예시

```
feat(be): 편지 목록 조회 API 추가

GET /api/v1/letters 엔드포인트를 추가한다.
커서 기반 페이지네이션을 사용해 무한 스크롤에 대응한다.

Closes #12
```

```
fix(fe): 편지 작성 시 빈 제목으로 제출되는 문제 수정

Closes #34
```

```
feat(api)!: 편지 응답의 createdAt을 ISO-8601 문자열로 변경

BREAKING CHANGE: createdAt이 epoch millis(number)에서
ISO-8601 문자열로 바뀐다. FE 파싱 로직도 함께 수정한다.

Refs #40
```

### 커밋 단위

- 하나의 커밋 = 하나의 논리적 변경. 빌드가 깨지지 않는 상태로 커밋합니다.
- 포매팅 변경과 로직 변경을 한 커밋에 섞지 않습니다.
- 생성 파일(빌드 결과물, `node_modules` 등)과 비밀 정보(`.env`, 키, 토큰)는 절대 커밋하지 않습니다.

---

## 3. 이슈 컨벤션

모든 작업은 이슈로 시작합니다. 템플릿은 `.github/ISSUE_TEMPLATE/`에 있습니다.

### 제목

```
[<scope>] <요약>
```

```
[be] 편지 목록 조회 API 구현
[fe] 편지 작성 폼 유효성 검사 오류
[api] 사용자 프로필 응답 스키마 정의
```

### 종류 (템플릿)

| 템플릿 | 용도 |
|---|---|
| 기능 요청 (feature) | 새 기능, 개선 |
| 버그 리포트 (bug) | 잘못된 동작 |
| API 계약 (api) | FE·BE 간 요청/응답 형태 정의·변경 |
| 작업 (task) | 리팩터링, 설정, 문서 등 기타 |

### 라벨

| 분류 | 라벨 |
|---|---|
| 종류 | `type:feature`, `type:bug`, `type:refactor`, `type:docs`, `type:chore` |
| 영역 | `area:fe`, `area:be`, `area:api`, `area:db`, `area:infra` |
| 우선순위 | `priority:high`, `priority:medium`, `priority:low` |
| 상태 | `status:blocked`, `status:needs-discussion` |

- 이슈에는 **종류 1개 + 영역 1개 이상** 라벨을 반드시 붙입니다.
- 큰 기능은 상위 이슈(에픽)를 만들고, FE/BE 하위 이슈로 쪼갠 뒤 체크리스트로 연결합니다.

### 본문 작성 원칙

- **완료 조건(Acceptance Criteria)** 을 체크리스트로 명시합니다. AI 에이전트는 이것을 작업 범위로 삼습니다.
- 버그는 재현 단계, 기대 동작, 실제 동작, 환경(OS, 브라우저)을 적습니다.

---

## 4. Pull Request 컨벤션

템플릿은 `.github/PULL_REQUEST_TEMPLATE.md`에 있습니다.

### 제목

커밋 제목 형식과 동일합니다. (squash merge 시 이 제목이 `main`의 커밋 메시지가 됩니다)

```
feat(be): 편지 목록 조회 API 추가
```

### 규칙

- **PR 하나 = 이슈 하나.** 본문에 `Closes #이슈번호`를 반드시 적습니다.
- **PR 하나 = scope 하나.** FE와 BE 변경은 별도 PR로 나눕니다. (`api` 원자적 변경은 예외)
- 변경량은 가능하면 **400줄 이하**(생성 코드, lock 파일 제외). 커지면 쪼갭니다.
- 작업 중이면 Draft PR로 엽니다.
- **리뷰 승인**: 현재는 1인 개발이므로 승인 없이 작성자가 직접 병합합니다(`main` 보호 규칙의 필수 승인 0명).
  팀원이 합류하면 리뷰어 최소 1명의 승인 후 병합하도록 바꾸고, 영역이 다르면 해당 영역 담당자를 리뷰어로 지정합니다.
- AI 에이전트는 직접 병합하지 않습니다. PR을 올린 뒤 사람이 검토하고 병합합니다.
- 병합 방식: **Squash and merge**. 병합 후 브랜치를 삭제합니다.
- 리뷰 반영은 새 커밋으로 추가합니다. 리뷰가 시작된 브랜치에 `force push` 하지 않습니다.

### 병합 전 체크

- [ ] CI(빌드·린트·테스트) 통과
- [ ] `main`과 충돌 없음
- [ ] API 계약 변경 시 명세 문서 갱신
- [ ] UI 변경 시 스크린샷 첨부

---

## 5. 프론트엔드–백엔드 협업 규칙

FE와 BE가 서로를 기다리거나 서로의 코드를 깨뜨리지 않도록 **API 계약을 먼저** 정합니다.

1. **계약 우선(Contract First)**: 새 API나 API 변경은 먼저 `[api]` 이슈를 만들어 엔드포인트, 메서드, 요청/응답 JSON, 에러 코드를 합의합니다.
2. **명세는 한 곳에**: 합의된 계약은 `docs/api/`(또는 Spring에서 생성한 OpenAPI 문서)에 기록하고, 이것을 단일 출처로 삼습니다.
3. **병렬 개발**: 계약이 정해지면 BE는 구현, FE는 계약 기반 목(mock)으로 동시에 개발합니다.
4. **하위 호환 우선**: 필드 삭제·이름 변경·타입 변경은 BREAKING CHANGE입니다. 가능하면 새 필드를 추가하고 기존 필드는 단계적으로 제거합니다. 불가피하면 `!`와 `BREAKING CHANGE:`를 표기하고 FE 담당자를 리뷰어로 지정합니다.
5. **순서**: 계약 변경 시 BE PR을 먼저 병합하고, FE PR은 BE PR을 본문에 링크(`Depends on #PR번호`)합니다.
6. **공통 규칙**
   - API 경로: `/api/v1/...`, 리소스는 복수형 명사, kebab-case (`/api/v1/letter-boxes`)
   - JSON 필드: camelCase
   - 날짜/시간: ISO-8601 문자열 (`2026-11-16T14:30:00+09:00`)
   - 에러 응답은 공통 형식을 사용합니다 (예: `{ "code": "LETTER_NOT_FOUND", "message": "..." }`)
7. **경계 존중**: FE 작업 중 BE 코드를 고치거나 그 반대가 필요하면, 직접 고치지 말고 해당 영역 이슈를 새로 만듭니다.

---

## 6. AI 에이전트 전용 규칙

AI 에이전트는 위 규칙에 더해 다음을 지킵니다.

### 반드시

- 작업 시작 전 연결된 이슈의 완료 조건을 읽고, **그 범위 안에서만** 수정합니다.
- 커밋 전 해당 영역의 린트·타입 체크·테스트를 실행하고 통과를 확인합니다.
  - FE: `frontend/`에서 `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test`
  - BE: `backend/`에서 `./gradlew build` (Testcontainers 사용 → Docker 실행 필요)
- 테스트가 실패하거나 실행하지 못했다면 PR 본문에 그 사실과 출력을 그대로 적습니다.
- PR 본문의 "AI 사용" 항목에 사용한 에이전트와 사람이 직접 검토한 범위를 적습니다.
- 새 의존성 추가, DB 스키마 변경, API 계약 변경, 인증/보안 관련 변경은 진행 전에 사람에게 확인합니다.

### 금지

- `main`에 직접 커밋·푸시, `force push`(특히 공유 브랜치), 히스토리 재작성
- 비밀 정보(`.env`, API 키, 비밀번호, 토큰) 커밋 또는 PR·이슈 본문에 노출
- 이슈 범위 밖의 파일 수정, 관련 없는 대규모 포매팅·리네이밍
- lock 파일(`package-lock.json`, `pnpm-lock.yaml` 등)을 의존성 변경 없이 재생성
- 테스트를 통과시키기 위해 테스트를 삭제·비활성화(`skip`, `@Disabled`)
- `.gitignore` 대상 파일을 `git add -f`로 강제 추가

### 작업 흐름 요약

```
이슈 확인 → 브랜치 생성(<type>/<번호>-<설명>) → 구현
→ 린트/테스트 → 커밋(<type>(<scope>): 제목) → 푸시
→ PR 생성(템플릿 작성, Closes #번호) → 리뷰 반영 → Squash merge
```

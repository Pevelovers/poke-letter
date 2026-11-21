# poke-letter

React + Spring Boot 모노레포입니다. 협업 규칙은 [AGENTS.md](AGENTS.md)를 따릅니다.

## 기술 스택

| 영역 | 스택 |
|---|---|
| Frontend | Vite 8, React 19 (+ React Compiler), TypeScript 7, TanStack Router/Query, Zustand, React Hook Form + Zod, Tailwind CSS v4 + shadcn/ui, Vitest, Playwright, oxlint, Prettier |
| Backend | Java 25, Spring Boot 4.1, Spring Security 7, Spring Data JPA, Flyway, springdoc-openapi, Testcontainers |
| Infra | MySQL 8.4 (로컬 Docker Compose, 운영은 8.0.16 이상), GitHub Actions |

## 사전 준비

- **Node.js 24** (`.nvmrc`) — `nvm use` 또는 `fnm use`
- **pnpm** — `corepack enable` (버전은 `frontend/package.json`의 `packageManager`로 고정)
- **JDK** — 없어도 됩니다. Gradle이 JDK 25를 자동으로 내려받습니다
- **Docker Desktop** — 로컬 DB와 백엔드 테스트(Testcontainers)에 필요합니다

## 실행

```bash
# 1. 로컬 DB: MySQL 8.4 (호스트 포트 3307)
docker compose up -d

# 2. 백엔드 → http://localhost:8080
cd backend
cp .env.example .env   # 처음 한 번. OAuth 키를 채운다 (.env는 커밋되지 않음)
./gradlew bootRun --args='--spring.profiles.active=dev'   # Windows: gradlew.bat bootRun --args=...

# 3. 프론트엔드 → http://localhost:5173  (/api 요청은 8080으로 프록시)
cd frontend
pnpm install
pnpm dev
```

- API 문서(Swagger UI): http://localhost:8080/swagger-ui.html
- 헬스 체크: http://localhost:8080/actuator/health
- `dev` 프로필은 `backend/.env`를 읽고, 세션 쿠키의 `Secure`를 끄고, 개발용 로그인(`POST /dev/login`)을 연다. 운영에서는 쓰지 않는다
- 개인 설정은 커밋되지 않는 `application-local.yml`에 두고 `--spring.profiles.active=dev,local`로 함께 켠다
- **`.env`는 앱마다 따로 둔다** (`backend/.env`, `frontend/.env`). 루트에 하나로 합치지 않는다
  - **FE에는 비밀 값을 넣지 않는다.** Vite는 `VITE_`로 시작하는 변수를 브라우저 번들에 그대로 넣으므로 누구나 볼 수 있다. OAuth 시크릿 같은 값은 `backend/.env`에만 둔다
  - 각 `.env`는 커밋하지 않고, 키 이름은 `.env.example`에 견본으로 남긴다

## 주요 명령

| 위치 | 명령 | 설명 |
|---|---|---|
| frontend | `pnpm lint` / `pnpm typecheck` | 린트 / 타입 체크 |
| frontend | `pnpm format` | Prettier 포맷 |
| frontend | `pnpm test` | 단위 테스트 (Vitest) |
| frontend | `pnpm test:e2e` | E2E 테스트 (최초 1회 `pnpm exec playwright install chromium`) |
| frontend | `pnpm api:generate` | 백엔드 OpenAPI 명세로 API 타입·Query 훅 생성 (백엔드 실행 필요) |
| backend | `./gradlew build` | 컴파일 + 테스트 |
| backend | `./gradlew test` | 테스트만 |

## 프론트 미리보기 배포 (Netlify)

백엔드 없이 프론트엔드만 올려 개발 현황을 보여 줄 때 쓴다. 설정은 루트 `netlify.toml`에 있다.

- **목 API로 동작한다.** 데이터는 방문자 브라우저의 로컬스토리지에만 저장되고, 로그인 버튼은 바로 `/me`로 간다
- **포켓몬·볼 이미지와 PokéAPI는 그대로 쓸 수 있다.** 이미지는 `raw.githubusercontent.com`의 PokéAPI 스프라이트를 직접 불러오고, 에디터(`/editor`)는 브라우저에서 `pokeapi.co`를 호출한다. 두 곳 모두 다른 도메인에서의 요청을 허용한다(`Access-Control-Allow-Origin: *`)
- 에디터는 `/editor`에서 열린다

배포 방법은 두 가지다.

| 방법 | 하는 법 | 커밋하지 않는 임시 에셋 (`public/art-temp`, `public/fonts-temp`) |
|---|---|---|
| **저장소 연결** | Netlify에서 이 저장소를 연결한다. 빌드 설정은 `netlify.toml`을 읽는다 | 저장소에 없으므로 올라가지 않는다. 트리 배경은 하늘색, 글꼴은 원스토어 모바일POP체로 보인다 |
| **CLI 수동 배포** | `cd frontend && pnpm build && pnpm dlx netlify-cli deploy --dir dist` (미리보기 주소), 확정은 `--prod` | 내 컴퓨터의 빌드 결과를 그대로 올리므로 함께 공개된다. Pokemon DPPt 글꼴(CC BY-SA 3.0)은 출처 표기가 필요하다 |

## 구조

```
poke-letter/
├── frontend/
│   └── src/
│       ├── routes/          # TanStack Router 파일 기반 라우트 (routeTree.gen.ts 자동 생성)
│       ├── pages/           # 화면 컴포넌트
│       ├── components/ui/   # shadcn/ui 컴포넌트 (pnpm dlx shadcn@latest add <name>)
│       ├── api/generated/   # orval 생성 코드 (직접 수정 금지)
│       └── lib/
├── backend/
│   └── src/main/
│       ├── java/com/pokeletter/
│       └── resources/
│           ├── application.yml
│           └── db/migration/   # Flyway 마이그레이션 (V1__설명.sql)
├── compose.yaml
└── .github/
```

## 기획 단계에서 결정할 것

- 인증 방식 (세션 / JWT / 소셜 로그인) — 현재 `SecurityConfig`는 헬스 체크·API 문서만 공개하고 나머지는 차단
- 배포 대상

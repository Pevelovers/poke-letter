# 기술 스택과 인프라

> Source: Deep Interview, 2026-11-16

## Key Points (확정)

- **백엔드: Spring Boot 유지** (PR #4의 뼈대: Java 25, Spring Boot 4.1)
- **DB: Supabase 무료 티어 PostgreSQL**
- **서버: 이미 운영 중인 AWS 서버에 함께 배포**한다. 새 서버 비용은 생기지 않는다.
- **콜드 스타트는 허용하지 않는다.** 링크를 누른 친구가 바로 화면을 봐야 한다. 기존 AWS 서버가 상시 실행 중이므로 이 조건을 충족한다.

## 비용 관점

- 신규 고정비: 없음 (기존 서버 + Supabase 무료 티어)
- 비용 위험: Supabase 무료 한도 초과, 기존 서버 자원 부족, 데이터 전송량
- 이미지: 포켓몬 이미지를 직접 호스팅하지 않으면 이미지 트래픽 비용이 생기지 않는다 (ip-asset-policy.md의 "이미지 제공 방식"과 연결)

## Supabase 무료 티어 조사 (2026-11-16 기준)

**DB 용량, 데이터 전송량, 컴퓨트는 2026-11-18에 [공식 가격 페이지](https://supabase.com/pricing)의 Free 플랜 항목으로 확인했다.** 일시 중지·백업·프로젝트 수는 가격 페이지 요약에 없어 아직 제3자 출처 값이다. 연결 방식은 Supabase 공식 문서 기준이다.

| 항목 | 내용 | 이 서비스에 미치는 영향 |
|---|---|---|
| DB 용량 | **500 MB** (공식 확인) | 메시지 1건을 약 2 KB(500자 UTF-8과 부가 데이터)로 잡으면 수십만 건 규모라 여유가 있다고 보인다 (추정) |
| 일시 중지 | **활동이 1주일 없으면 자동 일시 중지** (제3자 출처, 공식 문서 확인 필요) | 출시 전 개발 공백기나 12/25 이후 트래픽이 줄어드는 시기에 서비스가 멈출 수 있다 → 대응 필요 |
| 백업 | **무료 티어는 자동 백업이 없다** | 직접 `pg_dump` 백업을 해야 한다 |
| 데이터 전송량 | **월 5 GB** + 캐시된 전송량 5 GB (공식 확인) | DB에서 우리 서버로 가는 조회 결과도 전송량에 포함된다고 보고, 트리 조회처럼 자주 부르는 쿼리는 필요한 컬럼만 가져온다. 이미지를 DB나 Storage에서 내려주지 않으므로 큰 부담은 없을 것으로 본다 (추정) |
| 컴퓨트 | 공유 CPU, **RAM 500 MB** (공식 확인) | 동시 연결과 무거운 쿼리에 약하다. Hikari 커넥션 풀을 작게 잡는다 (IN-2) |
| 프로젝트 수 | 계정당 활성 프로젝트 2개 | |
| 직접 연결 | **IPv6 전용** (IPv4 전용 주소는 Pro 플랜 유료 애드온) | AWS 서버가 IPv4만 쓴다면 직접 연결할 수 없다 |
| Session pooler | IPv4 지원, 포트 5432 | **Spring과 Flyway는 이것을 사용한다** |
| Transaction pooler | 포트 6543 | Hibernate의 prepared statement, Flyway의 세션 잠금과 맞지 않는다 → 사용하지 않는다 |

출처: [Supabase 연결 문서](https://supabase.com/docs/guides/database/connecting-to-postgres), [IPv4/IPv6 호환성](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP), [Spring Boot 퀵스타트](https://supabase.com/docs/guides/getting-started/quickstarts/spring-boot), [Pooling and limits](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits), [JetAdmin 가격 가이드](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/), [DEV: 2026 무료 티어 한도](https://dev.to/mahdi_benrhouma_fe1c6005/supabase-free-tier-limits-in-2026-what-you-actually-get-and-when-you-will-hit-them-4mhe)

## Supabase 프로젝트 설정 (2026-11-18 생성)

| 항목 | 설정 | 이유 |
|---|---|---|
| 계정 | 운영자 GitHub 계정으로 로그인, Organization `Pevelovers` (Free) | 일시 중지 경고 메일을 평소 쓰는 메일로 받는다 |
| 프로젝트 이름 | `poke-letter` | |
| 리전 | **Northeast Asia (Seoul)** `ap-northeast-2` | EC2와 같은 리전 (IN-1) |
| 연결 | **Session pooler** (IPv4, 포트 5432) | Direct는 IPv6 전용, Transaction pooler는 Flyway·Hibernate와 맞지 않는다 |
| GitHub 연동 | **안 함** | 스키마는 Flyway로만 바꾼다. 저장소 권한도 주지 않는다 |
| Data API | **끔** | 켜 두면 공개 키로 테이블을 직접 읽을 수 있어, 12/25 전 공개 금지(POL-RVL-01)를 우회하는 통로가 생긴다. 서버는 JDBC로 연결하므로 필요 없다 |
| 새 테이블 API 자동 권한 | **끔** | 위와 같은 이유 |
| 새 테이블 RLS 자동 적용 | **켬** | Data API가 다시 켜져도 막히도록 한 이중 잠금. 서버는 테이블 소유자로 접속하므로 영향이 없다 |
| Agent Skills | 설치 안 함 | supabase-js를 쓰지 않는다 |

환경 변수 (값은 비밀번호 관리자에만 둔다):
```
DB_URL=jdbc:postgresql://aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
DB_USERNAME=postgres.<프로젝트 ID>
DB_PASSWORD=<생성한 비밀번호>
```
비밀번호는 `DB_PASSWORD`로 따로 넣으므로 URL용 퍼센트 인코딩은 필요 없다.

## 이 결정에서 나오는 요구사항 (제안)

| # | 요구사항 |
|---|---|
| IN-1 | Supabase 프로젝트 리전을 AWS 서버와 같은 리전으로 만든다 (지연 시간 최소화) |
| IN-2 | `DB_URL`을 Session pooler(5432)로 설정하고, Hikari 커넥션 풀은 작게 잡는다 (공유 pooler의 연결 수 제한 고려) |
| IN-3 | **일시 중지 방지:** 매일 DB를 조회하는 예약 작업을 둔다. 다만 어떤 요청을 "활동"으로 보는지는 Supabase 기준을 확인해야 한다 |
| IN-4 | **자체 백업:** 하루 1회 `pg_dump`를 AWS 서버나 다른 저장소에 보관한다. 종료할 때 백업도 함께 삭제한다 (PV-4) |
| IN-5 | 로컬 개발은 지금처럼 Docker Compose의 PostgreSQL을 쓰고, 운영만 Supabase를 쓴다 |

## 기존 AWS 서버 (확정 정보)

- **EC2, 서울 리전(ap-northeast-2), 메모리 여유가 빠듯함**
- → Supabase 프로젝트도 서울 리전에 만든다 (IN-1)
- → JVM 메모리를 제한해야 한다: 최대 힙(`-Xmx`)을 작게 잡고 컨테이너 메모리 한도를 설정한다. 정확한 값은 서버의 실제 여유 메모리(`free -h`)를 확인한 뒤 정한다
- → 필요하면 스왑을 설정해 메모리 부족으로 프로세스가 죽는 것을 막는다

## 도메인 (확정, 2026-11-17)

**`pokeletter.duckdns.org`** — DuckDNS 무료 서브도메인. 유료 도메인은 쓰지 않는다.

- A 레코드로 EC2 공인 IP를 가리키고, HTTPS는 Let's Encrypt로 받는다
- 도메인이 서버 IP만 가리키므로, 서버가 바뀌어도 IP만 고치면 공유된 링크가 그대로 동작한다
- EC2 기본 주소(`*.compute.amazonaws.com`)는 Let's Encrypt 인증서를 받을 수 없어 쓰지 않는다
- Netlify(`*.netlify.app`) + 프록시 방식도 검토했으나, Netlify→EC2 구간에도 HTTPS 주소가 필요해 결국 DuckDNS가 필요하고 거치는 곳만 늘어나 택하지 않았다
- 위험: 무료 서비스라 장애가 날 수 있다. 운영 기간이 2개월이라 감수한다. 출시 후에는 공유된 링크 때문에 도메인을 바꾸기 어렵다

## 프론트엔드 배포 위치 (사용자 요청으로 추천)

**[추천] 같은 EC2 서버에서 정적 파일로 제공한다.** (확정 전)

| 기준 | 같은 EC2 (추천) | Cloudflare Pages / Netlify 등 |
|---|---|---|
| 도메인·쿠키 | FE와 `/api`가 한 도메인이라 OAuth 로그인 쿠키, CORS 설정이 가장 단순하다 | 도메인이 다르면 CORS 설정이 필요하고, Safari 등은 다른 사이트의 쿠키를 막는다. 같은 상위 도메인의 서브도메인으로 맞춰야 한다 |
| 메모리 | 정적 파일 제공은 리버스 프록시가 맡으므로 추가 메모리가 거의 들지 않는다 | EC2 부담이 없다 |
| 비용 | 번들이 작아(현재 빌드 기준 JS 약 100 KB gzip) 전송량 부담이 작다. 다만 AWS의 데이터 전송 요금 체계는 확인이 필요하다 | 무료 티어 범위 안에서 0원. 각 서비스의 무료 한도는 확인이 필요하다 |
| 배포 | 백엔드와 함께 한 번에 배포한다 | 별도 배포 파이프라인이 생긴다 |
| 장애 | EC2가 죽으면 FE도 함께 죽는다 (어차피 API 없이는 동작하지 않는다) | FE는 살아 있어도 API가 없으면 쓸 수 없다 |

**추천 이유:** 혼자 15일 안에 만들어야 하므로 설정할 곳이 적은 쪽이 낫다. 백엔드가 죽으면 서비스 전체가 쓸 수 없어서, FE만 분리해 얻는 가용성 이점도 작다.

## Open Questions

- EC2 정보(리버스 프록시, 여유 메모리, 고정 IP, 접근 권한 등) → 지인이 관리하는 서버라 11/22까지 받는다. 목록은 [남은 질문](_open-questions.md#서버-정보-지인-관리-서버-1122까지-받기)
- 프론트엔드 배포 위치 최종 확정 (추천안 확인 필요)
- HTTPS 인증서 (Let's Encrypt 등)
- 배포 방식 (Docker + GitHub Actions 등)
- Supabase 무료 티어의 제한 사항 → 조사 중

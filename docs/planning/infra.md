# 기술 스택과 인프라

> Source: Deep Interview, 2026-11-16

## Key Points (확정)

- **백엔드: Spring Boot 유지** (PR #4의 뼈대: Java 25, Spring Boot 4.1)
- **DB: 배포 인프라의 MySQL (8.0.16 이상)**. 2026-11-19 지인 요청으로 Supabase PostgreSQL에서 전환 (#33)
- **서버: 지인의 클라우드 네이티브 인프라에 배포**한다. 새 서버 비용은 생기지 않는다.
- **콜드 스타트는 허용하지 않는다.** 링크를 누른 친구가 바로 화면을 봐야 한다. 기존 AWS 서버가 상시 실행 중이므로 이 조건을 충족한다.

## 배포 인프라 (2026-11-19, 지인 답변)

| 항목 | 답변 | 영향 |
|---|---|---|
| 배포 방식 | 저장소에 올리면 검사 후 **롤링 업데이트**. 서버에 직접 접속하지 않는다. 저장소 주소를 주면 그쪽 사이트에서 빌드한다 | 저장소에 빌드 파일(Dockerfile)을 둔다. SSH 배포 절차는 필요 없다 |
| 구성 | 클라우드 네이티브. CI/CD, DR·HA, 헬스 체크 기반 교체 | 장애 시 자동 교체. 12/25 직접 대응 부담이 줄어든다 |
| 확장 | 수직·수평 확장 가능, 제한 없음 | GCP 이전 계획이 필요 없다. 대신 **서버가 여러 대일 때 세션·Rate Limit·예약 작업을 공유해야 한다** |
| CPU | **arm64** | 이미지를 arm64로 빌드한다. CVE-2026-114938(x86-64 전용)은 해당 없음 |
| 의존성 | Docker 컨테이너로 격리 | 같은 서버의 다른 서비스와 충돌 걱정 없음 |
| DB | MySQL 형식으로 바꿔 달라는 요청. 제공 여부·버전은 미확인 | MySQL 8.0.16 이상으로 전환 (#33) |
| 도메인 | kpokemon 도메인으로 연결 예정 | 정확한 주소 미확인. OAuth 리다이렉트 URI를 새로 등록해야 한다. 주소에 "pokemon"이 들어가면 IP 위험이 커진다 |

남은 확인 사항은 [남은 질문](_open-questions.md)의 "배포 인프라"에 있다.

## 비용 관점

- 신규 고정비: 없음 (기존 서버 + Supabase 무료 티어)
- 비용 위험: Supabase 무료 한도 초과, 기존 서버 자원 부족, 데이터 전송량
- 이미지: 포켓몬 이미지를 직접 호스팅하지 않으면 이미지 트래픽 비용이 생기지 않는다 (ip-asset-policy.md의 "이미지 제공 방식"과 연결)

## Supabase 무료 티어 조사 (2026-11-16 기준) — 사용 안 함 (2026-11-19 MySQL 전환)

**DB 용량, 데이터 전송량, 컴퓨트는 2026-11-18에 [공식 가격 페이지](https://supabase.com/pricing)의 Free 플랜 항목으로 확인했다.** 일시 중지·백업·프로젝트 수·복구 기간도 같은 날 공식 가격 페이지와 [Billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [Upgrading](https://supabase.com/docs/guides/platform/upgrading) 문서로 확인했다. 단, **무엇을 "활동"으로 보는지와 중지 전 경고 메일 여부는 공식 문서에 없다.** 연결 방식은 Supabase 공식 문서 기준이다.

| 항목 | 내용 | 이 서비스에 미치는 영향 |
|---|---|---|
| DB 용량 | **500 MB** (공식 확인) | 메시지 1건을 약 2 KB(500자 UTF-8과 부가 데이터)로 잡으면 수십만 건 규모라 여유가 있다고 보인다 (추정) |
| 일시 중지 | **활동이 1주일 없으면 자동 일시 중지** (공식 확인). "활동"의 정의는 공식 문서에 없음 | 로컬 개발은 Docker DB를 쓰므로 배포(11/28) 전까지 Supabase에 요청이 없어 **중지될 가능성이 크다**. 12/26 이후 사용이 줄 때도 멈출 수 있다 → IN-3, IN-6 |
| 복구 | 중지 후 **1년 안에** 대시보드에서 버튼 한 번으로 복구 (공식 확인). 복구할 때 Postgres 최신 마이너 버전으로 올라간다 | 데이터를 잃을 위험은 낮다. 복구 후 앱이 다시 연결되는지 확인한다 |
| 백업 | **무료 티어는 자동 백업이 없다** (공식 확인) | 직접 `pg_dump` 백업을 해야 한다 |
| 데이터 전송량 | **월 5 GB** + 캐시된 전송량 5 GB (공식 확인) | DB에서 우리 서버로 가는 조회 결과도 전송량에 포함된다고 보고, 트리 조회처럼 자주 부르는 쿼리는 필요한 컬럼만 가져온다. 이미지를 DB나 Storage에서 내려주지 않으므로 큰 부담은 없을 것으로 본다 (추정) |
| 컴퓨트 | 공유 CPU, **RAM 500 MB** (공식 확인) | 동시 연결과 무거운 쿼리에 약하다. Hikari 커넥션 풀을 작게 잡는다 (IN-2) |
| 프로젝트 수 | 활성 프로젝트 2개. 중지된 프로젝트는 개수에 들어가지 않는다 (공식 확인) | |
| 직접 연결 | **IPv6 전용** (IPv4 전용 주소는 Pro 플랜 유료 애드온) | AWS 서버가 IPv4만 쓴다면 직접 연결할 수 없다 |
| Session pooler | IPv4 지원, 포트 5432 | **Spring과 Flyway는 이것을 사용한다** |
| Transaction pooler | 포트 6543 | Hibernate의 prepared statement, Flyway의 세션 잠금과 맞지 않는다 → 사용하지 않는다 |

출처: [Supabase 연결 문서](https://supabase.com/docs/guides/database/connecting-to-postgres), [IPv4/IPv6 호환성](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP), [Spring Boot 퀵스타트](https://supabase.com/docs/guides/getting-started/quickstarts/spring-boot), [Pooling and limits](https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits), [JetAdmin 가격 가이드](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/), [DEV: 2026 무료 티어 한도](https://dev.to/mahdi_benrhouma_fe1c6005/supabase-free-tier-limits-in-2026-what-you-actually-get-and-when-you-will-hit-them-4mhe)

## Supabase 프로젝트 설정 (2026-11-18 생성) — 사용 안 함 (2026-11-19 MySQL 전환, 프로젝트는 삭제 예정)

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
| IN-3 | **일시 중지 방지:** 매일 DB를 조회하는 예약 작업을 둔다. "활동"의 정의가 공식 문서에 없으므로, 실제 사용자 요청과 같은 경로(우리 API → DB)로 조회해 가능성을 높이고, 효과는 보장되지 않는 것으로 본다 |
| IN-6 | **중지 감지와 복구:** 헬스 체크가 DB 연결을 포함하게 해 중지를 알아챈다. 중지되면 대시보드에서 수동 복구한다. 배포 직전(11/28)에 프로젝트 상태를 확인하고 중지돼 있으면 먼저 복구한다 |
| IN-4 | **자체 백업:** 하루 1회 `pg_dump`를 AWS 서버나 다른 저장소에 보관한다. 종료할 때 백업도 함께 삭제한다 (PV-4) |
| IN-5 | 로컬 개발은 지금처럼 Docker Compose의 PostgreSQL을 쓰고, 운영만 Supabase를 쓴다 |

## 보안: CVE-2026-114938 (Java4Shell)

2026-11-17 오라클이 공개한 JVM 취약점 ([CVE.org](https://www.cve.org/CVERecord?id=CVE-2026-114938), [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-114938), CVSS 9.2/8.1). HotSpot의 x86-64 Base64 디코더 최적화(AVX-512 VBMI) 메모리 손상으로, 인증 전 원격 코드 실행이 가능하다. 2026-11-19 검토.

| 공격 조건 | 이 프로젝트 | 판단 |
|---|---|---|
| JDK 17.0.6 이상, 21, 25, 27 (패치 전) | 툴체인 **Java 25**. 로컬은 Temurin 25.0.5 | 해당 |
| x86-64 + **AVX-512 VBMI** CPU (ARM 영향 없음) | 로컬 Mac(i5-8257U)은 AVX-512 없음. **운영 서버 미확인** | 운영 서버 CPU에 달림 |
| 인증 전에 공격자 입력을 Base64로 디코딩하는 경로 | HTTP Basic은 껐다. 그러나 Spring Security CSRF 처리기(`XorCsrfTokenRequestAttributeHandler`)가 `_csrf` 파라미터를 Base64로 디코딩하고, CSRF 검사는 로그인 전에도 돈다 | 경로 있음 |
| 악성 서버로의 TLS 연결 (클라이언트 측) | 구글·카카오·네이버·PokéAPI·Supabase에만 연결 | 낮음 |

| # | 대응 |
|---|---|
| IN-7 | 운영 JVM은 **패치된 JDK 25**로 실행한다. 2026-11-18 기준 패치: Oracle `25.0.5.1`, Amazon Corretto `25.0.5.1.2`. Temurin 패치는 미출시. 컨테이너 기본 이미지를 패치된 배포판으로 고르고 출시 전 버전을 다시 확인한다 |
| IN-8 | 패치 JDK를 쓸 수 없으면 JVM 옵션 `-XX:-UseBASE64Intrinsics`로 취약한 최적화를 끈다. 이 서비스는 Base64를 거의 쓰지 않아 성능 영향이 없다. 실행 후 `jcmd <pid> VM.flags`로 적용을 확인한다 |
| IN-9 | 서버 CPU(AVX-512 VBMI 여부)를 서버 정보 요청에서 확인한다. 같은 서버의 다른 Java 서비스도 영향을 받을 수 있어 지인에게 알린다 |

- 로컬 개발 환경은 CPU 조건을 만족하지 않아 급하지 않다. Temurin 패치가 나오면 로컬 JDK도 갱신한다
- 출처: 위 공식 기록, [Cyber Kendra 기사](https://www.cyberkendra.com/2026/11/cve-2026-114938-pre-auth-rce-flaw-in-java-17-puts-servers-at-risk.html) (영향 버전·CPU 조건·패치 버전)

## 기존 AWS 서버 (2026-11-16 정보) — 지인 인프라 답변으로 대체

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

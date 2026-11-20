# 기획 인터뷰 요약

> Source: Deep Interview, 2026-11-16

## 한 줄 요약

친구들이 익명으로 **포켓몬을 골라 메시지와 함께 선물**하면 트리에 장식이 달리고, **12/25에 한꺼번에 열어 보는** 크리스마스 롤링페이퍼. 2026-12-01에 출시해 2027-01-31에 종료한다.

## 확정된 결정

| 영역 | 결정 | 문서 |
|---|---|---|
| 목표 | 12/1 출시, 롤링페이퍼가 중심이고 수집은 보조, 개발·디자인 모두 1인 | [service-goals.md](service-goals.md) |
| IP | 공식 포켓몬 리소스 사용 (허가 없는 사용임을 인지). 삭제 요청 시 에셋 교체 후 운영 유지 + 메시지 내보내기. Public 저장소에는 직접 만든 에셋만 둔다 | [ip-asset-policy.md](ip-asset-policy.md) |
| 개봉 | 장식(닉네임만)은 즉시 보이고, 내용과 포켓몬은 12/25 공개. 12/25 이후 도착분은 즉시 개봉 | [game-rules.md](game-rules.md), [mvp-scope.md](mvp-scope.md) |
| 캐릭터 | 작성자가 고른다. 선택기의 랜덤 버튼과 확인 창, 2% 이로치(2026-11-20, #38). 전체 포켓몬 + 리전폼. 도감 채우기 없이 받은 것만 모아본다. 중복 허용 | [game-rules.md](game-rules.md) |
| MVP 추가 | 개봉 연출, 트리 주인의 메시지 삭제, 욕설 필터 | [mvp-scope.md](mvp-scope.md) |
| 필터 | 서버에서 처리하고 단어 단위로 마스킹. 닉네임에도 적용. 사전 기반으로 직접 구현 (제안) | [message-filtering.md](message-filtering.md) |
| 인증 | 트리 주인은 카카오·구글·네이버 OAuth, 작성자는 로그인 없음 | [auth-and-messages.md](auth-and-messages.md) |
| 메시지 | 500자, 로컬스토리지에 자동 저장 | [auth-and-messages.md](auth-and-messages.md) |
| 개인정보 | 제공자 고유 ID만 받는다. 1인 1트리. 2027-01-31 종료 후 삭제 | [privacy-and-retention.md](privacy-and-retention.md) |
| 인프라 | Spring Boot 유지, Supabase 무료 DB(서울 리전, Session pooler), 기존 EC2(서울)에 FE와 BE를 함께 배포. 콜드 스타트 불허 | [infra.md](infra.md) |
| 일정 | 평일 저녁 + 주말. 밀리면 개봉 연출, 모아보기, 네이버, 백업 자동화 순으로 12/1 이후로 미룬다 | [schedule.md](schedule.md) |

## 제외된 것

희귀도, 도감 완성 보상, 수집률, 업적·칭호, 메가진화·거다이맥스 폼, 이메일 수집, 다중 트리, 계정 연동

## 가장 큰 위험 3가지

1. **일정:** 15일, 평일 저녁 개발에 디자인까지 해야 한다 → 11/22에 진행 상황을 보고 범위를 다시 점검
2. **IP:** 허가 없이 공식 리소스를 사용한다 → 캐릭터 팩 분리, 대체 팩, 연락 창구, 내보내기로 대응
3. **외부 의존:** 도메인, OAuth 앱 등록, 네이버 검수, Supabase 일시 중지 정책 → 첫 이틀 안에 신청하고 확인

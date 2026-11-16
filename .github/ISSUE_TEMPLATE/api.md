---
name: API 계약
about: FE·BE 간 API 요청/응답 정의 또는 변경
title: "[api] "
labels: type:feature, area:api
---

## 목적

<!-- 이 API로 화면/기능에서 무엇을 하나요? -->

## 엔드포인트

`METHOD /api/v1/...`

## 요청

```json
{
}
```

## 응답 (성공)

```json
{
}
```

## 에러

| HTTP 상태 | code | 상황 |
|---|---|---|
| 404 | `..._NOT_FOUND` | |

## 하위 호환

- [ ] 신규 API
- [ ] 기존 API 변경 (하위 호환 유지)
- [ ] 기존 API 변경 (BREAKING CHANGE) → 영향 범위:

## 완료 조건

- [ ] FE·BE 담당자 합의
- [ ] 명세 문서(`docs/api/` 또는 OpenAPI) 반영
- [ ] BE 구현 이슈: #
- [ ] FE 연동 이슈: #

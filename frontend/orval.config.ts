import { defineConfig } from 'orval'

// 백엔드(springdoc)의 OpenAPI 명세로 API 타입과 TanStack Query 훅을 생성한다.
// 사용: 백엔드를 실행한 뒤 `pnpm api:generate`
export default defineConfig({
  api: {
    input: {
      target: process.env.OPENAPI_URL ?? 'http://localhost:8080/v3/api-docs',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
    },
  },
})

import { render, screen } from '@testing-library/react'

import { WithBrand } from './BrandName'

describe('WithBrand', () => {
  it('{brand} 자리를 게임 문구 글꼴의 서비스 이름으로 바꾼다', () => {
    render(
      <p data-testid="line">
        <WithBrand text="{brand}는 비공식 팬 프로젝트예요." />
      </p>,
    )

    expect(screen.getByTestId('line')).toHaveTextContent('PokéLetter는 비공식 팬 프로젝트예요.')
    expect(screen.getByText('PokéLetter')).toHaveClass('font-game')
  })
})

import { render, screen } from '@testing-library/react'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('프로젝트 이름을 보여준다', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: 'poke-letter' })).toBeInTheDocument()
  })
})

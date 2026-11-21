import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { credits } from '@/config/assets'

import { NoticeFooter } from './NoticeFooter'

describe('NoticeFooter', () => {
  it('DPPt 글꼴의 출처와 라이선스를 링크로 표기한다 (CC BY-SA 3.0)', () => {
    render(<NoticeFooter />)
    expect(screen.getByRole('link', { name: 'Pokemon DPPt' })).toHaveAttribute(
      'href',
      credits.dpptFont.url,
    )
    expect(screen.getByRole('link', { name: 'CC BY-SA 3.0' })).toHaveAttribute(
      'href',
      credits.dpptFont.licenseUrl,
    )
    expect(screen.getByText(/aztecwarrior28/)).toBeInTheDocument()
  })
})

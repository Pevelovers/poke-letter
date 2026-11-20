import { WithBrand } from '@/components/common/BrandName'
import { appConfig } from '@/config/app'
import { strings } from '@/config/strings'

/** 비공식 팬 프로젝트 고지 (F-OPS-01, POL-IP-01). 고지라 읽기 쉬운 font-sans를 쓴다 */
export function NoticeFooter() {
  return (
    <footer className="border-t border-border px-4 py-5 font-sans text-xs leading-relaxed text-muted-foreground">
      <p className="font-semibold">{strings.notice.title}</p>
      {strings.notice.lines.map((line) => (
        <p key={line}>
          <WithBrand text={line} />
        </p>
      ))}
      <p className="mt-1">{strings.notice.contact(appConfig.contactEmail)}</p>
    </footer>
  )
}

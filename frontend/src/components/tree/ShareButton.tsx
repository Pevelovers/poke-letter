import { Share2 } from 'lucide-react'
import { useState } from 'react'

import { ActionButton } from '@/components/common/ActionButton'
import { strings } from '@/config/strings'
import { copyText } from '@/lib/clipboard'

interface ShareButtonProps {
  treeId: string
  treeName: string
}

type ShareStatus = 'idle' | 'copied' | 'failed'

function shareUrlOf(treeId: string): string {
  return `${window.location.origin}/t/${treeId}`
}

/**
 * 손가락으로 조작하는 기기(모바일)인지. PC 브라우저도 Web Share API를 지원하지만
 * PC에서는 OS 공유 창보다 링크 복사가 자연스러우므로 모바일에서만 공유 시트를 쓴다.
 */
function prefersShareSheet(): boolean {
  return (
    typeof navigator.share === 'function' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

/**
 * 공유 (F-TRE-02): 모바일은 기기 공유 시트, PC나 공유 시트가 없는 환경은 링크 복사.
 * 복사도 막히면 링크를 직접 복사할 수 있게 보여 준다.
 */
export function ShareButton({ treeId, treeName }: ShareButtonProps) {
  const [status, setStatus] = useState<ShareStatus>('idle')
  const url = shareUrlOf(treeId)

  const handleShare = async () => {
    if (prefersShareSheet()) {
      try {
        await navigator.share({ title: strings.me.shareTitle(treeName), url })
        return
      } catch (error) {
        // 사용자가 공유 시트를 닫은 경우는 그대로 끝낸다. 다른 실패는 복사로 넘어간다
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    const copied = await copyText(url)
    setStatus(copied ? 'copied' : 'failed')
    if (copied) window.setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <ActionButton onClick={() => void handleShare()}>
        <Share2 aria-hidden />
        {strings.me.share}
      </ActionButton>
      <p role="status" className="min-h-5 text-center text-sm text-secondary">
        {status === 'copied' && strings.me.copied}
        {status === 'failed' && strings.me.copyFailed}
      </p>
      {status === 'failed' && (
        <input
          readOnly
          value={url}
          aria-label={strings.me.shareLink}
          onFocus={(event) => event.currentTarget.select()}
          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
        />
      )}
    </div>
  )
}

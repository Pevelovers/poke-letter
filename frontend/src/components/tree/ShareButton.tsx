import { Share2 } from 'lucide-react'
import { useState } from 'react'

import { ActionButton } from '@/components/common/ActionButton'
import { strings } from '@/config/strings'

interface ShareButtonProps {
  treeId: string
  treeName: string
}

function shareUrlOf(treeId: string): string {
  return `${window.location.origin}/t/${treeId}`
}

/**
 * 공유: 기기 공유 시트(Web Share API)를 먼저 쓰고, 없으면 링크를 복사한다 (F-TRE-02).
 */
export function ShareButton({ treeId, treeName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = shareUrlOf(treeId)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: strings.me.shareTitle(treeName), url })
        return
      } catch (error) {
        // 사용자가 공유 시트를 닫은 경우는 그대로 끝낸다
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <ActionButton onClick={() => void handleShare()}>
        <Share2 aria-hidden />
        {strings.me.share}
      </ActionButton>
      <p role="status" className="h-5 text-sm text-secondary">
        {copied ? strings.me.copied : ''}
      </p>
    </div>
  )
}

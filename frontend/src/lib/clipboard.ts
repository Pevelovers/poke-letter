/**
 * 텍스트를 클립보드에 복사한다. 성공하면 true.
 *
 * Clipboard API는 안전한 주소(HTTPS, localhost)에서만 있고, 권한이나 포커스 문제로 거절될 수 있다.
 * 그럴 때는 예전 방식(execCommand)으로 한 번 더 시도한다.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // 아래 예전 방식으로 넘어간다
  }
  return copyWithTextarea(text)
}

function copyWithTextarea(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    return typeof document.execCommand === 'function' && document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

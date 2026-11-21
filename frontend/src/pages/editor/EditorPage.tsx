/** 에디터 정적 페이지. public/editor/index.html에 있다 */
export const EDITOR_SRC = '/editor/index.html'

/**
 * 트리 장식 에디터 (#46). 디자인을 맞출 때 쓰는 도구라 앱 화면과 별개인
 * 정적 HTML로 두고, 앱의 `/editor` 경로에서 화면 전체 iframe으로 띄운다.
 */
export function EditorPage() {
  return (
    <iframe
      src={EDITOR_SRC}
      title="트리 장식 에디터"
      className="fixed inset-0 h-svh w-full border-0"
    />
  )
}

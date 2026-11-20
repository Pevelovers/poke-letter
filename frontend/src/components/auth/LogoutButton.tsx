import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { logout } from '@/api/queries'
import { Button } from '@/components/ui/button'
import { strings } from '@/config/strings'

/** 로그아웃하고 랜딩으로 돌아간다. 실패해도 화면의 로그인 정보는 지운다 */
export function LogoutButton() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear()
      void navigate({ to: '/' })
    },
  })

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      <LogOut aria-hidden />
      {strings.me.logout}
    </Button>
  )
}

import type { UserInfo } from '../../../../../types/models'

interface DealUserSectionProps {
  user: UserInfo
}

export function DealUserSection({ user }: DealUserSectionProps) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900 mb-3">사용자 정보</h3>
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-600">이름</span>
          <span className="font-medium text-slate-900">{user.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">이메일</span>
          <span className="font-medium text-slate-900">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">연락처</span>
          <span className="font-medium text-slate-900">{user.phone}</span>
        </div>
      </div>
    </section>
  )
}

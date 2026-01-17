// 우주 배경 + 별 효과
export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 bg-[#0a0a1a] overflow-hidden -z-10">
      {/* 별 레이어 1 (작고 밝은 별) */}
      <div className="stars-layer-1 absolute inset-0"></div>

      {/* 별 레이어 2 (중간 별) */}
      <div className="stars-layer-2 absolute inset-0"></div>

      {/* 별 레이어 3 (큰 별) */}
      <div className="stars-layer-3 absolute inset-0"></div>
    </div>
  )
}

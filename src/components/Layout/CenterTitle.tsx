// 중앙 글로우 타이틀
export default function CenterTitle() {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
      <h1
        className="text-4xl font-bold text-white tracking-wide"
        style={{
          textShadow: `
            0 0 20px rgba(255, 255, 255, 0.6),
            0 0 40px rgba(255, 255, 255, 0.4),
            0 0 60px rgba(255, 255, 255, 0.2)
          `
        }}
      >
        내 손 안의 작은 물류 허브
      </h1>
      <p
        className="text-xl text-white/80 mt-2"
        style={{
          textShadow: `
            0 0 15px rgba(255, 255, 255, 0.4),
            0 0 30px rgba(255, 255, 255, 0.2)
          `
        }}
      >
        일상 물류의 시작
      </p>
    </div>
  )
}

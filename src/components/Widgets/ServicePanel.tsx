// 서비스 선택 패널
export default function ServicePanel() {
  return (
    <div className="absolute right-6 top-36 z-20 w-72">
      {/* 타이틀 */}
      <h2 className="text-white text-sm font-semibold tracking-wide">
        서비스
      </h2>

      {/* 구분선 */}
      <div className="w-full h-px bg-white/50 mt-2 mb-3"></div>

      {/* 컨텐츠 (투명한 배경) */}
      <div className="bg-[rgba(64,73,91,0.2)] backdrop-blur-md rounded-lg p-4 space-y-4">
        {/* 보관하기 버튼 */}
        <button
          className="w-full p-5 rounded-xl text-center transition-all duration-300
                     bg-[rgba(0,100,255,0.2)] border border-cyan-400/50
                     hover:bg-[rgba(0,150,255,0.3)] hover:border-cyan-400"
          style={{
            boxShadow: '0 0 0px rgba(0, 191, 255, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 191, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0px rgba(0, 191, 255, 0.4)'
          }}
        >
          <div className="text-4xl mb-2">📦</div>
          <div className="text-xl font-bold text-white">보관하기</div>
          <div className="text-sm text-cyan-400 mt-1">비어있는 공간을 구매하세요</div>
        </button>

        {/* 운송하기 버튼 */}
        <button
          className="w-full p-5 rounded-xl text-center transition-all duration-300
                     bg-[rgba(0,200,100,0.2)] border border-emerald-400/50
                     hover:bg-[rgba(0,255,136,0.3)] hover:border-emerald-400"
          style={{
            boxShadow: '0 0 0px rgba(0, 255, 136, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0px rgba(0, 255, 136, 0.4)'
          }}
        >
          <div className="text-4xl mb-2">🚛</div>
          <div className="text-xl font-bold text-white">운송하기</div>
          <div className="text-sm text-emerald-400 mt-1">비어있는 경로를 구매하세요</div>
        </button>
      </div>

      {/* 슬로건 */}
      <div className="mt-4">
        <div className="w-full h-px bg-white/30 mb-3"></div>
        <div className="text-center">
          <p className="text-white font-semibold">"진정한 공유 경제의 실현"</p>
          <p className="text-white/60 text-sm mt-1">
            구매자가 늘어날수록
            <br />
            가격은 떨어진다
          </p>
        </div>
      </div>
    </div>
  )
}

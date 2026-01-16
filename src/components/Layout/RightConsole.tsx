// 우측 콘솔 - 서비스 선택
export default function RightConsole() {
  return (
    <aside className="w-80 bg-slate-900/85 backdrop-blur-xl border-l border-slate-700/50 flex flex-col p-5">
      {/* 타이틀 */}
      <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-6">
        <span>📍</span> 서비스 선택
      </h2>

      {/* 서비스 버튼 */}
      <div className="space-y-4 flex-1">
        {/* 보관하기 */}
        <button
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600
                 hover:from-blue-400 hover:to-blue-500
                 text-white rounded-2xl p-6 text-center
                 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30
                 transition-all duration-300 hover:scale-[1.02]
                 border border-blue-400/30"
        >
          <div className="text-4xl mb-3">📦</div>
          <div className="text-xl font-bold mb-1">보관하기</div>
          <div className="text-sm text-blue-100">공간이 상품이 되다</div>
        </button>

        {/* 운송하기 */}
        <button
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600
                 hover:from-emerald-400 hover:to-emerald-500
                 text-white rounded-2xl p-6 text-center
                 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30
                 transition-all duration-300 hover:scale-[1.02]
                 border border-emerald-400/30"
        >
          <div className="text-4xl mb-3">🚛</div>
          <div className="text-xl font-bold mb-1">운송하기</div>
          <div className="text-sm text-emerald-100">경로가 상품이 되다</div>
        </button>
      </div>

      {/* 구분선 */}
      <div className="border-t border-slate-700/50 my-6"></div>

      {/* 슬로건 */}
      <div className="text-center">
        <p className="text-white font-semibold mb-2">"진정한 공유 경제의 실현"</p>
        <p className="text-sm text-slate-400 leading-relaxed">
          구매자가 늘어날수록
          <br />
          가격은 떨어진다
        </p>
      </div>
    </aside>
  )
}

// 환산 결과 컴포넌트
import { useState } from 'react'
import type { DemandResult } from '../../../../engine'
import { cubesToCBM, palletsToCBM, cbmToTruckCount, STORAGE_AREA_CONSTANTS } from '../../../../engine'
import { PalletIcon3D, CubeIcon3D, WarehouseIcon, TruckIcon } from '../../../visualizations'

interface ConversionResultProps {
  result: DemandResult
  mode: 'STORAGE' | 'ROUTE'
  isAreaInput?: boolean
  onSelectConfirm: () => void
  isButtonDisabled: boolean
}

export default function ConversionResult({
  result,
  mode,
  isAreaInput = false,
  onSelectConfirm,
  isButtonDisabled,
}: ConversionResultProps) {
  const [showModuleDetails, setShowModuleDetails] = useState(false)
  const [conversionConfirmed, setConversionConfirmed] = useState(false)

  const hasModuleDetails = !isAreaInput && result.moduleSummary && result.moduleSummary.length > 0

  return (
    <>
      {/* 환산 결과 창 (하이라이트) */}
      <div
        className="p-3"
        style={{
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-cyber-cyan">
            환산 결과
          </span>
          {hasModuleDetails && (
            <button
              onClick={() => setShowModuleDetails(!showModuleDetails)}
              className="text-xs text-cyber-text-dim hover:text-cyber-cyan font-medium"
            >
              상세
            </button>
          )}
        </div>

        {/* 상세 정보 (상세 버튼 클릭 시 펼침) */}
        {showModuleDetails && result.moduleSummary && result.moduleSummary.length > 0 && (
          <div
            className="mb-3 space-y-2 pb-3"
            style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.2)' }}
          >
            {result.moduleSummary.map((summary, idx) => {
              const pallets = mode === 'STORAGE' ? Math.ceil(summary.estimatedCubes / 128) : null
              const cubes = summary.estimatedCubes

              return (
                <div
                  key={idx}
                  className="p-2"
                  style={{
                    background: 'rgba(22, 22, 32, 0.8)',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                  }}
                >
                  <div className="text-xs text-white">
                    {mode === 'STORAGE' ? (
                      <span>
                        <span className="font-bold">{summary.module} 모듈</span>, 높이 {summary.heightMax}mm, {summary.boxCount}개 박스 = 총 <span className="font-bold text-cyber-cyan">{pallets} 파렛트</span>
                      </span>
                    ) : (
                      <span>
                        <span className="font-bold">{summary.module} 모듈</span>, 높이 {summary.heightMax}mm, {summary.boxCount}개 박스 = 총 <span className="font-bold text-cyber-cyan">{cubes} 큐브</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div
          className="p-2.5"
          style={{
            background: 'rgba(22, 22, 32, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
          }}
        >
          <div className="text-base font-bold text-white">
            {mode === 'STORAGE'
              ? isAreaInput ? `수용 가능: ${result.demandPallets} 파렛트` : `총 ${result.demandPallets} 파렛트`
              : `총 ${result.demandCubes} 큐브`}
          </div>
          <div className="text-xs text-white/60 mt-0.5">
            {mode === 'STORAGE'
              ? `${palletsToCBM(result.demandPallets || 0)} CBM (구매 공간 기준 체적)`
              : `${cubesToCBM(result.demandCubes)} CBM (구매 공간 기준 체적)`}
          </div>
          {isAreaInput && mode === 'STORAGE' && (
            <div className="text-[10px] text-white/60 mt-1">
              운영 동선 고려(÷{STORAGE_AREA_CONSTANTS.storageAreaFactor.toFixed(2)})
            </div>
          )}
        </div>
      </div>

      {/* 안내사항 */}
      <div
        className="p-4 space-y-4"
        style={{
          border: '1px solid rgba(0, 240, 255, 0.2)',
          background: 'rgba(22, 22, 32, 0.5)',
        }}
      >
        <div
          className="text-sm font-bold text-white pb-2"
          style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.2)' }}
        >
          📋 안내사항
        </div>

        {/* 수평 흐름: 파렛트/큐브 → 화살표 → 창고/트럭 */}
        <div className="flex items-end justify-center gap-6">
          {/* 파렛트/큐브 */}
          <div className="flex flex-col items-center" style={{ width: '150px' }}>
            <div className="text-xs font-semibold text-white/70 mb-2">
              {mode === 'STORAGE' ? '<기준 파렛트>' : '<기준 큐브>'}
            </div>
            {mode === 'STORAGE' ? (
              <PalletIcon3D showDimensions={true} size={150} count={result.demandPallets} />
            ) : (
              <CubeIcon3D showDimensions={true} size={150} count={result.demandCubes} />
            )}
          </div>

          {/* 화살표 */}
          <div className="text-3xl text-cyber-cyan pb-2">
            →
          </div>

          {/* 창고/트럭 */}
          <div className="flex flex-col items-center" style={{ width: '150px' }}>
            {mode === 'STORAGE' ? (
              <WarehouseIcon
                pallets={result.demandPallets || 0}
                size={150}
                showLabel={true}
              />
            ) : (
              <TruckIcon
                count={cbmToTruckCount(cubesToCBM(result.demandCubes))}
                size={150}
                showLabel={true}
              />
            )}
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="text-[10px] text-white/60 text-center leading-relaxed">
          구매자의 이해를 돕기 위한 정보이며, 현장 적재 상황에 따라 사용 형태는 달라질 수 있습니다.
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: '1px solid rgba(0, 240, 255, 0.2)' }}></div>

        {/* 체크박스 확인 */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id={`conversion-confirmed-${isAreaInput ? 'area' : 'box'}`}
            checked={conversionConfirmed}
            onChange={(e) => setConversionConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-cyber-cyan"
          />
          <label
            htmlFor={`conversion-confirmed-${isAreaInput ? 'area' : 'box'}`}
            className="text-xs text-white cursor-pointer select-none"
          >
            환산 결과를 확인했습니다
          </label>
        </div>

        {/* 선택 버튼 (체크 후 활성화) */}
        {conversionConfirmed && (
          <button
            onClick={onSelectConfirm}
            disabled={isButtonDisabled}
            className="w-full py-2 text-sm font-bold transition-colors"
            style={{
              background: isButtonDisabled
                ? 'rgba(100, 100, 100, 0.5)'
                : 'linear-gradient(135deg, #00F0FF 0%, #00B8C4 100%)',
              color: isButtonDisabled ? '#666' : '#0A0A0F',
              border: 'none',
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {mode === 'STORAGE'
              ? `${result.demandPallets} 파렛트를 선택하시겠습니까?`
              : `${result.demandCubes} 큐브로 운송을 요청하시겠습니까?`}
          </button>
        )}
      </div>
    </>
  )
}

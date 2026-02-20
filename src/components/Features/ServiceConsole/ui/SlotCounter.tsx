// 슬롯 애니메이션 카운터 - 숫자 감소 시 수직 낙하 효과
import { useState, useEffect, useRef } from 'react'

interface SlotCounterProps {
  value: number
  className?: string
}

// 개별 숫자 슬롯
function NumberSlot({ digit, isAnimating }: { digit: string; isAnimating: boolean }) {
  return (
    <span className="relative inline-block overflow-hidden h-[1.2em] w-[0.7em]">
      <span
        className={`
          inline-block transition-transform duration-300 ease-out
          ${isAnimating ? 'animate-slot-drop' : ''}
        `}
      >
        {digit}
      </span>
    </span>
  )
}

export default function SlotCounter({ value, className = '' }: SlotCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValueRef = useRef(value)

  useEffect(() => {
    // 값이 감소했을 때만 애니메이션 적용
    if (value < prevValueRef.current) {
      setIsAnimating(true)

      // 애니메이션 중간에 값 변경
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 150)

      // 애니메이션 완료 후 상태 리셋
      const resetTimer = setTimeout(() => {
        setIsAnimating(false)
      }, 300)

      prevValueRef.current = value
      return () => {
        clearTimeout(timer)
        clearTimeout(resetTimer)
      }
    } else {
      // 증가 또는 동일한 경우 즉시 업데이트
      setDisplayValue(value)
      prevValueRef.current = value
    }
  }, [value])

  const digits = String(displayValue).split('')

  return (
    <span className={`inline-flex font-mono tabular-nums ${className}`}>
      {digits.map((digit, index) => (
        <NumberSlot key={`${index}-${digit}`} digit={digit} isAnimating={isAnimating} />
      ))}
    </span>
  )
}

// 집계 일시
import { useEffect, useState } from 'react'

export default function Timestamp() {
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    const now = new Date()
    const formatted = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    setTimestamp(formatted.replace(/\. /g, '.').replace(/:/g, ':'))
  }, [])

  return (
    <div className="text-right text-sm text-gray-500 mb-4">
      <span>📅 {timestamp}</span>
    </div>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import { AIProcessingStatus } from '@/types'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 60000

interface UsePollResult {
  status: AIProcessingStatus | null
  isPolling: boolean
  timedOut: boolean
  startPolling: (documentId: string) => void
  stopPolling: () => void
}

export function usePollForCompletion(): UsePollResult {
  const { connectors } = useConnectorContext()
  const [status, setStatus] = useState<AIProcessingStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const docIdRef = useRef<string | null>(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    intervalRef.current = null
    timeoutRef.current = null
    setIsPolling(false)
  }, [])

  const startPolling = useCallback((documentId: string) => {
    stopPolling()
    docIdRef.current = documentId
    setStatus(AIProcessingStatus.Processing)
    setTimedOut(false)
    setIsPolling(true)

    const poll = async () => {
      try {
        const record = await connectors.dataverse.retrieveRecord(
          'va_documents',
          documentId,
          '?$select=va_aiprocessingstatus',
        )
        const currentStatus = record.va_aiprocessingstatus as AIProcessingStatus
        setStatus(currentStatus)

        if (currentStatus === AIProcessingStatus.Completed || currentStatus === AIProcessingStatus.Failed) {
          stopPolling()
        }
      } catch {
        // Polling failure — will retry on next interval
      }
    }

    intervalRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS)
    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setTimedOut(true)
    }, POLL_TIMEOUT_MS)

    void poll()
  }, [connectors, stopPolling])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  return { status, isPolling, timedOut, startPolling, stopPolling }
}

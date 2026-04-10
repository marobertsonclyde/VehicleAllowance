import { useState, useEffect, useCallback } from 'react'
import { useConnectorContext } from '@microsoft/power-apps'
import type {
  AllowanceLevelConfig,
  ReminderConfig,
  CompanyEntity,
  AllowanceApplication,
  AllowanceRecord,
  AuditLog,
} from '@/types'

interface AdminData {
  levels: AllowanceLevelConfig[]
  reminders: ReminderConfig[]
  companies: CompanyEntity[]
  applications: AllowanceApplication[]
  allowanceRecords: AllowanceRecord[]
  auditLogs: AuditLog[]
}

interface UseAdminDataResult extends AdminData {
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  saveLevel: (level: AllowanceLevelConfig) => Promise<void>
  saveReminder: (reminder: ReminderConfig) => Promise<void>
  saveCompany: (company: CompanyEntity) => Promise<void>
}

export function useAdminData(): UseAdminDataResult {
  const { connectors } = useConnectorContext()
  const [data, setData] = useState<AdminData>({
    levels: [],
    reminders: [],
    companies: [],
    applications: [],
    allowanceRecords: [],
    auditLogs: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [levelsRes, remindersRes, companiesRes, appsRes, recordsRes, auditRes] = await Promise.all([
        connectors.dataverse.retrieveMultipleRecords('va_allowancelevelconfigs', '?$orderby=va_minimummsrp asc'),
        connectors.dataverse.retrieveMultipleRecords('va_reminderconfigs', '?$filter=va_isactive eq true'),
        connectors.dataverse.retrieveMultipleRecords('va_companyentities', '?$orderby=va_name asc'),
        connectors.dataverse.retrieveMultipleRecords('va_allowanceapplications', '?$orderby=createdon desc&$top=100'),
        connectors.dataverse.retrieveMultipleRecords('va_allowancerecords', '?$orderby=createdon desc'),
        connectors.dataverse.retrieveMultipleRecords('va_auditlogs', '?$orderby=va_eventdate desc&$top=200'),
      ])

      setData({
        levels: (levelsRes.entities as AllowanceLevelConfig[]) ?? [],
        reminders: (remindersRes.entities as ReminderConfig[]) ?? [],
        companies: (companiesRes.entities as CompanyEntity[]) ?? [],
        applications: (appsRes.entities as AllowanceApplication[]) ?? [],
        allowanceRecords: (recordsRes.entities as AllowanceRecord[]) ?? [],
        auditLogs: (auditRes.entities as AuditLog[]) ?? [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }, [connectors])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const saveLevel = useCallback(async (level: AllowanceLevelConfig) => {
    if (level.va_allowancelevelconfigid) {
      await connectors.dataverse.updateRecord(
        'va_allowancelevelconfigs',
        level.va_allowancelevelconfigid,
        level as Record<string, unknown>,
      )
    } else {
      await connectors.dataverse.createRecord('va_allowancelevelconfigs', level as Record<string, unknown>)
    }
    await fetchAll()
  }, [connectors, fetchAll])

  const saveReminder = useCallback(async (reminder: ReminderConfig) => {
    if (reminder.va_reminderconfigid) {
      await connectors.dataverse.updateRecord(
        'va_reminderconfigs',
        reminder.va_reminderconfigid,
        reminder as Record<string, unknown>,
      )
    } else {
      await connectors.dataverse.createRecord('va_reminderconfigs', reminder as Record<string, unknown>)
    }
    await fetchAll()
  }, [connectors, fetchAll])

  const saveCompany = useCallback(async (company: CompanyEntity) => {
    if (company.va_companyentityid) {
      await connectors.dataverse.updateRecord(
        'va_companyentities',
        company.va_companyentityid,
        company as Record<string, unknown>,
      )
    } else {
      await connectors.dataverse.createRecord('va_companyentities', company as Record<string, unknown>)
    }
    await fetchAll()
  }, [connectors, fetchAll])

  return { ...data, loading, error, refetch: fetchAll, saveLevel, saveReminder, saveCompany }
}

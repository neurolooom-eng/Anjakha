import { getSheetsApiUrl, getSpreadsheetId } from './config'

export class SheetsClientError extends Error {}

async function request<T>(params: Record<string, string>, body?: unknown): Promise<T> {
  const apiUrl = getSheetsApiUrl()
  if (!apiUrl) throw new SheetsClientError('Sheets API URL is not configured')

  const url = new URL(apiUrl)
  const spreadsheetId = getSpreadsheetId()
  if (spreadsheetId) url.searchParams.set('spreadsheetId', spreadsheetId)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

  const res = await fetch(url.toString(), {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) throw new SheetsClientError(`Sheets API request failed: ${res.status}`)
  const json = await res.json()
  if (json?.ok === false) throw new SheetsClientError(json?.error ?? 'Sheets API returned an error')
  return json as T
}

export async function fetchTab<T>(tab: string): Promise<T[]> {
  const json = await request<{ rows: T[] }>({ action: 'list', tab })
  return json.rows ?? []
}

export async function insertRow<T>(tab: string, row: T): Promise<T> {
  const json = await request<{ row: T }>({ action: 'insert', tab }, row)
  return json.row
}

export async function updateRow<T extends { id: string }>(tab: string, row: T): Promise<T> {
  const json = await request<{ row: T }>({ action: 'update', tab, id: row.id }, row)
  return json.row
}

export async function testConnection(tab: string): Promise<{ ok: boolean; message: string }> {
  try {
    await fetchTab(tab)
    return { ok: true, message: `Connected — tab "${tab}" is reachable.` }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unknown error' }
  }
}

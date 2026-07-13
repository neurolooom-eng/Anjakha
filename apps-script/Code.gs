/**
 * Anjakha HMS — Google Apps Script Web App backend.
 *
 * Exposes each sheet tab as a small JSON API: list / insert / update rows by
 * "id" column. Deploy as a Web App (Execute as: Me, Access: Anyone with the
 * link), then paste the deployment's /exec URL into the app's Developer
 * Config page (or VITE_SHEETS_API_URL at build time).
 *
 * No auth is enforced here — anyone with the URL can read/write. Fine for an
 * internal pilot; add a shared-secret check (e.g. a `key` query param
 * compared against a Script Property) before wider rollout.
 */

function doGet(e) {
  return handle_(e)
}

function doPost(e) {
  return handle_(e)
}

function handle_(e) {
  try {
    var params = e.parameter
    var action = params.action
    var tab = params.tab
    if (!tab) return json_({ ok: false, error: 'Missing tab parameter' })

    var ss = params.spreadsheetId
      ? SpreadsheetApp.openById(params.spreadsheetId)
      : SpreadsheetApp.getActiveSpreadsheet()
    var sheet = ss.getSheetByName(tab)
    if (!sheet) return json_({ ok: false, error: 'Unknown tab: ' + tab })

    if (action === 'list') return json_({ ok: true, rows: readAll_(sheet) })
    if (action === 'insert') return json_({ ok: true, row: insertRow_(sheet, parseBody_(e)) })
    if (action === 'update') return json_({ ok: true, row: updateRow_(sheet, params.id, parseBody_(e)) })

    return json_({ ok: false, error: 'Unknown action: ' + action })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function parseBody_(e) {
  if (!e.postData || !e.postData.contents) return {}
  return JSON.parse(e.postData.contents)
}

function readAll_(sheet) {
  var values = sheet.getDataRange().getValues()
  if (values.length < 2) return []
  var headers = values[0]
  var rows = []
  for (var r = 1; r < values.length; r++) {
    var row = {}
    for (var c = 0; c < headers.length; c++) {
      row[headers[c]] = coerce_(values[r][c])
    }
    rows.push(row)
  }
  return rows
}

function coerce_(value) {
  if (value instanceof Date) return value.toISOString()
  return value
}

function insertRow_(sheet, record) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  if (!record.id) record.id = Utilities.getUuid()
  var row = headers.map(function (h) {
    var v = record[h]
    return v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : v
  })
  sheet.appendRow(row)
  return record
}

function updateRow_(sheet, id, record) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  var idCol = headers.indexOf('id')
  var values = sheet.getDataRange().getValues()
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === String(id)) {
      var row = headers.map(function (h) {
        var v = record[h]
        return v === undefined || v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : v
      })
      sheet.getRange(r + 1, 1, 1, row.length).setValues([row])
      return record
    }
  }
  throw new Error('Row not found for id: ' + id)
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

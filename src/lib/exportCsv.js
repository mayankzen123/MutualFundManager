function escapeCsvValue(val) {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCsv(filename, headers, rows) {
  const headerLine = headers.map(h => escapeCsvValue(h.label)).join(',')
  const dataLines = rows.map(row =>
    headers.map(h => escapeCsvValue(typeof h.accessor === 'function' ? h.accessor(row) : row[h.key])).join(',')
  )
  const csv = [headerLine, ...dataLines].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

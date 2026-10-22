// Datas chegam do backend como 'YYYY-MM-DD' (dateStrings: true).
export function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Comparação lexicográfica funciona para ISO 'YYYY-MM-DD'.
export function isOverdue(task) {
  return !task.completed && !!task.due_date && task.due_date.slice(0, 10) < todayISO();
}

export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

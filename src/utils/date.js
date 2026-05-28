function formatLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso() {
  return formatLocalIsoDate(new Date());
}

export function addDays(isoDate, amount) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return formatLocalIsoDate(date);
}

export function isOverdue(borrowing) {
  return borrowing.status === 'borrowing' && borrowing.dueDate && borrowing.dueDate < todayIso();
}

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(isoDate, amount) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function isOverdue(borrowing) {
  return borrowing.status === 'borrowing' && borrowing.dueDate && borrowing.dueDate < todayIso();
}

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

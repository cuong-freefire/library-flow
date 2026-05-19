import { statusBadge, statusLabels } from '../utils/library';

export function StatusBadge({ status }) {
  return <span className={`badge ${statusBadge[status] || 'text-bg-secondary'}`}>{statusLabels[status] || status}</span>;
}

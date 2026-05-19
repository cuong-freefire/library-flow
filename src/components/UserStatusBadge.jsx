const userStatusLabels = {
  active: 'Đang hoạt động',
  locked: 'Đã khóa',
};

const userStatusClasses = {
  active: 'text-bg-success',
  locked: 'text-bg-danger',
};

export function UserStatusBadge({ status }) {
  return (
    <span className={`badge ${userStatusClasses[status] || 'text-bg-secondary'}`}>
      {userStatusLabels[status] || status || 'Không rõ'}
    </span>
  );
}

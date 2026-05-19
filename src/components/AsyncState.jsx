export function LoadingState({ message = 'Đang tải dữ liệu...' }) {
  return (
    <div className="surface p-4 text-center text-muted-2">
      <div className="spinner-border spinner-border-sm me-2" role="status" />
      {message}
    </div>
  );
}

export function ErrorState({ message }) {
  return <div className="alert alert-danger mb-0">{message}</div>;
}

export function EmptyState({ title, description }) {
  return (
    <div className="surface p-4 text-center">
      <h2 className="h5 mb-2">{title}</h2>
      <p className="text-muted-2 mb-0">{description}</p>
    </div>
  );
}

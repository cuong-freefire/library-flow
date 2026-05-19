export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-lg-end justify-content-between gap-3 mb-4">
      <div>
        {eyebrow && <div className="text-uppercase small fw-bold text-muted-2 mb-1">{eyebrow}</div>}
        <h1 className="h3 fw-bold mb-1">{title}</h1>
        {description && <p className="text-muted-2 mb-0">{description}</p>}
      </div>
      {action}
    </div>
  );
}

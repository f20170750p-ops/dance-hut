import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

interface EmptyTabProps {
  icon: ReactNode;
  title: string;
  message: string;
  action: string;
  onAction: () => void;
}

export function EmptyTab({ icon, title, message, action, onAction }: EmptyTabProps) {
  return (
    <div className="tab-empty">
      <span className="tab-empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{message}</p>
      <button className="primary-btn" onClick={onAction}>
        {action} <ArrowRight size={16} />
      </button>
    </div>
  );
}

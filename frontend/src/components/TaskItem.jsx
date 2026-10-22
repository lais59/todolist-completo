import { isOverdue, formatDate } from '../utils.js';

const Check = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  const done = !!task.completed;

  return (
    <li className="task">
      <label className="task__check">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(task)}
          aria-label={`Marcar "${task.title}" como ${done ? 'pendente' : 'concluída'}`}
        />
        <span className="task__box">
          <Check />
        </span>
      </label>

      <div className="task__body">
        <span
          className={[
            'task__title',
            done ? 'task__title--done' : '',
            overdue ? 'task__title--overdue' : '',
          ].join(' ')}
        >
          {task.title}
        </span>
        <div className="task__meta">
          {task.due_date && <span className="task__date">{formatDate(task.due_date)}</span>}
          {overdue && <span className="badge-overdue">Em atraso</span>}
        </div>
      </div>

      <div className="task__actions">
        <button type="button" className="icon-btn" onClick={() => onEdit(task)} aria-label="Editar tarefa" title="Editar">
          <PencilIcon />
        </button>
        <button type="button" className="icon-btn icon-btn--danger" onClick={() => onDelete(task)} aria-label="Excluir tarefa" title="Excluir">
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

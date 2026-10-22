import { useEffect, useRef, useState } from 'react';

// task = null → "Create Task"; task = objeto → "Edit Task"
export default function TaskModal({ task, onClose, onSubmit }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('O nome da tarefa é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), dueDate: dueDate || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Task' : 'Create Task'}>
        <h2 className="modal__title">{isEdit ? 'Edit Task' : 'Create Task'}</h2>

        <label className="field">
          <span className="field__label">Nome da tarefa</span>
          <input
            ref={inputRef}
            className="field__input"
            type="text"
            placeholder="Digite a tarefa..."
            maxLength={255}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
          />
        </label>

        <label className="field">
          <span className="field__label">Data limite (opcional)</span>
          <input
            className="field__input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { useDebounce } from './hooks/useDebounce.js';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignora */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [totals, setTotals] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // modal: null (fechado) | { task: null } (criar) | { task } (editar)
  const [modal, setModal] = useState(null);

  // Debounce: a requisição só dispara após o usuário parar de digitar.
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignora */
    }
  }, [theme]);

  const load = useCallback(
    async (signal) => {
      try {
        const data = await api.listTasks({ search: debouncedSearch.trim(), status }, signal);
        setTasks(data.tasks);
        setTotals({ total: data.total, completed: data.completed });
        setError('');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('Não foi possível carregar as tarefas. Verifique se o backend está rodando.');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [debouncedSearch, status]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function handleSubmit({ title, dueDate }) {
    if (modal?.task) {
      await api.updateTask(modal.task.id, { title, dueDate });
    } else {
      await api.createTask({ title, dueDate });
    }
    setModal(null);
    await load();
  }

  async function handleToggle(task) {
    // Atualização otimista; o reload em seguida sincroniza os contadores.
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    try {
      await api.updateTask(task.id, { completed: !task.completed });
    } catch (err) {
      setError(err.message);
    }
    await load();
  }

  async function handleDelete(task) {
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return;
    try {
      await api.deleteTask(task.id);
    } catch (err) {
      setError(err.message);
    }
    await load();
  }

  const isFiltering = debouncedSearch.trim() !== '' || status !== 'all';

  return (
    <div className="page">
      <main className="card">
        <h1 className="title">TODO LIST</h1>

        <div className="toolbar">
          <label className="search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar tarefa"
            />
          </label>

          <div className="select">
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status">
              <option value="all">ALL</option>
              <option value="pending">PENDING</option>
              <option value="completed">COMPLETED</option>
            </select>
            <span className="select__sep" />
            <ChevronIcon />
          </div>

          <button
            type="button"
            className="theme-btn"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            aria-label="Alternar tema"
            title="Alternar tema"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>

        <p className="counters" aria-live="polite">
          <span>Total: <strong>{totals.total}</strong></span>
          <span>Concluídas: <strong>{totals.completed}</strong></span>
        </p>

        {error && <p className="banner-error" role="alert">{error}</p>}

        {loading ? (
          <p className="empty">Carregando...</p>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <svg viewBox="0 0 64 64" width="72" height="72" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="12" y="8" width="40" height="48" rx="6" />
              <path d="M22 22h20M22 32h20M22 42h10" />
            </svg>
            <p>{isFiltering ? 'No tasks found.' : 'You have no pending tasks.'}</p>
          </div>
        ) : (
          <ul className="list">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => setModal({ task: t })}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}

        <button type="button" className="fab" onClick={() => setModal({ task: null })} aria-label="Criar tarefa" title="Nova tarefa">
          <PlusIcon />
        </button>
      </main>

      {modal && (
        <TaskModal
          key={modal.task?.id ?? 'new'}
          task={modal.task}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

async function request(path, options = {}) {
  const { body, headers, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    // Só envia Content-Type quando há corpo: o Fastify rejeita
    // "application/json" com corpo vazio (ex.: DELETE).
    headers: body !== undefined ? { 'Content-Type': 'application/json', ...headers } : headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = 'Erro ao comunicar com o servidor.';
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(message);
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  listTasks: ({ search = '', status = 'all' } = {}, signal) => {
    const qs = new URLSearchParams({ search, status });
    return request(`/api/tasks?${qs}`, { signal });
  },
  createTask: ({ title, dueDate }) =>
    request('/api/tasks', { method: 'POST', body: { title, dueDate: dueDate || null } }),
  updateTask: (id, data) => request(`/api/tasks/${id}`, { method: 'PATCH', body: data }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};

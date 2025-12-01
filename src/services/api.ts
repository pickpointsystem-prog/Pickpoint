export const ApiService = {
  async post(path: string, body: any) {
    const res = await fetch(`/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
  async get(path: string) {
    const res = await fetch(`/api/${path}`, { method: 'GET' });
    return res.json();
  },
};

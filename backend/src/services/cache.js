/**
 * Cache leve em memória, com TTL por entrada.
 * Suficiente para um dashboard interno de instância única — evita
 * martelar a API do Zammad a cada refresh do frontend.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  /**
   * Devolve o valor em cache, ou executa `fn`, guarda o resultado e devolve-o.
   * Deduplica pedidos concorrentes para a mesma chave.
   */
  async wrap(key, ttlMs, fn) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const pendingKey = `__pending__${key}`;
    const pending = this.store.get(pendingKey);
    if (pending) return pending.value;

    const promise = (async () => {
      try {
        const value = await fn();
        this.set(key, value, ttlMs);
        return value;
      } finally {
        this.store.delete(pendingKey);
      }
    })();

    this.store.set(pendingKey, { value: promise, expiresAt: Date.now() + ttlMs });
    return promise;
  }
}

module.exports = new MemoryCache();

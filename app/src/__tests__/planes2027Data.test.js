import { describe, it, expect, vi } from 'vitest';
import { fetchPlanesCatalog } from '../data/planes2027Data';

describe('Catálogo curricular sin estadísticas de descargas', () => {
  it('consulta y devuelve el catálogo sin leer ni escribir contadores locales', async () => {
    const catalog = [{ id: 'DDC-2027-001', asignatura: 'Matemática' }];
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => catalog });
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    expect(await fetchPlanesCatalog()).toEqual(catalog);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain('/data/ddc-planeamientos.json?_t=');
    expect(options.cache).toBe('no-cache');
    expect(options.headers['Pragma']).toBe('no-cache');
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    getItem.mockRestore();
    setItem.mockRestore();
  });

  it('informa un fallo HTTP', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchPlanesCatalog()).rejects.toThrow('Código HTTP: 404');
  });

  it('rechaza un catálogo que no sea una lista', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    await expect(fetchPlanesCatalog()).rejects.toThrow('no es una lista válida');
  });
});

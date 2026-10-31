/* Browser-local project storage. No credentials or network services required. */
window.ArtStore = {
  getItem(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
  setItem(key, value) { try { window.localStorage.setItem(key, value); return true; } catch { return false; } },
  read(key, fallback) { try { const v = JSON.parse(this.getItem(key)); return v === null ? fallback : v; } catch { return fallback; } },
  works() { const v = this.read('artjob_works', []); return Array.isArray(v) ? v.filter(w => w && typeof w.image === 'string' && w.image.startsWith('data:image/png;') && typeof w.id === 'string') : []; },
  addWork(work) {
    const works = this.works();
    const item = { ...work, id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random(), createdAt: new Date().toISOString() };
    if (!this.setItem('artjob_works', JSON.stringify([...works, item]))) throw new Error('Storage unavailable or full');
    const stored = this.read('artjob_badges', []);
    const badges = Array.isArray(stored) ? stored.filter(n=>Number.isInteger(n)&&n>=1&&n<=5) : [];
    this.setItem('artjob_badges', JSON.stringify([...new Set([...badges, work.job])]));
    return item;
  },
  download(image, name) { const a=document.createElement('a'); a.href=image; a.download=(name||'ART_JOB_CITY')+'.png'; a.click(); }
};

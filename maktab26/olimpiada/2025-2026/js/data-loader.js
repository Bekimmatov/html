// Data loader for modular GitHub Pages
async function loadOlimpiadaData() {
  if (window.OLIMPIADA_DATA && window.OLIMPIADA_DATA.records) {
    return window.OLIMPIADA_DATA;
  }
  try {
    const res = await fetch('data/olimpiada.json');
    if (!res.ok) throw new Error('Network error: ' + res.status);
    const json = await res.json();
    window.OLIMPIADA_DATA = json;
    return json;
  } catch (err) {
    console.error('Failed to load data/olimpiada.json', err);
    return null;
  }
}

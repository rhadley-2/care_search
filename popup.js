function doubleEncode(s) {
  return encodeURIComponent(encodeURIComponent(s));
}
function encodeJson(val) {
  return doubleEncode(JSON.stringify(val));
}
function buildLocaleFilter(locales = ['en_US']) {
  return encodeJson([
    { field: 'KB_LOCALE', filterType: 'IN', values: locales }
  ]);
}

// Defaults that match your “ideal” URL.
const DEFAULT_SETTINGS = {
  baseParams: {
    // filters = [{"field":"KB_LOCALE","filterType":"IN","values":["en_US"]}] (double-encoded)
    filters: buildLocaleFilter(['en_US'])
  },
  keepFilters: true,     // keep the locale filter by default
  keepSort: false,       // clear sort by default
  forceShareView: true,  // set shareView=1 by default
  theme: 'system'        // 'system' | 'light' | 'dark'
};

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (res) => {
      // Ensure baseParams exists
      if (!res.baseParams) res.baseParams = {};
      resolve(res);
    });
  });
}
function setSettings(partial) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(partial, resolve);
  });
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme || 'system');
}

function uiSetClean(on) {
  const sw = document.getElementById('cleanSwitch');
  sw.dataset.on = on ? 'true' : 'false';
  sw.setAttribute('aria-checked', on ? 'true' : 'false');
}

document.addEventListener('DOMContentLoaded', async () => {
  const { theme } = await getSettings();
  document.getElementById('themeSelect').value = theme || 'system';
  applyTheme(theme);

  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  const cleanSwitch = document.getElementById('cleanSwitch');
  cleanSwitch.addEventListener('click', () => {
    const on = cleanSwitch.dataset.on !== 'true';
    uiSetClean(on);
  });
  cleanSwitch.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const on = cleanSwitch.dataset.on !== 'true';
      uiSetClean(on);
    }
  });

  document.getElementById('openOptions').addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  });

  document.getElementById('themeSelect').addEventListener('change', async (e) => {
    const val = e.target.value;
    await setSettings({ theme: val });
    applyTheme(val);
  });
});

async function doSearch() {
  const input = document.getElementById('searchInput').value.trim();
  if (!input) return;

  const { baseParams, keepFilters, keepSort, forceShareView } = await getSettings();
  const clean = document.getElementById('cleanSwitch').dataset.on === 'true';

  // Start with user base params (typically contains filters for locale).
  const params = new URLSearchParams();
  Object.entries(baseParams || {}).forEach(([k, v]) => {
    if (k.toLowerCase() !== 'search') params.set(k, v);
  });

  // Required params
  params.set('search', encodeURIComponent(input));
  if (forceShareView) params.set('shareView', '1');

  // Filters
  if (clean || !keepFilters) {
    params.set('filters', encodeJson([]));
  } else if (!params.has('filters')) {
    // If user has no base filters, default to en_US
    params.set('filters', buildLocaleFilter(['en_US']));
  }

  // Sort
  if (clean || !keepSort) {
    params.set('sort', encodeJson([]));
  }

  const url = `https://netflixcare.sprinklr.com/care/knowledge-base?${params.toString()}`;
  chrome.tabs.create({ url });
}
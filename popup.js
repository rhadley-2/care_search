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

function uiSetCustomDefault(on) {
  const sw = document.getElementById('customDefaultSwitch');
  sw.dataset.on = on ? 'true' : 'false';
  sw.setAttribute('aria-checked', on ? 'true' : 'false');
}

async function hasCustomDefaults() {
  const { baseParams, keepFilters, keepSort } = await getSettings();
  
  // Check if baseParams has more than just the default en_US filter
  const defaultFilter = buildLocaleFilter(['en_US']);
  const hasOnlyDefaultFilter = Object.keys(baseParams || {}).length === 1 && 
                               baseParams.filters === defaultFilter;
  
  // Check if keepFilters/keepSort differ from defaults
  const hasCustomBehavior = keepFilters !== true || keepSort !== false;
  
  return !hasOnlyDefaultFilter || hasCustomBehavior;
}

document.addEventListener('DOMContentLoaded', async () => {
  const { theme } = await getSettings();
  document.getElementById('themeSelect').value = theme || 'system';
  applyTheme(theme);
  
  // Auto-enable custom default if user has custom settings
  const hasCustom = await hasCustomDefaults();
  if (hasCustom) {
    uiSetCustomDefault(true);
  }

  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  const cleanSwitch = document.getElementById('cleanSwitch');
  cleanSwitch.addEventListener('click', () => {
    const on = cleanSwitch.dataset.on !== 'true';
    uiSetClean(on);
    if (on) uiSetCustomDefault(false); // Turn off custom default when clean is on
  });
  cleanSwitch.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const on = cleanSwitch.dataset.on !== 'true';
      uiSetClean(on);
      if (on) uiSetCustomDefault(false); // Turn off custom default when clean is on
    }
  });

  const customDefaultSwitch = document.getElementById('customDefaultSwitch');
  customDefaultSwitch.addEventListener('click', () => {
    const on = customDefaultSwitch.dataset.on !== 'true';
    uiSetCustomDefault(on);
    if (on) uiSetClean(false); // Turn off clean when custom default is on
  });
  customDefaultSwitch.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const on = customDefaultSwitch.dataset.on !== 'true';
      uiSetCustomDefault(on);
      if (on) uiSetClean(false); // Turn off clean when custom default is on
    }
  });

  document.getElementById('openOptions').addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  });

  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://docs.google.com/document/d/1Pls8By5yiJAr1PxH5uU5FekcG32kXPjQJ6z5ianmYiY/edit?tab=t.0' });
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
  const customDefault = document.getElementById('customDefaultSwitch').dataset.on === 'true';

  // Start with user base params (typically contains filters for locale).
  const params = new URLSearchParams();
  Object.entries(baseParams || {}).forEach(([k, v]) => {
    if (k.toLowerCase() !== 'search') params.set(k, v);
  });

  // Required params
  params.set('search', encodeURIComponent(input));
  if (forceShareView) params.set('shareView', '1');

  // Filters
  if (clean) {
    params.set('filters', encodeJson([]));
  } else if (customDefault && keepFilters) {
    // Use custom filters from baseParams if available
    if (!params.has('filters')) {
      params.set('filters', buildLocaleFilter(['en_US']));
    }
  } else if (!keepFilters || !customDefault) {
    params.set('filters', encodeJson([]));
  } else if (!params.has('filters')) {
    // If user has no base filters, default to en_US
    params.set('filters', buildLocaleFilter(['en_US']));
  }

  // Sort
  if (clean) {
    params.set('sort', encodeJson([]));
  } else if (customDefault && keepSort) {
    // Keep sort from baseParams if available
    if (!params.has('sort')) {
      params.set('sort', encodeJson([]));
    }
  } else if (!keepSort || !customDefault) {
    params.set('sort', encodeJson([]));
  }

  const url = `https://netflixcare.sprinklr.com/care/knowledge-base?${params.toString()}`;
  chrome.tabs.create({ url });
}
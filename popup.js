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
  theme: 'system',       // 'system' | 'light' | 'dark'
  searchResultBehavior: 'currentTab'  // 'newTab' | 'currentTab' - changed for debugging
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
  // Don't set the select value - keep it showing "Theme"
  applyTheme(theme);
  
  
  // Don't auto-enable custom default - let user manually control toggles

  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  const cleanSwitch = document.getElementById('cleanSwitch');
  cleanSwitch.addEventListener('click', () => {
    const on = cleanSwitch.dataset.on !== 'true';
    console.log('Clean switch clicked:', { before: cleanSwitch.dataset.on, after: on });
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

  const { baseParams, keepFilters, keepSort, forceShareView, searchResultBehavior } = await getSettings();
  const clean = document.getElementById('cleanSwitch').dataset.on === 'true';
  const customDefault = document.getElementById('customDefaultSwitch').dataset.on === 'true';

  // Debug logging
  console.log('Search Debug:', {
    clean,
    customDefault,
    keepFilters,
    keepSort,
    baseParams
  });

  // Start with base URL parameters
  const params = new URLSearchParams();
  
  // Always set required parameters
  params.set('search', encodeURIComponent(input));
  if (forceShareView) params.set('shareView', '1');

  // Simple logic: Clean mode overrides everything
  if (clean) {
    // Clean mode: Set filters and sorting to empty arrays (match V1 encoding: %5B%5D)
    console.log('Using clean mode - setting filters and sorting to empty arrays');
    params.set('filters', encodeURIComponent(JSON.stringify([])));
    params.set('sort', encodeURIComponent(JSON.stringify([])));
  } else if (customDefault) {
    // Custom default mode: Use settings from options page
    console.log('Using custom default mode');
    
    // Handle filters
    if (keepFilters && baseParams?.filters) {
      console.log('Keeping filters from baseParams:', baseParams.filters);
      params.set('filters', baseParams.filters);
    }
    // If not keeping filters, don't add the parameter at all
    
    // Handle sorting
    if (keepSort && baseParams?.sort) {
      console.log('Keeping sort from baseParams:', baseParams.sort);
      params.set('sort', baseParams.sort);
    }
    // If not keeping sort, don't add the parameter at all
    
    // Add other parameters from baseParams (excluding search, filters, sort)
    Object.entries(baseParams || {}).forEach(([key, value]) => {
      if (!['search', 'filters', 'sort'].includes(key)) {
        params.set(key, value);
      }
    });
  } else {
    // Default mode: No custom settings, no clean mode - set empty arrays (match V1 encoding)
    console.log('Using default mode - setting empty filters and sorting');
    params.set('filters', encodeURIComponent(JSON.stringify([])));
    params.set('sort', encodeURIComponent(JSON.stringify([])));
  }

  const url = `https://netflixcare.sprinklr.com/care/knowledge-base?${params.toString()}`;
  console.log('Generated URL:', url);
  
  if (searchResultBehavior === 'currentTab') {
    chrome.tabs.update({ url });
  } else {
    chrome.tabs.create({ url });
  }
}
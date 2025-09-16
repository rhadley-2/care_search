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
  searchResultBehavior: 'currentTab',  // 'newTab' | 'currentTab' - changed for debugging
  rememberToggleState: false,  // whether to remember which toggle was last used
  lastToggleState: {     // saved state of toggles
    clean: false,
    customDefault: false
  },
  hasSeenSavePreferenceIntro: false,  // whether user has seen the first-time popup
  saveSearchPreference: false  // whether save preference checkbox is checked
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

async function saveToggleStates() {
  const { rememberToggleState } = await getSettings();
  if (rememberToggleState) {
    const clean = document.getElementById('cleanSwitch').dataset.on === 'true';
    const customDefault = document.getElementById('customDefaultSwitch').dataset.on === 'true';
    await setSettings({
      lastToggleState: {
        clean,
        customDefault
      }
    });
  }
}

async function saveCurrentSearchSettings() {
  // This function would capture current page's search settings
  // For now, we'll show a simple notification that preferences would be saved
  // In a real implementation, this would extract current filters/sort from the active tab
  
  // Get the currently active tab's URL to extract search parameters
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('netflixcare.sprinklr.com/care/knowledge-base')) {
      const url = new URL(tab.url);
      const params = {};
      
      // Extract relevant search parameters
      if (url.searchParams.get('filters')) {
        params.filters = url.searchParams.get('filters');
      }
      if (url.searchParams.get('sort')) {
        params.sort = url.searchParams.get('sort');
      }
      
      // Save these as base parameters
      const currentSettings = await getSettings();
      await setSettings({
        baseParams: {
          ...currentSettings.baseParams,
          ...params
        }
      });
      
      console.log('Search preferences saved from current tab');
    }
  } catch (error) {
    console.log('Could not save search preferences:', error);
  }
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
  const { theme, rememberToggleState, lastToggleState, hasSeenSavePreferenceIntro, saveSearchPreference } = await getSettings();
  // Don't set the select value - keep it showing "Theme"
  applyTheme(theme);
  
  // Restore toggle states if remembering is enabled
  if (rememberToggleState && lastToggleState) {
    if (lastToggleState.clean) {
      uiSetClean(true);
    }
    if (lastToggleState.customDefault) {
      uiSetCustomDefault(true);
    }
  }

  // Restore save preference checkbox state
  document.getElementById('saveSearchPreference').checked = saveSearchPreference;

  // Show first-time popup if user hasn't seen it
  if (!hasSeenSavePreferenceIntro) {
    console.log('Showing first-time popup');
    setTimeout(() => {
      document.getElementById('firstTimePopup').style.display = 'flex';
    }, 500);
  }

  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  const cleanSwitch = document.getElementById('cleanSwitch');
  cleanSwitch.addEventListener('click', async () => {
    const on = cleanSwitch.dataset.on !== 'true';
    uiSetClean(on);
    if (on) uiSetCustomDefault(false); // Turn off custom default when clean is on
    await saveToggleStates();
  });
  cleanSwitch.addEventListener('keydown', async (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const on = cleanSwitch.dataset.on !== 'true';
      uiSetClean(on);
      if (on) uiSetCustomDefault(false); // Turn off custom default when clean is on
      await saveToggleStates();
    }
  });

  const customDefaultSwitch = document.getElementById('customDefaultSwitch');
  customDefaultSwitch.addEventListener('click', async () => {
    const on = customDefaultSwitch.dataset.on !== 'true';
    uiSetCustomDefault(on);
    if (on) uiSetClean(false); // Turn off clean when custom default is on
    await saveToggleStates();
  });
  customDefaultSwitch.addEventListener('keydown', async (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const on = customDefaultSwitch.dataset.on !== 'true';
      uiSetCustomDefault(on);
      if (on) uiSetClean(false); // Turn off clean when custom default is on
      await saveToggleStates();
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

  // First-time popup event listeners
  const dismissPopup = async () => {
    console.log('Dismissing popup');
    document.getElementById('firstTimePopup').style.display = 'none';
    await setSettings({ hasSeenSavePreferenceIntro: true });
  };

  // Temporary: Add a way to reset and show popup again for testing
  // (You can remove this later)
  window.showTestPopup = async () => {
    await setSettings({ hasSeenSavePreferenceIntro: false });
    document.getElementById('firstTimePopup').style.display = 'flex';
  };

  document.getElementById('closePopup').addEventListener('click', dismissPopup);
  document.getElementById('gotItBtn').addEventListener('click', dismissPopup);
  
  // Also allow clicking the overlay background to dismiss
  document.getElementById('firstTimePopup').addEventListener('click', (e) => {
    if (e.target.id === 'firstTimePopup') {
      dismissPopup();
    }
  });

  // Add keyboard escape key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const popup = document.getElementById('firstTimePopup');
      if (popup.style.display === 'flex') {
        dismissPopup();
      }
    }
  });

  // Save preference checkbox event listener
  document.getElementById('saveSearchPreference').addEventListener('change', async (e) => {
    await setSettings({ saveSearchPreference: e.target.checked });
    
    if (e.target.checked) {
      // If checkbox is checked and custom search is enabled, save current search settings
      const customDefault = document.getElementById('customDefaultSwitch').dataset.on === 'true';
      if (customDefault) {
        await saveCurrentSearchSettings();
      }
    }
  });
});

async function doSearch() {
  const input = document.getElementById('searchInput').value.trim();
  if (!input) return;

  const { baseParams, keepFilters, keepSort, forceShareView, searchResultBehavior } = await getSettings();
  const clean = document.getElementById('cleanSwitch').dataset.on === 'true';
  const customDefault = document.getElementById('customDefaultSwitch').dataset.on === 'true';

  // Start with base URL parameters
  const params = new URLSearchParams();
  
  // Always set required parameters
  params.set('search', encodeURIComponent(input));
  if (forceShareView) params.set('shareView', '1');

  // Simple logic: Clean mode overrides everything
  if (clean) {
    // Clean mode: Set filters and sorting to empty arrays
    params.set('filters', encodeURIComponent(JSON.stringify([])));
    params.set('sort', encodeURIComponent(JSON.stringify([])));
  } else if (customDefault) {
    // Custom default mode: Use settings from options page
    
    // Handle filters
    if (keepFilters && baseParams?.filters) {
      params.set('filters', baseParams.filters);
    }
    
    // Handle sorting
    if (keepSort && baseParams?.sort) {
      params.set('sort', baseParams.sort);
    }
    
    // Add other parameters from baseParams (excluding search, filters, sort)
    Object.entries(baseParams || {}).forEach(([key, value]) => {
      if (!['search', 'filters', 'sort'].includes(key)) {
        params.set(key, value);
      }
    });
  } else {
    // Default mode: No custom settings, no clean mode - set empty arrays
    params.set('filters', encodeURIComponent(JSON.stringify([])));
    params.set('sort', encodeURIComponent(JSON.stringify([])));
  }

  const url = `https://netflixcare.sprinklr.com/care/knowledge-base?${params.toString()}`;
  
  if (searchResultBehavior === 'currentTab') {
    chrome.tabs.update({ url });
  } else {
    chrome.tabs.create({ url });
  }
}
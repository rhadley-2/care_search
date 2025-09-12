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
const DEFAULT_SETTINGS = {
  baseParams: { filters: buildLocaleFilter(['en_US']) },
  keepFilters: true,
  keepSort: false,
  forceShareView: true,
  theme: 'system'
};

function parseParamsFromUrlStr(urlStr) {
  const out = {};
  try {
    const u = new URL(urlStr);
    u.searchParams.forEach((v, k) => { out[k] = v; });
  } catch (e) {
    // ignore invalid URL
  }
  // Always remove static search; the popup will set it
  delete out.search;
  return out;
}

function buildUrlFromParams(params) {
  const u = new URL('https://netflixcare.sprinklr.com/care/knowledge-base');
  Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (res) => {
      if (!res.baseParams) res.baseParams = {};
      resolve(res);
    });
  });
}
function setSettings(partial) {
  return new Promise((resolve) => chrome.storage.sync.set(partial, resolve));
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme || 'system');
}

async function restore() {
  const { baseParams, keepFilters, keepSort, forceShareView, theme } = await getSettings();
  document.getElementById('baseUrl').value = Object.keys(baseParams || {}).length
    ? buildUrlFromParams(baseParams)
    : '';
  document.getElementById('keepFilters').checked = !!keepFilters;
  document.getElementById('keepSort').checked = !!keepSort;
  document.getElementById('forceShareView').checked = !!forceShareView;

  document.getElementById('themeSelect').value = theme || 'system';
  applyTheme(theme);
}

async function save() {
  const baseUrl = document.getElementById('baseUrl').value.trim();
  const keepFilters = document.getElementById('keepFilters').checked;
  const keepSort = document.getElementById('keepSort').checked;
  const forceShareView = document.getElementById('forceShareView').checked;

  const baseParams = baseUrl ? parseParamsFromUrlStr(baseUrl) : {};
  // ensure we never persist a 'search' key
  delete baseParams.search;

  await setSettings({ baseParams, keepFilters, keepSort, forceShareView });

  const status = document.getElementById('status');
  status.textContent = 'Saved';
  setTimeout(() => (status.textContent = ''), 1200);
}

async function resetDefaults() {
  await setSettings({
    baseParams: { filters: buildLocaleFilter(['en_US']) },
    keepFilters: true,
    keepSort: false,
    forceShareView: true
  });
  await restore();
  const status = document.getElementById('status');
  status.textContent = 'Defaults restored';
  setTimeout(() => (status.textContent = ''), 1200);
}

async function onThemeChange(e) {
  const theme = e.target.value;
  await setSettings({ theme });
  applyTheme(theme);
}

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('saveBtn').addEventListener('click', save);
document.getElementById('resetDefaults').addEventListener('click', resetDefaults);
document.getElementById('themeSelect').addEventListener('change', onThemeChange);
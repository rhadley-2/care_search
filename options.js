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
  theme: 'system',
  searchResultBehavior: 'newTab'
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

// Human-friendly field mappings
const FIELD_MAPPINGS = {
  'KB_CONTENT_STATUS': 'Status',
  'KB_LOCALE': 'Language',
  'KB_CATEGORY': 'Category',
  'KB_SUBCATEGORY': 'Subcategory',
  'KB_CONTENT_TYPE': 'Content Type',
  'KB_TAGS': 'Tags',
  'KB_PRODUCT': 'Product',
  'KB_REGION': 'Region',
  'CREATED_DATE': 'Created Date',
  'MODIFIED_DATE': 'Modified Date',
  'KB_AUTHOR': 'Author',
  'KB_PRIORITY': 'Priority'
};

// Human-friendly value mappings
const VALUE_MAPPINGS = {
  'DRAFT': 'Draft',
  'PUBLISHED': 'Published',
  'ARCHIVED': 'Archived',
  'UNDER_REVIEW': 'Under Review',
  'INTERNAL': 'Internal',
  'EXTERNAL': 'External',
  'FAQ': 'FAQ',
  'TROUBLESHOOTING': 'Troubleshooting',
  'HOWTO': 'How To',
  'ARTICLE': 'Article'
};

// Human-friendly filter type mappings
const FILTER_TYPE_MAPPINGS = {
  'IN': 'is',
  'NOT_IN': 'is not',
  'CONTAINS': 'contains',
  'NOT_CONTAINS': 'does not contain',
  'EQUALS': 'equals',
  'NOT_EQUALS': 'does not equal',
  'GREATER_THAN': 'greater than',
  'LESS_THAN': 'less than'
};

function humanizeFieldName(field) {
  return FIELD_MAPPINGS[field] || field.replace(/KB_|_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function humanizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(v => VALUE_MAPPINGS[v] || v).join(', ');
  }
  return VALUE_MAPPINGS[value] || value;
}

function humanizeFilterType(type) {
  return FILTER_TYPE_MAPPINGS[type] || type.toLowerCase();
}

function parseUrlPreview(urlStr) {
  if (!urlStr.trim()) {
    return { valid: false, filters: [], sort: [], locale: null, other: [] };
  }
  
  try {
    const params = parseParamsFromUrlStr(urlStr);
    const preview = { valid: true, filters: [], sort: [], locale: null, other: [] };
    
    // Parse filters
    if (params.filters) {
      try {
        const decodedFilters = JSON.parse(decodeURIComponent(decodeURIComponent(params.filters)));
        if (Array.isArray(decodedFilters)) {
          decodedFilters.forEach(filter => {
            if (filter.field === 'KB_LOCALE' && filter.values) {
              preview.locale = filter.values.map(v => humanizeValue(v));
            } else {
              preview.filters.push({
                field: humanizeFieldName(filter.field || 'Unknown'),
                type: humanizeFilterType(filter.filterType || 'Unknown'),
                values: humanizeValue(filter.values || []),
                rawField: filter.field
              });
            }
          });
        }
      } catch (e) {
        preview.filters.push({ field: 'Filters', type: 'Raw', values: [params.filters] });
      }
    }
    
    // Parse sort
    if (params.sort) {
      try {
        const decodedSort = JSON.parse(decodeURIComponent(decodeURIComponent(params.sort)));
        if (Array.isArray(decodedSort)) {
          preview.sort = decodedSort.map(s => ({
            field: humanizeFieldName(s.field || 'Unknown'),
            direction: (s.sortDirection || 'Unknown').toLowerCase() === 'desc' ? 'newest first' : 'oldest first',
            rawField: s.field
          }));
        }
      } catch (e) {
        preview.sort.push({ field: 'Sort', direction: 'Raw: ' + params.sort });
      }
    }
    
    // Parse other parameters
    Object.keys(params).forEach(key => {
      if (!['filters', 'sort', 'search'].includes(key)) {
        preview.other.push({ key, value: params[key] });
      }
    });
    
    return preview;
  } catch (e) {
    return { valid: false, filters: [], sort: [], locale: null, other: [] };
  }
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
  const root = document.documentElement;
  const themeToApply = theme || 'system';
  root.setAttribute('data-theme', themeToApply);
  
  // Also set it on body as a fallback
  document.body.setAttribute('data-theme', themeToApply);
}

function updateUrlPreview(urlStr) {
  const preview = parseUrlPreview(urlStr);
  const previewElement = document.getElementById('urlPreview');
  
  if (!urlStr.trim()) {
    previewElement.style.display = 'none';
    return;
  }
  
  previewElement.style.display = 'block';
  
  let html = '';
  
  if (!preview.valid) {
    html = '<div class="preview-error">Invalid URL format</div>';
  } else {
    html = '<div class="preview-header">Parameters that will be imported:</div>';
    
    // Show locale
    if (preview.locale && preview.locale.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Locale:</div>
        <div class="preview-values">${preview.locale.join(', ')}</div>
      </div>`;
    }
    
    // Show filters
    if (preview.filters.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Filters:</div>`;
      preview.filters.forEach(filter => {
        html += `<div class="preview-item">${filter.field} ${filter.type} ${filter.values}</div>`;
      });
      html += '</div>';
    }
    
    // Show sort
    if (preview.sort.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Sorting:</div>`;
      preview.sort.forEach(sort => {
        html += `<div class="preview-item">${sort.field} (${sort.direction})</div>`;
      });
      html += '</div>';
    }
    
    // Show other parameters
    if (preview.other.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Other parameters:</div>`;
      preview.other.forEach(param => {
        html += `<div class="preview-item">${param.key}: ${param.value}</div>`;
      });
      html += '</div>';
    }
    
    if (preview.locale === null && preview.filters.length === 0 && preview.sort.length === 0 && preview.other.length === 0) {
      html += '<div class="preview-empty">No parameters found in this URL</div>';
    }
  }
  
  previewElement.innerHTML = html;
}

async function restore() {
  const { baseParams, keepFilters, keepSort, forceShareView, theme, searchResultBehavior } = await getSettings();
  document.getElementById('baseUrl').value = Object.keys(baseParams || {}).length
    ? buildUrlFromParams(baseParams)
    : '';
  document.getElementById('keepFilters').checked = !!keepFilters;
  document.getElementById('keepSort').checked = !!keepSort;
  document.getElementById('forceShareView').checked = !!forceShareView;

  document.getElementById('searchResultBehavior').value = searchResultBehavior || 'newTab';
  document.getElementById('themeSelect').value = theme || 'system';
  applyTheme(theme);
  
  // Update URL preview
  updateUrlPreview(document.getElementById('baseUrl').value);
}

async function save() {
  const baseUrl = document.getElementById('baseUrl').value.trim();
  const keepFilters = document.getElementById('keepFilters').checked;
  const keepSort = document.getElementById('keepSort').checked;
  const forceShareView = document.getElementById('forceShareView').checked;
  const searchResultBehavior = document.getElementById('searchResultBehavior').value;

  const baseParams = baseUrl ? parseParamsFromUrlStr(baseUrl) : {};
  // ensure we never persist a 'search' key
  delete baseParams.search;

  await setSettings({ baseParams, keepFilters, keepSort, forceShareView, searchResultBehavior });

  const status = document.getElementById('status');
  status.textContent = 'Settings Saved';
  status.classList.add('show');
  setTimeout(() => {
    status.classList.remove('show');
    setTimeout(() => (status.textContent = ''), 200);
  }, 1200);
}

async function resetDefaults() {
  await setSettings({
    baseParams: { filters: buildLocaleFilter(['en_US']) },
    keepFilters: true,
    keepSort: false,
    forceShareView: true,
    searchResultBehavior: 'newTab'
  });
  await restore();
  const status = document.getElementById('status');
  status.textContent = 'Defaults Restored';
  status.classList.add('show');
  setTimeout(() => {
    status.classList.remove('show');
    setTimeout(() => (status.textContent = ''), 200);
  }, 1200);
}

async function onThemeChange(e) {
  const theme = e.target.value;
  await setSettings({ theme });
  applyTheme(theme);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Apply theme immediately on load
  const { theme } = await getSettings();
  applyTheme(theme);
  
  // Then restore all other settings
  await restore();
  
  // Add reactive URL preview
  const baseUrlInput = document.getElementById('baseUrl');
  baseUrlInput.addEventListener('input', (e) => {
    updateUrlPreview(e.target.value);
  });
});
document.getElementById('saveBtn').addEventListener('click', save);
document.getElementById('resetDefaults').addEventListener('click', resetDefaults);
document.getElementById('themeSelect').addEventListener('change', onThemeChange);
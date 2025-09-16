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
  searchResultBehavior: 'newTab',
  rememberToggleState: false,
  lastToggleState: {
    clean: false,
    customDefault: false
  }
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
  'KB_PRIORITY': 'Priority',
  'KB_FOLDER_ID': 'Category',
  'FOLDER_ID': 'Category',
  'FOLDER ID': 'Category',
  // Sort field mappings
  'KB_TITLE_KEYWORD': 'Title',
  'KB_MODIFIED_TIME': 'Modified On',
  'KB_CREATED_DATE': 'Created On',
  'KB_TEXT_MODIFIED_TIME': 'Content Modified Time'
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

// Hardcoded category mappings for instant lookup
const CATEGORY_MAPPINGS = {
  // Main categories
  "67aa720667d7a42189a05daf": "Copy of new test",
  "66d2e640042c826510cb78a9": "new test",
  "65b88f835990db76bf6dd91a": "iFrame Source Codes",
  "65b7ccc304f8e04c9439204f": "Help Center",
  "65b7cbea04f8e04c94391bd7": "KB",
  "65b7cb7f04f8e04c94391962": "Issue Articles",
  "65b7cb4004f8e04c943917f7": "Escalations",
  "65b7ca8c04f8e04c94391396": "Training",
  "65b7c9f104f8e04c94390f98": "Legal",
  "65b6a0c7d47d4c7a70d9f498": "Formatting Options",
  "64f208234a600276e4685dd7": "ISSUE ARTICLE SEARCH ONLY",
  "6483387aee400f32bc5d533b": "KB SEARCH ONLY [COMBINED MARKUP]",
  
  // Content Blocks
  "65b88f485990db76bf6dd82e": "Content Blocks: Issue Articles",
  "65b88f365990db76bf6dd7b2": "Content Blocks: Escalation Posts",
  "65b88f585990db76bf6dd8ac": "Content Blocks: Training",
  "65b88d275990db76bf6dd1b2": "Content Blocks: Help Center",
  "65b88e1e5990db76bf6dd453": "Content Blocks: KB",
  
  // Help Center subcategories
  "65b88ce75990db76bf6dd14a": "HC Articles",
  "65b88de35990db76bf6dd33e": "Help Center • Billing and Payments",
  "65b88dda5990db76bf6dd310": "Help Center • Growth & Plans",
  "65b88dd35990db76bf6dd2f6": "Help Center • Product Experience",
  "65b88dca5990db76bf6dd2d8": "Help Center • Content",
  "65b88dc15990db76bf6dd2b9": "Help Center • Customer Trust & Safety",
  "65b88db45990db76bf6dd29b": "Help Center • Netflix Corporate",
  "65b88dab5990db76bf6dd276": "Help Center • Devices",
  "65b88da75990db76bf6dd263": "Help Center • Error Codes",
  "65b88d9d5990db76bf6dd22e": "Help Center • Games",
  
  // Billing subcategories
  "65b88df75990db76bf6dd38b": "Direct Billing",
  "65b88def5990db76bf6dd36e": "Partner Payments",
  
  // KB subcategories
  "65cd1102ee84900dc55f5c53": "KB Refresh",
  "65b88e5b5990db76bf6dd4e9": "PSO News Posts",
  "65b88e4f5990db76bf6dd4bb": "KB articles",
  "65b88e2d5990db76bf6dd480": "KB • Visual Guides",
  
  // KB articles subcategories
  "65b88eb45990db76bf6dd658": "KB • Growth and Plans",
  "65b88eab5990db76bf6dd633": "KB • Billing and Payments",
  "65b88ea15990db76bf6dd612": "KB • Devices",
  "65b88e9a5990db76bf6dd5f3": "KB • Netflix Corporate",
  "65b88e905990db76bf6dd5be": "KB • Customer Trust & Safety",
  "65b88e835990db76bf6dd592": "KB • Product Experience",
  "65b88e7a5990db76bf6dd563": "KB • Agent Tools",
  "65b88e715990db76bf6dd547": "KB • Games",
  "65b88e6d5990db76bf6dd533": "KB • Content",
  "65d7be2453eef8765f0cf147": "Archive - DO NOT UPDATE/PUBLISH",
  
  // KB billing subcategories
  "65b88ec95990db76bf6dd6ac": "KB • Direct Billing",
  "65b88ec05990db76bf6dd690": "KB • Partner Payments"
};

function getCategoryName(categoryId) {
  return CATEGORY_MAPPINGS[categoryId] || categoryId;
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
            console.log('Parsing filter:', filter); // Debug log
            if (filter.field === 'KB_LOCALE' && filter.values) {
              preview.locale = filter.values.map(v => humanizeValue(v));
            } else {
              let values = filter.values || [];
              
              // Special handling for folder/category IDs
              if (filter.field === 'KB_FOLDER_ID' && Array.isArray(values)) {
                console.log('Found KB_FOLDER_ID array:', values); // Debug log
                values = values.map(id => getCategoryName(id));
                console.log('Mapped to:', values); // Debug log
              } else if (filter.field === 'KB_FOLDER_ID' && !Array.isArray(values)) {
                console.log('Found KB_FOLDER_ID single value:', values); // Debug log
                values = getCategoryName(values);
                console.log('Mapped to:', values); // Debug log
              }
              
              preview.filters.push({
                field: filter.field === 'KB_FOLDER_ID' ? 'Category' : humanizeFieldName(filter.field || 'Unknown'),
                type: humanizeFilterType(filter.filterType || 'Unknown'),
                values: Array.isArray(values) ? values.join(', ') : (values || ''),
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
          preview.sort = decodedSort.map(s => {
            // Handle both URL format (key/order) and internal format (field/sortDirection)
            const fieldName = s.key || s.field || 'Unknown';
            const sortOrder = s.order || s.sortDirection || 'Unknown';
            
            return {
              field: humanizeFieldName(fieldName),
              direction: sortOrder.toLowerCase() === 'desc' ? 'newest first' : 'oldest first',
              rawField: fieldName
            };
          });
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
    html = '<div class="preview-header">Settings that will be copied from this URL:</div>';
    
    // Show locale
    if (preview.locale && preview.locale.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Language:</div>
        <div class="preview-item"><strong>Locale:</strong> ${preview.locale.join(', ')}</div>
      </div>`;
    }
    
    // Show filters
    if (preview.filters.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Filters:</div>`;
      preview.filters.forEach(filter => {
        html += `<div class="preview-item"><strong>${filter.field}:</strong> ${filter.values}</div>`;
      });
      html += '</div>';
    }
    
    // Show sort
    if (preview.sort.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Sorting:</div>`;
      preview.sort.forEach(sort => {
        html += `<div class="preview-item"><strong>${sort.field}:</strong> ${sort.direction}</div>`;
      });
      html += '</div>';
    }
    
    // Show other parameters
    if (preview.other.length > 0) {
      html += `<div class="preview-section">
        <div class="preview-label">Other settings:</div>`;
      preview.other.forEach(param => {
        html += `<div class="preview-item"><strong>${param.key}:</strong> ${param.value}</div>`;
      });
      html += '</div>';
    }
    
    if (preview.locale === null && preview.filters.length === 0 && preview.sort.length === 0 && preview.other.length === 0) {
      html += '<div class="preview-empty">No settings found in this URL</div>';
    }
  }
  
  previewElement.innerHTML = html;
}

async function restore() {
  const { baseParams, keepFilters, keepSort, forceShareView, theme, searchResultBehavior, rememberToggleState } = await getSettings();
  document.getElementById('baseUrl').value = Object.keys(baseParams || {}).length
    ? buildUrlFromParams(baseParams)
    : '';
  document.getElementById('keepFilters').checked = !!keepFilters;
  document.getElementById('keepSort').checked = !!keepSort;
  document.getElementById('forceShareView').checked = !!forceShareView;

  document.getElementById('searchResultBehavior').value = searchResultBehavior || 'newTab';
  document.getElementById('rememberToggleState').value = rememberToggleState ? 'true' : 'false';
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
  const rememberToggleState = document.getElementById('rememberToggleState').value === 'true';

  const baseParams = baseUrl ? parseParamsFromUrlStr(baseUrl) : {};
  // ensure we never persist a 'search' key
  delete baseParams.search;

  await setSettings({ baseParams, keepFilters, keepSort, forceShareView, searchResultBehavior, rememberToggleState });

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
    searchResultBehavior: 'newTab',
    rememberToggleState: false,
    lastToggleState: {
      clean: false,
      customDefault: false
    }
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
# NetflixCare Search Extension - Settings Guide

## Table of Contents
1. Introduction
2. Accessing the Settings Page
3. URL Configuration Section
4. Search Behavior Settings
5. Appearance Settings
6. Saving and Resetting Settings
7. Default Settings Overview
8. Common Use Cases
9. Troubleshooting
10. Best Practices

---

## 1. Introduction

The NetflixCare Search Extension settings page allows you to customize how the extension behaves when searching the NetflixCare knowledge base. This guide will walk you through each setting and explain how to configure the extension for your specific needs.

**Key Features:**
- Copy filters and settings from existing NetflixCare ShareView URLs
- Real-time preview of imported settings
- Customizable search result behavior (new tab vs current tab)
- Theme selection (System, Light, Dark)
- Responsive design that works on desktop and mobile

---

## 2. Accessing the Settings Page

To open the settings page:

1. Click the NetflixCare Search extension icon in your Chrome toolbar
2. In the popup window, click the "Settings" button at the bottom
3. The settings page will open in a new tab

**[Screenshot Placeholder: Extension popup with Settings button highlighted]**

---

## 3. URL Configuration Section

This is the most powerful section of the settings page, allowing you to copy filters and preferences from existing NetflixCare searches.

### 3.1 ShareView URL Field

**Purpose:** Import filters, categories, language settings, and sorting preferences from an existing NetflixCare search.

**How to use:**
1. In NetflixCare, perform a search with your desired filters and sorting
2. Click the "ShareView" button in NetflixCare to get a shareable URL
3. Copy the entire ShareView URL
4. Paste it into the "ShareView URL" field in the extension settings

**[Screenshot Placeholder: NetflixCare ShareView button and URL copying process]**

### 3.2 Real-time URL Preview

When you paste a ShareView URL, the extension automatically shows a preview of what will be imported:

**Preview Sections:**
- **Language:** Shows locale settings (e.g., "English (US)")
- **Filters:** Displays all active filters in human-readable format
  - Example: "Status: Published" instead of "KB_CONTENT_STATUS (IN): PUBLISHED"
  - Category names are automatically converted from IDs to readable names
- **Sorting:** Shows sort preferences (e.g., "Modified Date: newest first")
- **Other Settings:** Any additional parameters from the URL

**[Screenshot Placeholder: URL Preview section showing imported filters and settings]**

### 3.3 Checkbox Options

#### Keep filters from ShareView URL
- **Checked (Default):** The extension will use filters from your ShareView URL
- **Unchecked:** Filters will be cleared unless you use the "Remove Filters and Sorting" toggle in the popup for a single search

#### Keep sort from ShareView URL  
- **Unchecked (Default):** Sorting preferences are not imported
- **Checked:** The extension will use sorting preferences from your ShareView URL

#### Force shareView=1
- **Checked (Default):** Automatically adds the shareView parameter to all search URLs
- **Unchecked:** Standard NetflixCare URLs without shareView parameter

**[Screenshot Placeholder: Checkbox options section]**

---

## 4. Search Behavior Settings

### Search Result Behavior

Controls how search results open when you click "Search" in the extension popup.

**Options:**
- **Open in new tab (Default):** Creates a new browser tab for search results
- **Open in current tab:** Replaces the current tab with search results

**When to use each option:**
- **New tab:** Best for research and comparison, keeps your current work intact
- **Current tab:** Faster for single searches, reduces tab clutter

**[Screenshot Placeholder: Search Behavior dropdown menu]**

---

## 5. Appearance Settings

### Theme Selection

Controls the visual appearance of both the extension popup and settings page.

**Options:**
- **System (Default):** Automatically matches your computer's theme preference
- **Light:** Always uses light mode with white background
- **Dark:** Always uses dark mode with dark background

**Theme Features:**
- Consistent styling across popup and settings page
- High contrast for accessibility
- Professional Netflix-branded color scheme

**[Screenshot Placeholder: Theme dropdown and examples of different themes]**

---

## 6. Saving and Resetting Settings

### Save Settings Button
- Saves all your current settings
- Settings are synced across all your Chrome browsers (if signed into Chrome)
- Shows a green "Settings Saved" confirmation message

### Reset to Default Button
- Restores all settings to their original defaults
- Useful if you want to start over or if settings become problematic
- Shows a "Defaults Restored" confirmation message

**Default Settings:**
- ShareView URL: Empty
- Keep filters: Checked
- Keep sort: Unchecked  
- Force shareView: Checked
- Search behavior: Open in new tab
- Theme: System

**[Screenshot Placeholder: Action buttons and confirmation messages]**

---

## 7. Default Settings Overview

When you first install the extension, it comes configured with these defaults:

| Setting | Default Value | Purpose |
|---------|---------------|---------|
| ShareView URL | Empty | No pre-configured filters |
| Language Filter | English (US) | Matches most Netflix users |
| Keep Filters | Enabled | Maintains your filter preferences |
| Keep Sort | Disabled | Allows NetflixCare's default sorting |
| Force ShareView | Enabled | Ensures URLs work consistently |
| Search Behavior | New Tab | Preserves your current work |
| Theme | System | Matches your computer's preference |

---

## 8. Common Use Cases

### Use Case 1: Creating a Custom Default Search
**Scenario:** You frequently search for KB articles in the Billing category.

**Steps:**
1. Go to NetflixCare and filter for KB articles in the Billing category
2. Click ShareView to get the URL
3. Copy the ShareView URL to the extension settings
4. Enable "Keep filters from ShareView URL"
5. Save settings

**Result:** All future searches will automatically include the Billing category filter.

### Use Case 2: Team-Specific Configuration
**Scenario:** Your team works with specific content types and regions.

**Steps:**
1. Create a NetflixCare search with your team's standard filters
2. Share the ShareView URL with team members
3. Each team member pastes the URL into their extension settings
4. Everyone now has consistent search defaults

### Use Case 3: Temporary Filter Override
**Scenario:** You need to search without your saved filters for one search.

**Steps:**
1. In the extension popup, toggle "Remove Filters and Sorting"
2. Perform your search
3. The toggle automatically resets for the next search

**[Screenshot Placeholder: Extension popup showing the Remove Filters toggle]**

---

## 9. Troubleshooting

### Problem: URL Preview Shows "No settings found"
**Cause:** The pasted URL doesn't contain NetflixCare filter parameters.
**Solution:** 
- Make sure you copied the complete ShareView URL from NetflixCare
- Ensure the URL starts with "https://netflixcare.sprinklr.com"
- Try creating a new search with filters in NetflixCare and get a fresh ShareView URL

### Problem: Settings Don't Save
**Cause:** Browser permission or storage issues.
**Solution:**
- Refresh the settings page and try again
- Check that Chrome storage permissions are enabled for the extension
- Try resetting to defaults and reconfiguring

### Problem: Dark Mode Not Working
**Cause:** Theme setting conflicts or caching.
**Solution:**
- Try switching to Light mode, save, then back to Dark mode
- Refresh the page after changing themes
- Clear your browser cache if the problem persists

### Problem: Filters Not Applied in Searches
**Cause:** "Keep filters" setting or URL configuration issues.
**Solution:**
- Verify "Keep filters from ShareView URL" is checked
- Confirm your ShareView URL contains the desired filters in the preview
- Check that the URL preview shows your expected filters

---

## 10. Best Practices

### URL Management
- **Test your ShareView URLs** by pasting them and checking the preview
- **Keep ShareView URLs updated** if your search needs change
- **Document your team's standard URL** for consistency

### Search Efficiency
- **Use specific filters** in your ShareView URL to reduce irrelevant results
- **Configure search behavior** based on your workflow (new tab vs current tab)
- **Leverage the preview feature** to understand what filters are active

### Theme and Accessibility
- **Use System theme** for automatic light/dark switching
- **Consider your work environment** when choosing between light and dark themes
- **Test different themes** to find what works best for your screen and lighting

### Team Coordination
- **Share your ShareView URLs** with team members for consistency
- **Document your team's settings** in team wikis or documentation
- **Regularly review and update** team search configurations

---

## Need Help?

If you encounter issues not covered in this guide:
1. Try resetting to default settings first
2. Check the GitHub repository for known issues
3. Create a new issue on the project's GitHub page
4. Include your Chrome version and specific error messages

---

*This guide covers NetflixCare Search Extension v1.3. Features and interface may vary in different versions.*
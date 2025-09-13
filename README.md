# NetflixCare Search Extension

A Chrome extension for enhanced NetflixCare knowledge base searching with custom encoding, saved defaults, and flexible search result behavior.

## Features

### 🔍 Enhanced Search
- **Custom Encoding**: Properly encodes search parameters to prevent display of encoded characters
- **Flexible Search Results**: Choose to open results in a new tab or current tab
- **Clean Search Option**: Toggle to remove all filters and sorting for a single search

### ⚙️ Customizable Defaults
- **Base URL Configuration**: Set a shared-view URL to inherit filters and locale settings
- **Filter Management**: Choose to keep or clear filters from your base URL
- **Sort Control**: Maintain or remove sorting preferences
- **Locale Support**: Defaults to en_US with support for custom locales

### 🎨 Theme Support
- **System Theme**: Automatically matches your OS theme preference
- **Light/Dark Mode**: Manual theme selection with dedicated dark mode icons
- **Consistent UI**: Matching theme across popup and settings pages

### 🛠️ Advanced Configuration
- **Custom Default Search**: Toggle to use your saved configuration or standard search
- **Force Share View**: Automatically adds shareView=1 parameter
- **Persistent Settings**: All preferences saved via Chrome sync storage

## Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/rhadley-2/care_search.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the project directory

5. The NetflixCare Search extension will appear in your browser toolbar

### From Chrome Web Store
*Coming soon - extension pending review*

## Usage

### Basic Search
1. Click the extension icon in your browser toolbar
2. Enter your search term in the input field
3. Click "Search" or press Enter
4. Results open according to your configured behavior (new tab by default)

### Quick Options
- **Remove Filters and Sorting**: Toggle the switch to clear all filters for a single search
- **Custom Default Search Enable**: Toggle to use your saved configuration
- **Theme Selection**: Choose between System, Light, or Dark themes

### Advanced Configuration
1. Click "Settings" in the popup to open the options page
2. Configure your preferences:
   - **Base shared-view URL**: Paste a NetflixCare URL to inherit its parameters
   - **Keep filters/sort**: Choose whether to maintain or clear these settings
   - **Search Result Behavior**: Select new tab or current tab opening
   - **Theme**: Set your preferred theme

## Configuration Options

### Base URL Settings
- **Base shared-view URL**: Optional URL to inherit filters and locale settings
- **Keep filters from base URL**: Maintains filter settings from your base URL
- **Keep sort from base URL**: Preserves sorting preferences
- **Force shareView=1**: Automatically adds share view parameter

### Search Behavior
- **Search Result Behavior**: 
  - *Open in new tab* (default): Opens results in a new browser tab
  - *Open in current tab*: Replaces current tab with search results

### Default Parameters
The extension defaults to:
- English (US) locale filter
- No custom sorting
- Share view enabled
- New tab opening behavior

## File Structure

```
care_search/
├── manifest.json          # Extension manifest
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── options.html          # Settings page
├── options.js            # Settings functionality
├── icon16.png           # 16x16 icon
├── icon48.png           # 48x48 icon (light theme)
├── icon48_dark.png      # 48x48 icon (dark theme)
├── icon128.png          # 128x128 icon (light theme)
├── icon128_dark.png     # 128x128 icon (dark theme)
└── README.md            # This file
```

## Technical Details

### Encoding
- Uses double URI encoding for JSON parameters
- Properly handles special characters in search terms
- Prevents display of encoded characters in URLs

### Storage
- Uses Chrome's `chrome.storage.sync` API for cross-device synchronization
- Settings persist across browser sessions and devices
- Secure parameter storage with validation

### Permissions
- `storage`: For saving user preferences
- `tabs`: For opening search results in new/current tabs

## Development

### Prerequisites
- Chrome browser (version 88+)
- Basic knowledge of Chrome extension development

### Local Development
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the NetflixCare Search extension
4. Test your changes

### Building for Production
The extension is ready for distribution as-is. For Chrome Web Store submission:
1. Zip the entire project directory (excluding `.git` and `node_modules` if present)
2. Upload to Chrome Web Store Developer Dashboard
3. Follow Chrome Web Store review process

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Version History

### v1.2 (Current)
- Added search result behavior setting (new tab vs current tab)
- Improved UI with theme-specific icons
- Enhanced popup and settings page layout
- Better theme consistency across all pages

### v1.1
- Added comprehensive UI improvements
- Custom default search functionality
- Enhanced theme support

### v1.0
- Initial release
- Basic search functionality
- Parameter encoding fixes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions:
- Create an issue on [GitHub](https://github.com/rhadley-2/care_search/issues)
- Review the [setup documentation](https://docs.google.com/document/d/1Pls8By5yiJAr1PxH5uU5FekcG32kXPjQJ6z5ianmYiY/edit?tab=t.0)

## Acknowledgments

- Built for Netflix internal use
- Integrates with NetflixCare Sprinklr knowledge base
- Thanks to the Chrome Extensions API team for excellent documentation
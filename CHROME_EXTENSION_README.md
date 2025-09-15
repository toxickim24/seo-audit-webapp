# SEO Mojo Chrome Extension

A powerful Chrome extension that brings professional SEO analysis directly to your browser.

## Features

- **One-Click Analysis**: Analyze any website directly from the browser
- **Floating Button**: Always-accessible SEO analysis button on every page
- **Quick Analysis**: Instant on-page SEO checks
- **Lead Management**: View and manage your SEO audit leads
- **Recent Audits**: Track your analysis history

## Installation

### Development Installation

1. **Build the Extension**:
   ```bash
   cd chrome-extension
   # The extension files are already ready to use
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `chrome-extension` folder
   - The SEO Mojo extension will appear in your extensions

3. **Pin the Extension**:
   - Click the puzzle piece icon in Chrome toolbar
   - Find "SEO Mojo" and click the pin icon

## Usage

### Popup Interface
- Click the SEO Mojo icon in the Chrome toolbar
- View current website information
- Run full SEO analysis or quick checks
- Access recent audits and lead management

### Floating Button
- A floating "SEO Mojo" button appears on every website
- Click to open the widget interface
- Run quick analysis or full audits directly

### Content Script Features
- **Auto-detection**: Automatically detects website changes
- **Quick Analysis**: Instant SEO checks without leaving the page
- **Smart Integration**: Works with single-page applications

## File Structure

```
chrome-extension/
├── manifest.json          # Extension manifest
├── popup.html            # Popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── content.js            # Content script for page injection
├── content.css           # Content script styles
└── icons/                # Extension icons (you'll need to add these)
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Configuration

### Permissions
- `activeTab`: Access current tab information
- `storage`: Save audit results and settings
- `scripting`: Inject content scripts
- `host_permissions`: Analyze any website

### Settings
The extension stores settings in Chrome's local storage:
- `autoAnalyze`: Automatically analyze new pages
- `showNotifications`: Show audit completion notifications
- `theme`: Extension theme preference

## API Integration

The extension integrates with the main SEO Mojo app:
- Opens analysis in new tab with current URL
- Saves audit results to local storage
- Tracks usage analytics

## Development

### Testing
1. Load the extension in Chrome
2. Visit any website
3. Click the floating button or extension icon
4. Test both quick analysis and full audit features

### Debugging
- Use Chrome DevTools for popup debugging
- Check background script in Extensions page
- Monitor content script execution in page DevTools

## Production Deployment

### Chrome Web Store
1. Create a Chrome Web Store developer account
2. Package the extension as a ZIP file
3. Upload to Chrome Web Store
4. Submit for review

### Requirements
- Add proper extension icons (16x16, 32x32, 48x48, 128x128)
- Update manifest.json with production URLs
- Test on multiple websites
- Ensure privacy policy compliance

## Troubleshooting

### Common Issues
- **Widget not appearing**: Check if content script is loaded
- **Analysis not working**: Verify main app is running on localhost:3000
- **Permissions denied**: Check manifest.json permissions

### Debug Steps
1. Check Chrome Extensions page for errors
2. Inspect popup with DevTools
3. Check console for content script errors
4. Verify main SEO Mojo app is accessible

## Support

For issues or questions:
- Check the main SEO Mojo documentation
- Review Chrome extension development guides
- Test with different websites and browsers

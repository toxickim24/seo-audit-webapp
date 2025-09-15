# SEO Mojo Embeddable Widget

A lightweight, embeddable widget that can be added to any website to provide instant SEO analysis capabilities.

## Features

- **Easy Integration**: Single script tag installation
- **Responsive Design**: Works on desktop and mobile
- **Quick Analysis**: Instant on-page SEO checks
- **Full Analysis**: Redirects to complete SEO audit
- **Customizable**: Easy to style and configure

## Installation

### Basic Installation

Add this script tag to your website's `<head>` section:

```html
<script src="http://localhost:3000/embeddable-widget/embed.js"></script>
```

### Advanced Installation

For production use, host the widget files on your CDN:

```html
<script src="https://your-cdn.com/seo-mojo/embed.js"></script>
```

## Usage

### Automatic Widget
The widget automatically appears as a floating button in the bottom-right corner of the page.

### Manual Control
You can control the widget programmatically:

```javascript
// Open full analysis
SEOMojo.analyze()

// Run quick check
SEOMojo.quickCheck()

// Toggle widget visibility
SEOMojo.toggle()

// Track custom events
SEOMojo.track('custom_event', { data: 'value' })
```

## File Structure

```
embeddable-widget/
├── widget.html           # Widget HTML structure
├── widget.css            # Widget styles
├── widget.js             # Widget functionality
└── embed.js              # Embed script for websites
```

## Configuration

### Widget Settings
The widget can be configured by modifying the `CONFIG` object in `embed.js`:

```javascript
const CONFIG = {
  widgetUrl: 'https://your-cdn.com/seo-mojo/widget.html',
  scriptVersion: '1.0.0',
  widgetId: 'seo-mojo-embed-widget'
}
```

### Styling
The widget uses CSS custom properties for easy theming:

```css
#seo-mojo-embed-widget {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --text-color: #333;
  --background-color: #fff;
}
```

## API Reference

### Global API

#### `SEOMojo.analyze()`
Opens the full SEO analysis in a new tab.

#### `SEOMojo.quickCheck()`
Runs a quick on-page SEO analysis and displays results.

#### `SEOMojo.toggle()`
Toggles the widget visibility (show/hide).

#### `SEOMojo.track(event, data)`
Tracks custom events for analytics.

#### `SEOMojo.reload()`
Reloads the widget (useful for SPA navigation).

### Events

The widget fires custom events that you can listen to:

```javascript
// Listen for widget events
document.addEventListener('seo-mojo-analyze', function(event) {
  console.log('Analysis started:', event.detail)
})

document.addEventListener('seo-mojo-quick-check', function(event) {
  console.log('Quick check completed:', event.detail)
})
```

## Customization

### Positioning
Change the widget position by modifying the CSS:

```css
#seo-mojo-embed-widget {
  position: fixed;
  bottom: 20px;    /* Change vertical position */
  right: 20px;     /* Change horizontal position */
  z-index: 999999; /* Ensure it's on top */
}
```

### Styling
Override the default styles:

```css
#seo-mojo-embed-widget .widget-container {
  border-radius: 20px;        /* More rounded corners */
  box-shadow: 0 10px 40px rgba(0,0,0,0.3); /* Custom shadow */
}

#seo-mojo-embed-widget .analyze-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b); /* Red gradient */
}
```

### Content
Modify the widget content by editing `widget.html`:

```html
<div class="widget-features">
  <h4>Your Custom Title</h4>
  <ul class="features-list">
    <li>✅ Your custom feature</li>
    <li>✅ Another feature</li>
  </ul>
</div>
```

## Integration Examples

### WordPress
Add to your theme's `functions.php`:

```php
function add_seo_mojo_widget() {
    wp_enqueue_script('seo-mojo', 'https://your-cdn.com/seo-mojo/embed.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'add_seo_mojo_widget');
```

### React
Add to your main component:

```jsx
useEffect(() => {
  const script = document.createElement('script')
  script.src = 'https://your-cdn.com/seo-mojo/embed.js'
  script.async = true
  document.head.appendChild(script)
  
  return () => {
    document.head.removeChild(script)
  }
}, [])
```

### Vue.js
Add to your main component:

```javascript
mounted() {
  const script = document.createElement('script')
  script.src = 'https://your-cdn.com/seo-mojo/embed.js'
  script.async = true
  document.head.appendChild(script)
}
```

## Analytics Integration

### Google Analytics
The widget automatically tracks events if Google Analytics is loaded:

```javascript
// Events are automatically sent to gtag
gtag('event', 'seo_mojo_analyze', {
  custom_parameter: 'value'
})
```

### Custom Analytics
Track events with your analytics service:

```javascript
// Override the track function
window.SEOMojo.track = function(event, data) {
  // Send to your analytics service
  yourAnalytics.track(event, data)
}
```

## Performance

### Optimization
- **Lazy Loading**: Widget only loads when needed
- **Minimal Size**: ~15KB total (HTML + CSS + JS)
- **No Dependencies**: Pure JavaScript, no frameworks
- **CDN Ready**: Optimized for content delivery networks

### Loading Strategy
```html
<!-- Load asynchronously -->
<script src="embed.js" async></script>

<!-- Or load with defer -->
<script src="embed.js" defer></script>
```

## Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+

## Security

### Content Security Policy
If you use CSP, add these directives:

```
script-src 'self' https://your-cdn.com;
style-src 'self' 'unsafe-inline' https://your-cdn.com;
```

### Data Privacy
- No personal data is collected
- Analysis data is processed locally
- No tracking without explicit consent

## Troubleshooting

### Common Issues

**Widget not appearing**:
- Check if script loaded successfully
- Verify no JavaScript errors in console
- Ensure proper CSP configuration

**Analysis not working**:
- Verify main SEO Mojo app is accessible
- Check network connectivity
- Ensure popup blockers are disabled

**Styling conflicts**:
- Check for CSS conflicts with existing styles
- Use more specific selectors
- Override conflicting styles

### Debug Mode
Enable debug mode by adding this before the script:

```html
<script>
  window.SEOMojoDebug = true
</script>
<script src="embed.js"></script>
```

## Support

For issues or questions:
- Check browser console for errors
- Verify script loading and execution
- Test on different websites and browsers
- Review the main SEO Mojo documentation

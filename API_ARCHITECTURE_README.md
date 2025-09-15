# SEO Mojo API-First Architecture

## Overview

SEO Mojo has been redesigned with an API-first architecture to ensure scalability, maintainability, and future growth. This architecture separates concerns, enables microservices, and provides a solid foundation for building advanced features.

## Architecture Principles

### 1. **API-First Design**
- All functionality is exposed through well-defined REST APIs
- Frontend and backend are completely decoupled
- APIs are designed for external consumption from day one

### 2. **Service-Oriented Architecture**
- Each domain has its own service layer
- Services communicate through well-defined interfaces
- Easy to scale individual services independently

### 3. **Progressive Enhancement**
- Graceful degradation when APIs are unavailable
- Local storage fallback for offline functionality
- Seamless user experience regardless of connectivity

### 4. **Future-Proof Design**
- Easy to add new features without breaking existing functionality
- Support for multiple client types (web, mobile, desktop)
- Built-in extensibility for third-party integrations

## Project Structure

```
src/
├── api/                          # API Layer
│   ├── config.js                 # API configuration
│   ├── client.js                 # HTTP client with advanced features
│   ├── index.js                  # Centralized API exports
│   ├── schemas/                  # API schemas and validation
│   │   ├── auditSchema.js
│   │   └── leadSchema.js
│   ├── services/                 # Domain-specific API services
│   │   ├── auditService.js
│   │   ├── leadService.js
│   │   ├── reportService.js
│   │   ├── analyticsService.js
│   │   └── userService.js
│   └── tests/                    # API tests
│       ├── apiClient.test.js
│       └── services.test.js
├── services/                     # Business Logic Layer
│   ├── LeadService.js           # Original service (legacy)
│   └── LeadServiceAPI.js        # API-first service
└── components/                   # UI Components
    └── ...
```

## API Client Features

### Advanced HTTP Client
- **Automatic Retry**: Exponential backoff for failed requests
- **Rate Limiting**: Built-in rate limiting with queue management
- **Request/Response Interceptors**: Easy to add logging, auth, etc.
- **Timeout Handling**: Configurable timeouts with proper cleanup
- **Error Handling**: Comprehensive error handling with custom error types

### Request Features
```javascript
// Automatic retry with exponential backoff
const result = await apiClient.get('/audit/123')

// Rate limiting (automatic)
const results = await Promise.all([
  apiClient.get('/audit/1'),
  apiClient.get('/audit/2'),
  apiClient.get('/audit/3')
])

// File upload with progress
await apiClient.upload('/upload', file, {}, (progress) => {
  console.log(`Upload progress: ${progress}%`)
})

// Batch requests
const results = await apiClient.batch([
  { method: 'GET', endpoint: '/audit/1' },
  { method: 'GET', endpoint: '/audit/2' }
])
```

### Error Handling
```javascript
try {
  const result = await auditService.createAudit(data)
  if (result.success) {
    // Handle success
  } else {
    // Handle API error
    console.error(result.error)
  }
} catch (error) {
  // Handle network/system error
  console.error('Network error:', error.message)
}
```

## Service Layer Architecture

### Domain Services
Each domain has its own service with a consistent interface:

```javascript
// Audit Service
const audit = await auditService.createAudit(auditData)
const audit = await auditService.getAudit(auditId)
const audits = await auditService.listAudits(filters, pagination)
const result = await auditService.updateAudit(auditId, updateData)
const result = await auditService.deleteAudit(auditId)

// Lead Service
const lead = await leadService.createLead(leadData)
const lead = await leadService.getLead(leadId)
const leads = await leadService.listLeads(filters, pagination)
const analytics = await leadService.getLeadAnalytics()
const result = await leadService.exportLeads('csv')
```

### Consistent Response Format
All services return a consistent response format:

```javascript
// Success Response
{
  success: true,
  data: { /* response data */ },
  message: "Operation completed successfully"
}

// Error Response
{
  success: false,
  error: "Error message",
  status: 400,
  data: { /* additional error data */ }
}
```

## API Configuration

### Environment-Based Configuration
```javascript
// Development
const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY: { attempts: 3, delay: 1000 }
}

// Production
const API_CONFIG = {
  BASE_URL: 'https://api.seomojo.com/v1',
  TIMEOUT: 30000,
  RETRY: { attempts: 3, delay: 1000 }
}
```

### Rate Limiting
```javascript
const RATE_LIMIT = {
  requests: 100,        // 100 requests per window
  window: 60000         // 1 minute window
}
```

## Progressive Enhancement

### Offline Support
Services automatically fall back to localStorage when APIs are unavailable:

```javascript
// This will try API first, then localStorage
const leads = await leadService.getAllLeads()

// This will try API first, then localStorage
const analytics = await leadService.getAnalytics()
```

### Graceful Degradation
- **API Available**: Full functionality with real-time data
- **API Unavailable**: Cached data with limited functionality
- **Offline**: Local storage with basic functionality

## Testing Strategy

### Unit Tests
- **API Client**: Test HTTP methods, error handling, retry logic
- **Services**: Test business logic, API integration, fallbacks
- **Schemas**: Test data validation and transformation

### Integration Tests
- **API Integration**: Test actual API calls (with mocks)
- **Service Integration**: Test service interactions
- **Error Scenarios**: Test error handling and fallbacks

### Test Examples
```javascript
// API Client Test
describe('API Client', () => {
  it('should retry on network errors', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))
    global.fetch.mockResolvedValueOnce({ ok: true, json: () => ({}) })
    
    const result = await apiClient.get('/test')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})

// Service Test
describe('Lead Service', () => {
  it('should fallback to localStorage when API fails', async () => {
    apiClient.get.mockRejectedValueOnce(new Error('API unavailable'))
    
    const leads = await leadService.getAllLeads()
    expect(leads).toEqual(expect.any(Array))
  })
})
```

## Future Scalability

### Microservices Ready
The API-first design makes it easy to split into microservices:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Audit Service │    │   Lead Service  │    │ Report Service  │
│   (Port 3001)   │    │   (Port 3002)   │    │   (Port 3003)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  API Gateway    │
                    │  (Port 3000)    │
                    └─────────────────┘
```

### Third-Party Integrations
Easy to add integrations:

```javascript
// CRM Integration
const crmService = new CRMService(apiClient)
await crmService.syncLead(leadData)

// Analytics Integration
const analyticsService = new AnalyticsService(apiClient)
await analyticsService.trackEvent('audit_completed', auditData)
```

### Mobile App Support
The same APIs can power mobile apps:

```javascript
// React Native
import { auditService } from '@seomojo/api-client'

const audit = await auditService.createAudit({
  url: 'https://example.com',
  auditType: 'full'
})
```

## Migration Strategy

### Phase 1: API Implementation ✅
- [x] Create API client with advanced features
- [x] Implement service layer for all domains
- [x] Add comprehensive error handling
- [x] Create API documentation

### Phase 2: Service Integration
- [ ] Update existing services to use API layer
- [ ] Implement progressive enhancement
- [ ] Add offline support
- [ ] Create migration utilities

### Phase 3: Backend Implementation
- [ ] Implement actual API endpoints
- [ ] Add database integration
- [ ] Implement authentication
- [ ] Add rate limiting

### Phase 4: Advanced Features
- [ ] Add real-time updates (WebSockets)
- [ ] Implement webhooks
- [ ] Add API versioning
- [ ] Create SDKs for other languages

## Benefits

### 1. **Scalability**
- Easy to scale individual services
- Horizontal scaling with load balancers
- Microservices architecture ready

### 2. **Maintainability**
- Clear separation of concerns
- Easy to test individual components
- Consistent error handling

### 3. **Flexibility**
- Easy to add new features
- Support for multiple client types
- Third-party integration ready

### 4. **Developer Experience**
- Comprehensive documentation
- Type-safe API calls
- Excellent error messages
- Built-in testing utilities

### 5. **Future-Proof**
- API versioning support
- Backward compatibility
- Easy to migrate to microservices
- Support for new technologies

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API
```javascript
// src/api/config.js
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  // ... other config
}
```

### 3. Use Services
```javascript
import { auditService, leadService } from './api'

// Create audit
const audit = await auditService.createAudit({
  url: 'https://example.com',
  auditType: 'full'
})

// Create lead
const lead = await leadService.createLead({
  name: 'John Doe',
  email: 'john@example.com',
  auditId: audit.data.id
})
```

### 4. Run Tests
```bash
npm test
```

## Conclusion

The API-first architecture provides a solid foundation for SEO Mojo's future growth. It enables:

- **Rapid Development**: New features can be added quickly
- **Easy Scaling**: Services can be scaled independently
- **Multiple Clients**: Web, mobile, and desktop apps can use the same APIs
- **Third-Party Integration**: Easy to integrate with external services
- **Future-Proof**: Ready for microservices and new technologies

This architecture ensures SEO Mojo can grow and evolve while maintaining stability and performance.

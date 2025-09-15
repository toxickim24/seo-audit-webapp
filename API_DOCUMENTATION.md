# SEO Mojo API Documentation

## Overview

The SEO Mojo API is a RESTful API designed for scalability and future growth. It provides comprehensive endpoints for SEO auditing, lead management, report generation, analytics, and user management.

## Base URL

```
Production: https://api.seomojo.com/v1
Development: http://localhost:3001/api/v1
```

## Authentication

The API uses Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Rate Limiting

- **Rate Limit**: 100 requests per minute per user
- **Headers**: Rate limit information is included in response headers
- **Retry**: Automatic retry with exponential backoff for failed requests

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {}
}
```

## API Endpoints

### SEO Audits

#### Create Audit
```http
POST /audit
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "auditType": "full",
  "options": {
    "includeImages": true,
    "includeLinks": true,
    "includeSocial": true,
    "includeMobile": true,
    "includeAccessibility": true,
    "includePerformance": true,
    "includeSecurity": true,
    "maxPages": 10,
    "timeout": 60
  },
  "metadata": {
    "clientId": "client-123",
    "projectId": "project-456",
    "tags": ["seo", "audit"],
    "notes": "Initial audit for new client"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "audit-uuid",
    "url": "https://example.com",
    "status": "pending",
    "progress": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "results": null
  },
  "message": "Audit created successfully"
}
```

#### Get Audit
```http
GET /audit/{id}
```

**Query Parameters:**
- `includeDetails` (boolean): Include detailed results

#### List Audits
```http
GET /audit
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `sort` (string): Sort field (created_at, updated_at, url, score)
- `order` (string): Sort order (asc, desc)
- `status` (string): Filter by status
- `minScore` (integer): Minimum score filter
- `maxScore` (integer): Maximum score filter
- `url` (string): URL filter
- `tags` (array): Tag filters
- `dateFrom` (date): Start date filter
- `dateTo` (date): End date filter

#### Update Audit
```http
PUT /audit/{id}
```

#### Delete Audit
```http
DELETE /audit/{id}
```

#### Bulk Create Audits
```http
POST /audit/bulk
```

#### Export Audits
```http
GET /audit/export
```

**Query Parameters:**
- `format` (string): Export format (csv, json, xlsx)
- `filters` (object): Same as list audits

### Lead Management

#### Create Lead
```http
POST /leads
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "phone": "+1-555-123-4567",
  "website": "https://example.com",
  "auditId": "audit-uuid",
  "source": "seo_audit",
  "status": "new",
  "priority": "medium",
  "tags": ["hot-lead", "enterprise"],
  "customFields": {
    "industry": "Technology",
    "companySize": "50-100"
  },
  "notes": "Interested in comprehensive SEO audit",
  "assignedTo": "user-uuid"
}
```

#### Get Lead
```http
GET /leads/{id}
```

#### List Leads
```http
GET /leads
```

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `sort` (string): Sort field
- `order` (string): Sort order
- `status` (string): Filter by status
- `priority` (string): Filter by priority
- `source` (string): Filter by source
- `assignedTo` (string): Filter by assigned user
- `tags` (array): Tag filters
- `search` (string): Search in name, email, company
- `dateFrom` (date): Start date filter
- `dateTo` (date): End date filter

#### Update Lead
```http
PUT /leads/{id}
```

#### Delete Lead
```http
DELETE /leads/{id}
```

#### Bulk Update Leads
```http
PUT /leads/bulk
```

#### Export Leads
```http
GET /leads/export
```

#### Get Lead Analytics
```http
GET /leads/analytics
```

### Reports

#### Create Report
```http
POST /reports
```

#### Get Report
```http
GET /reports/{id}
```

#### List Reports
```http
GET /reports
```

#### Update Report
```http
PUT /reports/{id}
```

#### Delete Report
```http
DELETE /reports/{id}
```

#### Generate PDF
```http
POST /reports/{id}/pdf
```

#### Email Report
```http
POST /reports/{id}/email
```

### Analytics

#### Get Dashboard Analytics
```http
GET /analytics/dashboard
```

#### Get Metrics
```http
GET /analytics/metrics
```

**Query Parameters:**
- `type` (string): Metric type
- `period` (string): Time period
- `filters` (object): Additional filters

#### Get Trends
```http
GET /analytics/trends
```

#### Export Analytics
```http
GET /analytics/export
```

### User Management

#### Create User
```http
POST /users
```

#### Get User
```http
GET /users/{id}
```

#### List Users
```http
GET /users
```

#### Update User
```http
PUT /users/{id}
```

#### Delete User
```http
DELETE /users/{id}
```

#### Authenticate
```http
POST /users/auth
```

#### Get Profile
```http
GET /users/profile
```

#### Update Profile
```http
PUT /users/profile
```

## Webhooks

### Create Webhook
```http
POST /webhooks
```

### Get Webhook
```http
GET /webhooks/{id}
```

### List Webhooks
```http
GET /webhooks
```

### Update Webhook
```http
PUT /webhooks/{id}
```

### Delete Webhook
```http
DELETE /webhooks/{id}
```

### Test Webhook
```http
POST /webhooks/{id}/test
```

## SDKs and Libraries

### JavaScript/Node.js
```bash
npm install @seomojo/api-client
```

```javascript
import { SEOAuditAPI } from '@seomojo/api-client'

const api = new SEOAuditAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.seomojo.com/v1'
})

// Create audit
const audit = await api.audits.create({
  url: 'https://example.com',
  auditType: 'full'
})
```

### Python
```bash
pip install seomojo-api
```

```python
from seomojo import SEOAuditAPI

api = SEOAuditAPI(api_key='your-api-key')

# Create audit
audit = api.audits.create({
    'url': 'https://example.com',
    'auditType': 'full'
})
```

### PHP
```bash
composer require seomojo/api-client
```

```php
use SEOMojo\APIClient;

$api = new APIClient('your-api-key');

// Create audit
$audit = $api->audits->create([
    'url' => 'https://example.com',
    'auditType' => 'full'
]);
```

## Webhook Events

### Audit Events
- `audit.created` - New audit created
- `audit.started` - Audit started processing
- `audit.progress` - Audit progress updated
- `audit.completed` - Audit completed successfully
- `audit.failed` - Audit failed

### Lead Events
- `lead.created` - New lead created
- `lead.updated` - Lead updated
- `lead.status_changed` - Lead status changed
- `lead.assigned` - Lead assigned to user

### Report Events
- `report.created` - New report created
- `report.generated` - Report PDF generated
- `report.emailed` - Report sent via email

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 502 | Bad Gateway - Upstream service error |
| 503 | Service Unavailable - Service temporarily unavailable |

## Pagination

All list endpoints support pagination:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

- **Filtering**: Use query parameters to filter results
- **Sorting**: Use `sort` and `order` parameters
- **Search**: Use `search` parameter for text search
- **Date Ranges**: Use `dateFrom` and `dateTo` parameters

## Rate Limiting

- **Limit**: 100 requests per minute per API key
- **Headers**: Rate limit info in response headers
- **Retry**: Automatic retry with exponential backoff

## Webhooks

Webhooks allow you to receive real-time notifications:

1. **Create Webhook**: Register webhook endpoint
2. **Configure Events**: Select events to subscribe to
3. **Verify Signature**: Validate webhook authenticity
4. **Handle Events**: Process incoming webhook data

## SDK Examples

### Create and Monitor Audit

```javascript
// Create audit
const audit = await api.audits.create({
  url: 'https://example.com',
  auditType: 'full'
})

// Poll for completion
const checkStatus = async () => {
  const status = await api.audits.get(audit.id)
  if (status.data.status === 'completed') {
    console.log('Audit completed:', status.data.results)
  } else if (status.data.status === 'failed') {
    console.log('Audit failed:', status.data.error)
  } else {
    setTimeout(checkStatus, 5000) // Check again in 5 seconds
  }
}

checkStatus()
```

### Lead Management

```javascript
// Create lead
const lead = await api.leads.create({
  name: 'John Doe',
  email: 'john@example.com',
  auditId: audit.id,
  source: 'seo_audit'
})

// Update lead status
await api.leads.update(lead.id, {
  status: 'contacted',
  notes: 'Initial contact made'
})

// Get lead analytics
const analytics = await api.leads.getAnalytics({
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
})
```

## Support

- **Documentation**: https://docs.seomojo.com
- **API Status**: https://status.seomojo.com
- **Support**: support@seomojo.com
- **GitHub**: https://github.com/seomojo/api

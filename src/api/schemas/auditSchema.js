// SEO Audit API Schemas
export const auditSchemas = {
  // Create audit request schema
  createAudit: {
    type: 'object',
    required: ['url', 'auditType'],
    properties: {
      url: {
        type: 'string',
        format: 'uri',
        description: 'Website URL to audit'
      },
      auditType: {
        type: 'string',
        enum: ['full', 'quick', 'technical', 'content', 'performance'],
        description: 'Type of audit to perform'
      },
      options: {
        type: 'object',
        properties: {
          includeImages: { type: 'boolean', default: true },
          includeLinks: { type: 'boolean', default: true },
          includeSocial: { type: 'boolean', default: true },
          includeMobile: { type: 'boolean', default: true },
          includeAccessibility: { type: 'boolean', default: true },
          includePerformance: { type: 'boolean', default: true },
          includeSecurity: { type: 'boolean', default: true },
          maxPages: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          timeout: { type: 'integer', minimum: 30, maximum: 300, default: 60 }
        }
      },
      metadata: {
        type: 'object',
        properties: {
          clientId: { type: 'string' },
          projectId: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' }
        }
      }
    }
  },

  // Audit response schema
  auditResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      url: { type: 'string', format: 'uri' },
      status: {
        type: 'string',
        enum: ['pending', 'running', 'completed', 'failed', 'cancelled']
      },
      progress: { type: 'integer', minimum: 0, maximum: 100 },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      completedAt: { type: 'string', format: 'date-time' },
      results: {
        type: 'object',
        properties: {
          overallScore: { type: 'integer', minimum: 0, maximum: 100 },
          grade: { type: 'string', enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'] },
          categories: {
            type: 'object',
            properties: {
              onPage: { type: 'object' },
              technical: { type: 'object' },
              performance: { type: 'object' },
              accessibility: { type: 'object' },
              security: { type: 'object' },
              social: { type: 'object' }
            }
          },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                category: { type: 'string' },
                priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                title: { type: 'string' },
                description: { type: 'string' },
                impact: { type: 'string' },
                effort: { type: 'string' },
                status: { type: 'string', enum: ['open', 'in_progress', 'completed', 'dismissed'] }
              }
            }
          },
          metrics: {
            type: 'object',
            properties: {
              pageLoadTime: { type: 'number' },
              pageSize: { type: 'integer' },
              imageCount: { type: 'integer' },
              linkCount: { type: 'integer' },
              headingCount: { type: 'integer' },
              metaTagsCount: { type: 'integer' }
            }
          }
        }
      },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: { type: 'object' }
        }
      }
    }
  },

  // List audits query schema
  listAuditsQuery: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      sort: { type: 'string', enum: ['created_at', 'updated_at', 'url', 'score'], default: 'created_at' },
      order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
      status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
      minScore: { type: 'integer', minimum: 0, maximum: 100 },
      maxScore: { type: 'integer', minimum: 0, maximum: 100 },
      url: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' }
    }
  },

  // Update audit schema
  updateAudit: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
      progress: { type: 'integer', minimum: 0, maximum: 100 },
      results: { type: 'object' },
      metadata: {
        type: 'object',
        properties: {
          tags: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' }
        }
      }
    }
  },

  // Bulk create audits schema
  bulkCreateAudits: {
    type: 'object',
    required: ['audits'],
    properties: {
      audits: {
        type: 'array',
        items: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri' },
            auditType: { type: 'string', enum: ['full', 'quick', 'technical', 'content', 'performance'] },
            options: { type: 'object' },
            metadata: { type: 'object' }
          }
        }
      }
    }
  },

  // Audit statistics schema
  auditStats: {
    type: 'object',
    properties: {
      total: { type: 'integer' },
      completed: { type: 'integer' },
      pending: { type: 'integer' },
      running: { type: 'integer' },
      failed: { type: 'integer' },
      averageScore: { type: 'number' },
      scoreDistribution: {
        type: 'object',
        properties: {
          'A+': { type: 'integer' },
          'A': { type: 'integer' },
          'B+': { type: 'integer' },
          'B': { type: 'integer' },
          'C+': { type: 'integer' },
          'C': { type: 'integer' },
          'D': { type: 'integer' },
          'F': { type: 'integer' }
        }
      },
      topIssues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            issue: { type: 'string' },
            count: { type: 'integer' },
            impact: { type: 'string' }
          }
        }
      },
      trends: {
        type: 'object',
        properties: {
          daily: { type: 'array', items: { type: 'object' } },
          weekly: { type: 'array', items: { type: 'object' } },
          monthly: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  }
}

export default auditSchemas

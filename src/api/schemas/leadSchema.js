// Lead Management API Schemas
export const leadSchemas = {
  // Create lead request schema
  createLead: {
    type: 'object',
    required: ['name', 'email', 'auditId'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: 'Lead name'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Lead email address'
      },
      company: {
        type: 'string',
        maxLength: 255,
        description: 'Company name'
      },
      phone: {
        type: 'string',
        pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
        description: 'Phone number'
      },
      website: {
        type: 'string',
        format: 'uri',
        description: 'Company website'
      },
      auditId: {
        type: 'string',
        format: 'uuid',
        description: 'Associated audit ID'
      },
      source: {
        type: 'string',
        enum: ['seo_audit', 'contact_form', 'referral', 'social_media', 'advertising', 'other'],
        default: 'seo_audit'
      },
      status: {
        type: 'string',
        enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
        default: 'new'
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Lead tags for categorization'
      },
      customFields: {
        type: 'object',
        description: 'Custom field values'
      },
      notes: {
        type: 'string',
        description: 'Additional notes about the lead'
      },
      assignedTo: {
        type: 'string',
        format: 'uuid',
        description: 'User ID of assigned team member'
      }
    }
  },

  // Lead response schema
  leadResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      company: { type: 'string' },
      phone: { type: 'string' },
      website: { type: 'string', format: 'uri' },
      auditId: { type: 'string', format: 'uuid' },
      source: { type: 'string' },
      status: { type: 'string' },
      priority: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      customFields: { type: 'object' },
      notes: { type: 'string' },
      assignedTo: { type: 'string', format: 'uuid' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      lastContactedAt: { type: 'string', format: 'date-time' },
      auditData: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri' },
          score: { type: 'integer', minimum: 0, maximum: 100 },
          grade: { type: 'string' },
          completedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },

  // List leads query schema
  listLeadsQuery: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      sort: { type: 'string', enum: ['created_at', 'updated_at', 'name', 'email', 'status', 'priority'], default: 'created_at' },
      order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
      status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      source: { type: 'string', enum: ['seo_audit', 'contact_form', 'referral', 'social_media', 'advertising', 'other'] },
      assignedTo: { type: 'string', format: 'uuid' },
      tags: { type: 'array', items: { type: 'string' } },
      search: { type: 'string', description: 'Search in name, email, company' },
      dateFrom: { type: 'string', format: 'date' },
      dateTo: { type: 'string', format: 'date' }
    }
  },

  // Update lead schema
  updateLead: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      email: { type: 'string', format: 'email' },
      company: { type: 'string', maxLength: 255 },
      phone: { type: 'string', pattern: '^[+]?[0-9\\s\\-\\(\\)]+$' },
      website: { type: 'string', format: 'uri' },
      source: { type: 'string', enum: ['seo_audit', 'contact_form', 'referral', 'social_media', 'advertising', 'other'] },
      status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] },
      priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      tags: { type: 'array', items: { type: 'string' } },
      customFields: { type: 'object' },
      notes: { type: 'string' },
      assignedTo: { type: 'string', format: 'uuid' }
    }
  },

  // Bulk update leads schema
  bulkUpdateLeads: {
    type: 'object',
    required: ['updates'],
    properties: {
      updates: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            data: { type: 'object' }
          }
        }
      }
    }
  },

  // Lead analytics schema
  leadAnalytics: {
    type: 'object',
    properties: {
      total: { type: 'integer' },
      byStatus: {
        type: 'object',
        properties: {
          new: { type: 'integer' },
          contacted: { type: 'integer' },
          qualified: { type: 'integer' },
          proposal: { type: 'integer' },
          negotiation: { type: 'integer' },
          closed_won: { type: 'integer' },
          closed_lost: { type: 'integer' }
        }
      },
      byPriority: {
        type: 'object',
        properties: {
          low: { type: 'integer' },
          medium: { type: 'integer' },
          high: { type: 'integer' },
          urgent: { type: 'integer' }
        }
      },
      bySource: {
        type: 'object',
        properties: {
          seo_audit: { type: 'integer' },
          contact_form: { type: 'integer' },
          referral: { type: 'integer' },
          social_media: { type: 'integer' },
          advertising: { type: 'integer' },
          other: { type: 'integer' }
        }
      },
      conversionRate: { type: 'number', minimum: 0, maximum: 100 },
      averageScore: { type: 'number', minimum: 0, maximum: 100 },
      topPerformingAudits: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            score: { type: 'integer' },
            leadCount: { type: 'integer' }
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
  },

  // Lead note schema
  leadNote: {
    type: 'object',
    required: ['note'],
    properties: {
      note: {
        type: 'string',
        minLength: 1,
        maxLength: 1000,
        description: 'Note content'
      },
      type: {
        type: 'string',
        enum: ['general', 'call', 'email', 'meeting', 'follow_up'],
        default: 'general'
      },
      isPrivate: {
        type: 'boolean',
        default: false,
        description: 'Whether the note is private to the creator'
      }
    }
  },

  // Lead timeline schema
  leadTimeline: {
    type: 'object',
    properties: {
      events: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['created', 'updated', 'status_changed', 'note_added', 'contacted', 'assigned'] },
            description: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string' }
              }
            },
            data: { type: 'object' }
          }
        }
      }
    }
  }
}

export default leadSchemas

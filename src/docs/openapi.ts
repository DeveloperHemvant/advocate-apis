export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'NewAdvocate API',
    version: '1.0.0',
    description:
      'API for advocate onboarding, authentication, and admin management for the NewAdvocate app.',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local dev',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      AdvocateUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string' },
          phone: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['ADVOCATE', 'ADMIN'] },
          profileStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          barId: { type: 'string', nullable: true },
          experienceYears: { type: 'integer', nullable: true },
          practiceAreas: { type: 'array', items: { type: 'string' } },
          city: { type: 'string', nullable: true },
          state: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'fullName', 'role', 'profileStatus', 'createdAt', 'updatedAt'],
      },
      PaginatedAdvocates: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/AdvocateUser' },
          },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
        },
        required: ['items', 'total', 'page', 'pageSize'],
      },
      SettingsResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                value: { type: 'string' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              required: ['key', 'value', 'updatedAt'],
            },
          },
        },
        required: ['items'],
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register advocate',
        description: 'Onboard a new advocate. Profile is created with PENDING status.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  barId: { type: 'string' },
                  experienceYears: { type: 'integer' },
                  practiceAreas: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  city: { type: 'string' },
                  state: { type: 'string' },
                },
                required: ['email', 'password', 'fullName'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Advocate created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdvocateUser' },
              },
            },
          },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login as advocate',
        description: 'Login using email or phone + password as an advocate.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  emailOrPhone: { type: 'string' },
                  password: { type: 'string' },
                },
                required: ['password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    user: { $ref: '#/components/schemas/AdvocateUser' },
                  },
                  required: ['accessToken', 'refreshToken', 'user'],
                },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
                required: ['refreshToken'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'New access and refresh tokens',
          },
          '401': { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/api/advocates/me': {
      get: {
        tags: ['Advocates'],
        summary: 'Get current advocate profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdvocateUser' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      put: {
        tags: ['Advocates'],
        summary: 'Update current advocate profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  barId: { type: 'string' },
                  experienceYears: { type: 'integer' },
                  practiceAreas: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  city: { type: 'string' },
                  state: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated profile',
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/login': {
      post: {
        tags: ['Admin'],
        summary: 'Admin login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Admin login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/admin/advocates': {
      get: {
        tags: ['Admin'],
        summary: 'List advocates',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
          },
          {
            in: 'query',
            name: 'pageSize',
            schema: { type: 'integer', default: 20 },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated advocates',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedAdvocates' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/advocates/{id}/status': {
      patch: {
        tags: ['Admin'],
        summary: 'Update advocate status',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PENDING', 'APPROVED', 'REJECTED'],
                  },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Status updated' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Advocate not found' },
        },
      },
    },
    '/api/admin/settings': {
      get: {
        tags: ['Admin'],
        summary: 'Get app settings',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Settings list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SettingsResponse' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      put: {
        tags: ['Admin'],
        summary: 'Update app settings',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  settings: {
                    type: 'object',
                    additionalProperties: { type: 'string' },
                  },
                },
                required: ['settings'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Settings updated' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
  },
} as const;


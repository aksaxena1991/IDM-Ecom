const error400 = {
  description: 'Validation error',
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorDetail' } } },
};
const error404 = {
  description: 'Resource not found',
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorDetail' } } },
};
const error409 = {
  description: 'Conflict (unique constraint or referential block)',
  content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorDetail' } } },
};

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  description: 'Resource UUID',
};

export const openApiPaths = {
  '/healthz': {
    get: {
      tags: ['Health'],
      summary: 'Liveness probe',
      operationId: 'getHealthz',
      responses: {
        '200': {
          description: 'Service is running',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
      },
    },
  },
  '/readyz': {
    get: {
      tags: ['Health'],
      summary: 'Readiness probe (database connectivity)',
      operationId: 'getReadyz',
      responses: {
        '200': {
          description: 'Service and database are ready',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
        '503': {
          description: 'Database unavailable',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' },
            },
          },
        },
      },
    },
  },
  '/api/v1/categories': {
    get: {
      tags: ['Categories'],
      summary: 'List categories',
      operationId: 'listCategories',
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: { $ref: '#/components/schemas/CategoryStatus' },
        },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        {
          name: 'parentId',
          in: 'query',
          schema: { type: 'string', format: 'uuid' },
          description: 'Filter by parent UUID, or use the literal `null` for root categories.',
        },
        {
          name: 'parent_id',
          in: 'query',
          schema: { type: 'string' },
          description: 'Alias for parentId.',
        },
      ],
      responses: {
        '200': {
          description: 'Category list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryList' },
            },
          },
        },
        '400': error400,
      },
    },
    post: {
      tags: ['Categories'],
      summary: 'Create category',
      operationId: 'createCategory',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CategoryCreate' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Created category',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        '400': error400,
        '409': error409,
      },
    },
  },
  '/api/v1/categories/{id}': {
    get: {
      tags: ['Categories'],
      summary: 'Get category by ID',
      operationId: 'getCategoryById',
      parameters: [idParam],
      responses: {
        '200': {
          description: 'Category',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        '400': error400,
        '404': error404,
      },
    },
    put: {
      tags: ['Categories'],
      summary: 'Replace category',
      operationId: 'replaceCategory',
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CategoryCreate' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated category',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
    patch: {
      tags: ['Categories'],
      summary: 'Partially update category',
      operationId: 'updateCategory',
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CategoryUpdate' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated category',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
    delete: {
      tags: ['Categories'],
      summary: 'Soft-delete category',
      operationId: 'deleteCategory',
      description:
        'Returns 409 if the category has child categories or linked products.',
      parameters: [idParam],
      responses: {
        '204': { description: 'Deleted' },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
  },
  '/api/v1/brands': {
    get: {
      tags: ['Brands'],
      summary: 'List brands',
      operationId: 'listBrands',
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: { $ref: '#/components/schemas/BrandStatus' },
        },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        {
          name: 'isVerified',
          in: 'query',
          schema: { type: 'string', enum: ['true', 'false'] },
        },
      ],
      responses: {
        '200': {
          description: 'Brand list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BrandList' },
            },
          },
        },
        '400': error400,
      },
    },
    post: {
      tags: ['Brands'],
      summary: 'Create brand',
      operationId: 'createBrand',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/BrandCreate' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Created brand',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Brand' },
            },
          },
        },
        '400': error400,
        '409': error409,
      },
    },
  },
  '/api/v1/brands/{id}': {
    get: {
      tags: ['Brands'],
      summary: 'Get brand by ID',
      operationId: 'getBrandById',
      parameters: [idParam],
      responses: {
        '200': {
          description: 'Brand',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Brand' },
            },
          },
        },
        '400': error400,
        '404': error404,
      },
    },
    put: {
      tags: ['Brands'],
      summary: 'Replace brand',
      operationId: 'replaceBrand',
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/BrandCreate' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated brand',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Brand' },
            },
          },
        },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
    patch: {
      tags: ['Brands'],
      summary: 'Partially update brand',
      operationId: 'updateBrand',
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/BrandUpdate' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated brand',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Brand' },
            },
          },
        },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
    delete: {
      tags: ['Brands'],
      summary: 'Soft-delete brand',
      operationId: 'deleteBrand',
      description: 'Returns 409 if products still reference the brand.',
      parameters: [idParam],
      responses: {
        '204': { description: 'Deleted' },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
  },
  '/api/v1/products': {
    get: {
      tags: ['Products'],
      summary: 'List products',
      operationId: 'listProducts',
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: { $ref: '#/components/schemas/ProductStatus' },
        },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        {
          name: 'categoryId',
          in: 'query',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'brandId',
          in: 'query',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'isFeatured',
          in: 'query',
          schema: { type: 'string', enum: ['true', 'false'] },
        },
      ],
      responses: {
        '200': {
          description: 'Product list',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductList' },
            },
          },
        },
        '400': error400,
      },
    },
    post: {
      tags: ['Products'],
      summary: 'Create product',
      operationId: 'createProduct',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProductCreate' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Created product',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        '400': error400,
        '409': error409,
      },
    },
  },
  '/api/v1/products/{id}': {
    get: {
      tags: ['Products'],
      summary: 'Get product by ID',
      operationId: 'getProductById',
      parameters: [idParam],
      responses: {
        '200': {
          description: 'Product',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        '400': error400,
        '404': error404,
      },
    },
    put: {
      tags: ['Products'],
      summary: 'Replace product',
      operationId: 'replaceProduct',
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProductCreate' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated product',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
    patch: {
      tags: ['Products'],
      summary: 'Partially update product',
      operationId: 'updateProduct',
      parameters: [idParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProductUpdate' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated product',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' },
            },
          },
        },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
    delete: {
      tags: ['Products'],
      summary: 'Soft-delete product',
      operationId: 'deleteProduct',
      description: 'Returns 409 if the product still has variants.',
      parameters: [idParam],
      responses: {
        '204': { description: 'Deleted' },
        '400': error400,
        '404': error404,
        '409': error409,
      },
    },
  },
} as const;

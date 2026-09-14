import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/core/filters/all-exceptions.filter';
import { TransformInterceptor } from '../src/core/interceptors/transform.interceptor';
import { createValidationPipe } from '../src/core/pipes/validation.pipe';

describe('Enterprise Core API E2E Integration Suite', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let userAccessToken: string;
  let refreshToken: string;
  let createdSampleId: string;
  const getHttpServer = () =>
    app.getHttpServer() as unknown as Parameters<typeof request>[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication (/api/v1/auth)', () => {
    it('POST /api/v1/auth/login - authenticates SUPER_ADMIN and returns JWT tokens with user profile', async () => {
      const response = await request(getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin@123456',
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('admin@example.com');
      expect(response.body.data.user.role).toBe('SUPER_ADMIN');

      adminAccessToken = response.body.data.accessToken;
    });

    it('POST /api/v1/auth/login - authenticates USER and returns tokens', async () => {
      const response = await request(getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'User@123456',
        })
        .expect(200);

      expect(response.body.data.user.email).toBe('user@example.com');
      expect(response.body.data.user.role).toBe('USER');

      userAccessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('POST /api/v1/auth/login - rejects invalid credentials with 401 Unauthorized', async () => {
      const response = await request(getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBe('Invalid email or password');
    });

    it('POST /api/v1/auth/register - registers new user with 201 Created', async () => {
      const response = await request(getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser.e2e@example.com',
          password: 'Password@123456',
          displayName: 'E2E User',
        })
        .expect(201);

      expect(response.body.data.user.email).toBe('newuser.e2e@example.com');
      expect(response.body.data.user.role).toBe('USER');
    });

    it('POST /api/v1/auth/register - rejects duplicate email with 409 Conflict', async () => {
      await request(getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'Password@123456',
        })
        .expect(409);
    });

    it('POST /api/v1/auth/refresh - exchanges refresh token for new access token', async () => {
      const response = await request(getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe('user@example.com');
    });

    it('GET /api/v1/auth/me - returns authenticated user profile with Bearer token', async () => {
      const response = await request(getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.data.email).toBe('admin@example.com');
      expect(response.body.data.role).toBe('SUPER_ADMIN');
    });

    it('GET /api/v1/auth/me - rejects unauthenticated request with 401 Unauthorized', async () => {
      await request(getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });

  describe('RBAC Catalog (/api/v1/roles & /api/v1/permissions)', () => {
    it('GET /api/v1/roles - returns role catalog', async () => {
      const response = await request(getHttpServer())
        .get('/api/v1/roles')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      const roleNames = response.body.data.map((r: { name: string }) => r.name);
      expect(roleNames).toContain('SUPER_ADMIN');
      expect(roleNames).toContain('USER');
    });

    it('GET /api/v1/permissions - returns CASL permissions catalog', async () => {
      const response = await request(getHttpServer())
        .get('/api/v1/permissions')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      const subjects = response.body.data.map(
        (p: { subject: string }) => p.subject,
      );
      expect(subjects).toContain('sample');
      expect(subjects).toContain('users');
    });
  });

  describe('User Management RBAC Guard (/api/v1/users)', () => {
    it('GET /api/v1/users - allows SUPER_ADMIN access', async () => {
      const response = await request(getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/v1/users - blocks regular USER with 403 Forbidden', async () => {
      await request(getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403);
    });
  });

  describe('Sample CRUD Lifecycle (/api/v1/samples)', () => {
    it('POST /api/v1/samples - creates a new sample item with UUID v4 ID', async () => {
      const response = await request(getHttpServer())
        .post('/api/v1/samples')
        .send({
          name: 'Enterprise Starter Sample',
          description: 'Verified via E2E Integration Suite',
          price: 199.99,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Enterprise Starter Sample');
      expect(response.body.data.price).toBe(199.99);
      expect(response.body.data.status).toBe('ACTIVE');

      createdSampleId = response.body.data.id;
    });

    it('GET /api/v1/samples - lists samples with pagination metadata', async () => {
      const response = await request(getHttpServer())
        .get('/api/v1/samples')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.totalItems).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/samples/:id - retrieves created sample by ID', async () => {
      const response = await request(getHttpServer())
        .get(`/api/v1/samples/${createdSampleId}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdSampleId);
      expect(response.body.data.name).toBe('Enterprise Starter Sample');
    });

    it('PUT /api/v1/samples/:id - updates sample item details', async () => {
      const response = await request(getHttpServer())
        .put(`/api/v1/samples/${createdSampleId}`)
        .send({
          name: 'Enterprise Starter Sample (Updated)',
          price: 249.99,
        })
        .expect(200);

      expect(response.body.data.name).toBe(
        'Enterprise Starter Sample (Updated)',
      );
      expect(response.body.data.price).toBe(249.99);
    });

    it('DELETE /api/v1/samples/:id - removes sample item', async () => {
      const response = await request(getHttpServer())
        .delete(`/api/v1/samples/${createdSampleId}`)
        .expect(200);

      expect(response.body.data.success).toBe(true);

      await request(getHttpServer())
        .get(`/api/v1/samples/${createdSampleId}`)
        .expect(404);
    });
  });
});

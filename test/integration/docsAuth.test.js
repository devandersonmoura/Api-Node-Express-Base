const request = require('supertest');

let app;

beforeAll(() => {
  app = require('../../src/index');
});

function basic(user, pass) {
  const token = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${token}`;
}

describe('Swagger /docs protection', () => {
  test('requires basic auth', async () => {
    const res = await request(app).get('/docs');
    expect(res.status).toBe(401);
  });

  test('works with default admin/admin', async () => {
    const res = await request(app).get('/docs').set('Authorization', basic('admin', 'admin'));
    expect([200, 301, 302]).toContain(res.status);
  });
});


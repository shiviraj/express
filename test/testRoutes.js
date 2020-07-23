const request = require('supertest');
const { app } = require('../src/routes');

describe('GET', () => {
  context('/', () => {
    it('should serve the home page', async () => {
      await request(app)
        .get('/')
        .expect(200)
        .expect(/Express/);
    });
  });

  context('/dashboard', () => {
    it('should serve the dashboard', async () => {
      await request(app)
        .get('/dashboard')
        .expect(200)
        .expect(/Express/);
    });
  });
});
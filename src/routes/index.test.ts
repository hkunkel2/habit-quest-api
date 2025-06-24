import request from 'supertest';
import express from 'express';
import router from './index';

const app = express();
app.use('/', router);

describe('GET /', () => {
  it('responds with JSON message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Hello from Lambda Express API!' });
  });
});

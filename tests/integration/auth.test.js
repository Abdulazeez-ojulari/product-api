const mongoose = require('mongoose');
const {User} = require('../../models/user.model.js')(mongoose);
const {Product} = require('../../models/product.model.js');
const request = require('supertest');

describe('auth middleware', () => {
  beforeEach(() => { server = require('../../server'); })
  afterEach(async () => { 
    await Product.remove({});
    await server.close(); 
  });

  let token; 

  const exec = () => {
    return request(server)
      .post('/api/products')
      .set('xauthtoken', token)
      .send({ name: 'product1' });
  }

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it('should return 401 if no token is provided', async () => {
    token = ''; 

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'a'; 

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
const mongoose = require('mongoose');
const request = require('supertest');
const {Product} = require('../../models/product.model.js')(mongoose);
const {User} = require('../../models/user.model.js')(mongoose);


let server;

describe('/api/products', () => {
  beforeEach(() => { server = require('../../server'); })
  afterEach(async () => { 
    await server.close(); 
    await Product.remove({});
  });

  describe('GET /', () => {
    it('should return all products', async () => {
      const genres = [
        { name: 'product1' },
        { name: 'product2' },
      ];
      
      await Product.collection.insertMany(genres);

      const res = await request(server).get('/api/products');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(p => p.name === 'product1')).toBeTruthy();
      expect(res.body.some(p => p.name === 'product2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return a product if valid id is passed', async () => {
      const product = new Product({ name: 'product1' });
      await product.save();

      const res = await request(server).get('/api/products/' + product.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', product.name);     
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/products/1');

      expect(res.status).toBe(404);
    });

    it('should return 404 if no product with the given id exists', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/api/products/' + id);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {

    // Define the happy path, and then in each test, we change 
    // one parameter that clearly aligns with the name of the 
    // test. 
    let token; 
    let name; 

    const exec = async () => {
      return await request(server)
        .post('/api/products')
        .set('xauthtoken', token)
        .send({ name });
    }

    beforeEach(() => {
      token = new User().generateAuthToken();      
      name = 'product1'; 
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if product is less than 5 characters', async () => {
      name = '1234'; 
      
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if product is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the product if it is valid', async () => {
      await exec();

      const product = await Product.find({ name: 'product1' });

      expect(product).not.toBeNull();
    });

    it('should return the product if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'product1');
    });
  });

  describe('PUT /:id', () => {
    let token; 
    let newName; 
    let product; 
    let id; 

    const exec = async () => {
      return await request(server)
        .put('/api/products/' + id)
        .set('xauthtoken', token)
        .send({ name: newName });
    }

    beforeEach(async () => {
      // Before each test we need to create a product and 
      // put it in the database.      
      product = new Product({ name: 'product1' });
      await product.save();
      
      token = new User().generateAuthToken();     
      id = product.id; 
      newName = 'updatedName'; 
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if product is less than 5 characters', async () => {
      newName = '1234'; 
      
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if product is more than 50 characters', async () => {
      newName = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if product with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the product if input is valid', async () => {
      await exec();

      const updatedProduct = await Product.findById(product._id);

      expect(updatedProduct.name).toBe(newName);
    });

    it('should return the updated product if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newName);
    });
  });  

  describe('DELETE /:id', () => {
    let token; 
    let product; 
    let id; 

    const exec = async () => {
      return await request(server)
        .delete('/api/products/' + id)
        .set('xauthtoken', token)
        .send();
    }

    beforeEach(async () => {
      // Before each test we need to create a product and 
      // put it in the database.      
      product = new Product({ name: 'product1' });
      await product.save();
      
      id = product._id; 
      token = new User({ isAdmin: true }).generateAuthToken();     
    })

    it('should return 401 if client is not logged in', async () => {
      token = ''; 

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not an admin', async () => {
      token = new User({ isAdmin: false }).generateAuthToken(); 

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = 1; 
      
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no product with the given id was found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the product if input is valid', async () => {
      await exec();

      const productInDb = await Product.findById(id);

      expect(productInDb).toBeNull();
    });

    it('should return the removed product', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('id', product.id.toHexString());
      expect(res.body).toHaveProperty('name', product.name);
    });
  });  
});
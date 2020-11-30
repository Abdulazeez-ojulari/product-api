const auth = require('../middleware/auth.js');
const authAdmin = require('../middleware/authAdmin.js');
module.exports = app =>{
	const products = require("../controllers/product.controller.js");

  let router = require("express").Router();

  // Create a new Product
  router.post("/", products.create);

  // Retrieve all Products
  router.get("/", products.findAll);

  // Retrieve a single Product with id
  router.get("/:id", products.findOne);

  // Update a Product with id
  router.put("/:id", [auth, authAdmin], products.update);

  // Delete a Product with id
  router.delete("/:id", [auth, authAdmin], products.delete);

  // Create a new Product
  router.delete("/", [auth, authAdmin], products.deleteAll);

  app.use('/api/products', router);
}
const _ = require('lodash');
const Joi = require('joi');
const db = require("../models");
const Product = db.products;

// Create and Save a new Product
exports.create = (req, res) => {
	// Validate request
	const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
    
  // Create a Product
  const product = new Product(_.pick(req.body, ['name', 'image', 'price', 'isAdmin']));

  // Save Product in the database
  product
    .save(product)
    .then(data => {
      return res.send(data);
    })
    .catch(err => {
    	console.log(err)
      return res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Product."
      });
    });
  
};

// Retrieve all Products from the database.
exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

  Product.find(condition)
    .then(data => {
      return res.send(data);
    })
    .catch(err => {
    	console.log(err);
      return res.status(500).send({
        message:
          "Some error occurred while retrieving products."
      });
    });
};

// Find a single Product with an id
exports.findOne = (req, res) => {
	const id = req.params.id;

  Product.findById(id)
    .then(data => {
      if (!data)
        return res.status(404).send({ message: "Not found Product with id " + id });
      else return res.send(data);
    })
    .catch(err => {
      return res
        .status(500)
        .send({ message: "Error retrieving Product with id=" + id });
    });
  
};

// Update a Product by the id in the request
exports.update = (req, res) => {
  
  if (!req.body) return res.status(400).send(error.details[0].message);
    

  const id = req.params.id;

  Product.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot update Product with id=${id}. Maybe Product was not found!`
        });
      } else return res.send({ message: "Product was updated successfully." });
    })
    .catch(err => {
      return res.status(500).send({
        message: "Error updating Product with id=" + id
      });
    });
};

// Delete a Product with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Product.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: `Cannot delete Product with id=${id}. Maybe Product was not found!`
        });
      } else {
        return res.send({
          message: "Product was deleted successfully!"
        });
      }
    })
    .catch(err => {
      return res.status(500).send({
        message: "Could not delete Product with id=" + id
      });
    });
};

// Delete all Products from the database.
exports.deleteAll = (req, res) => {
  Product.deleteMany({})
    .then(data => {
      return res.send({
        message: `${data.deletedCount} Products were deleted successfully!`
      });
    })
    .catch(err => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Products."
      });
    });
};


function validate(product){
	const schema = Joi.object({
		name: Joi.string().min(3).max(100).required(),
		image: Joi.string().min(10).required(),
		price: Joi.number().min(0).required(),		
	})

	return schema.validate(product);

}
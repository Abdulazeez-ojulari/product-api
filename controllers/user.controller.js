const auth = require('../middleware/auth.js');
const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require('lodash');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const db = require("../models");
const User = db.users;

exports.create = async (req, res) => {

	const { error } = validate(req.body);
	if(error) return res.status(400).send(error.details[0].message);

	User.findOne({ email: req.body.email })
	.then(data => {
		if(data) return res.status(404).send({ message: "Email already exists" })
	})

	const user = new User(_.pick(req.body, ['name', 'email', 'password']));

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	

	user.save(user)
	.then(data => {
		const token = user.genrateAuthToken();
		res.set('xauthtoken', token)
		res.set('Access-Control-Expose-Headers', 'xauthtoken')
		res.send(_.pick(data, ['id', 'name', 'email']));
	})
	.catch(err => {
		console.log(err);
		return res.status(500).send({ message: "Error occured while creating your user account "})
	});

};

// exports.findAll = (req, res) => {
// 	User.find()
// 	.then(data => {
// 		return res.send(data);
// 	})
// 	.catch(err => {
// 		console.log(err);
// 		return res.status(500).send({ message: "Some error occured while retriving users"})
// 	})
// }

exports.findOne = async (req, res) => {
	const id = req.user.id;
	const user = await User.findById(id).select('-password');
	if(!user) return res.status(400).send({ message: `User with id ${id} not found`});

	res.send(user);
};

// exports.update = (req, res) => {
// 	if(!req.body){
// 		return res.status(400).send({ message: 'Content cannot be empty'})
// 	};

// 	const id = req.params.id;
// 	User.findByIdAndUpdate()
// 	.then(data => {
// 		if(!data)
// 			return res.status(404).send({ message: `Could not update user with ${id}`})
// 		else return res.send(data);
// 	})
// 	.catch(err => {
// 		return res.status(500).send({ message: "Could not update user" })
// 	})
// };


function validate(user){
	const schema = Joi.object({
		name: Joi.string().min(3).max(50).required(),
		email: Joi.string().min(10).max(255).required().email(),
		password: Joi.string().min(6).max(255).required()
	})

	return schema.validate(user);
}
















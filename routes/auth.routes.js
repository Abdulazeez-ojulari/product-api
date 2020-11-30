const Joi = require('joi');
const db = require('../models');
const bcrypt = require('bcrypt');
const User = db.users;

function validate(req){
	const schema = Joi.object({
		email: Joi.string().min(10).max(255).required().email(),
		password: Joi.string().min(6).max(255).required()
	})

	return schema.validate(req);
}

module.exports = app => {

	let router = require('express').Router();

	router.post('/', async (req, res) => {

		const { error } = validate(req.body);
		if(error) return res.status(400).send(error.details[0].message);

		let user = await User.findOne({ email: req.body.email });
		if(!user) return res.status(400).send({ message: "Invalid email or password" })
		

		const validPassword = await bcrypt.compare(req.body.password, user.password);
		if(!validPassword) return res.status(400).send({ message: "Invalid email or password" });

		const token = user.genrateAuthToken();
		res.set('xauthtoken', token)
		res.set('Access-Control-Expose-Headers', 'xauthtoken')
		res.send(user);

	});

	app.use("/api/auth", router);
}
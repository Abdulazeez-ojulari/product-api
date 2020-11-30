const user = require("../controllers/user.controller.js");
const auth = require("../middleware/auth.js");

module.exports = app =>{

	let router = require('express').Router();

	router.post('/', user.create);

	router.get('/me', auth, user.findOne);

	app.use('/api/users', router);
}
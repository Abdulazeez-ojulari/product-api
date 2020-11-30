const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = mongoose => {
	let schema = mongoose.Schema({
		name: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 50,
			trim: true
		},
		email:{
			type: String,
			required: true,
			minlength: 10,
			maxlength: 255,
			unique: true 
		},
		password:{
			type: String,
			required: true,
			minlength: 6,
			maxlength: 1024
		},
		isAdmin: {
			type: Boolean,
			default: false
		}
	})

	schema.method("toJSON", function() {
	    const { __v, _id, ...object } = this.toObject();
	    object.id = _id;
	    return object;
	});

	schema.methods.genrateAuthToken = function(){
		const token = jwt.sign({id: this.id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
		return token
	}

	const User = mongoose.model('user', schema);
	return User
}
const mongoose = require('mongoose');

var formSubmitSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	ip: String,
	url: {
		type: String,
		default: "No URL Provided"
	},
	userAgent: {
		type: String,
		default: "No UserAgent Provided"
	},
	cookies: {
		type: String,
		default: "No cookies"
	},
	formData: {
		type: Array,
		default: "Forms empty"
	},
	created: { 
		type: Date,
		default: Date.now
	}, 
	md5cookie: {
		type: String,
		default: "Error generating md5cookie"
	}
})

module.exports = mongoose.model('FormSubmit', formSubmitSchema );

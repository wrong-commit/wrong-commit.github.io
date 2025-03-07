const mongoose = require('mongoose');

var pageVisitSchema = mongoose.Schema({
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
	OS: {
		type: String,
		default: "No Operating System Porvided"
	},
	cookies: {
		type: String,
		default: "No cookies"
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

module.exports = mongoose.model('PageVisit', pageVisitSchema );

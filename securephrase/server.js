"use strict";

// process.on("uncaughtException",function(err){
// 	console.log("uncaught",JSON.stringify(err));
// });

var
	// config constants
	PROD = (process.env.NODE_ENV === "production"),
	SECUREPHRASE_SITE = "http://localhost:8050",
	ROOT_DIR = global.ROOT_DIR = __dirname,

	// node modules
	fs = require("fs"),
	http = require("http"),
	httpserv = http.createServer(),
	node_static = require("node-static"),
	path = require("path"),
	url_parser = require("url"),
	watch = require("watch"),
	secret,
	static_file_opts,
	static_files,

	// hybrid (server+browser) modules
	ASQ,
	grips,
	EventEmitter2,
	Events,
	Tmpls,
	Pages,
	View,
	Request,
	RandomIntegers,
	WordList,
	RandomPhrase,
	API,

	routes = []
;

// pull in "secret" config settings
secret = require(path.join(__dirname,"secret.js"));

// setup static file server
static_file_opts = {
	serverInfo: secret.SERVER_NAME,
	cache: PROD ?
		secret.PROD_STATIC_FILE_CACHE_LENGTH :
		secret.DEV_STATIC_FILE_CACHE_LENGTH,
	gzip: PROD
};
static_files = new node_static.Server(__dirname,static_file_opts);

// load/initialize hybrid (server+browser) modules
global.ASQ = ASQ = require("asynquence");
require("asynquence-contrib");
global.grips = grips = require("grips")[
	// either pull in production or debug of grips engine
	PROD ? "grips" : "debug"
];
global.EventEmitter2 = EventEmitter2 = require("eventemitter2").EventEmitter2;
global.Events = Events = new EventEmitter2({
	wildcard: true,
	maxListeners: 50
});
global.Pages = Pages = require(path.join(__dirname,"web","js","Pages.js"));
global.View = View = require(path.join(__dirname,"web","js","View.js"));
global.Request = Request = require(path.join(__dirname,"web","js","Request.js"));
global.RandomIntegers = RandomIntegers = require(path.join(__dirname,"web","js","RandomIntegers.js"));
global.WordList = WordList = require(path.join(__dirname,"web","js","WordList.js"));
global.RandomPhrase = RandomPhrase = require(path.join(__dirname,"web","js","RandomPhrase.js"));
global.API = API = require(path.join(__dirname,"web","js","API.js"));

// load/initialize templates
loadTemplates(path.join(__dirname,"web","js","Tmpls.js"));

// watch for updated templates to reload
watch.createMonitor(
	/*root=*/path.join(__dirname,"web","js"),
	/*options=*/{
		ignoreDirectoryPattern: true,
		filter: function filter(file) {
			// only monitor the template-bundle "Tmpls.js"
			return /Tmpls\.js$/.test(file);
		}
	},
	/*handler=*/function handler(monitor) {
		monitor.on("created",loadTemplates);
		monitor.on("changed",loadTemplates);
	}
);

// setup HTTP routes
routes.push(
	// always set server name
	function serverName(req,res) {
		res.setHeader("Server",secret.SERVER_NAME);
	}
);

// routes.push(
// 	// perform hostname/protocol redirects?
// 	function canonicalRedirect(req,res) {
// 		if (
// 			req.headers["host"] === "www.securephrase.io" ||
// 			req.headers["x-forwarded-proto"] !== "https"
// 		) {
// 			res.writeHead(301, { Location: SECUREPHRASE_SITE });
// 			res.end();
// 			return true;
// 		}
// 	}
// );

routes.push(
	// ensure security headers for all responses
	function securityHeaders(req,res) {
		// From: https://developer.mozilla.org/en-US/docs/Security/CSP/Introducing_Content_Security_Policy
		res.setHeader("Content-Security-Policy","default-src 'self'; script-src 'self' 'unsafe-eval' localhost:8050 ajax.googleapis.com ssl.google-analytics.com; connect-src 'self' www.random.org; style-src 'self' 'unsafe-inline' localhost:8050");

		// From: https://developer.mozilla.org/en-US/docs/Security/HTTP_Strict_Transport_Security
		res.setHeader("Strict-Transport-Security","max-age=" + 1E9 + "; includeSubdomains");
	}
);

routes.push(
	// await full request
	function fullRequest(req,res) {
		req.body = "";
		return ASQ.react(function listener(next){
			req.addListener("data",function(chunk){
				req.body += chunk;
			});
			req.addListener("end",next);
			req.resume();
		});
	}
);

routes.push(
	// favicon
	function favicon(req,res) {
		try {
			if (req.method === "GET" && req.url === "/favicon.ico") {
				fs.statSync(path.join(__dirname,"web","favicon.ico"));
			}
			return;
		}
		catch (err) {}

		// empty favicon.ico response
		res.writeHead(204,{
			"Content-Type": "image/x-icon",
			"Cache-Control": "public, max-age: 604800"
		});
		res.end();
		return true;
	}
)

routes.push(
	// static file request?
	function staticResources(req,res) {
		if (req.method === "GET" &&
			/^\/(?:js\/(?=.+)|css\/(?=.+)|images\/(?=.+)|robots\.txt\b|humans\.txt\b|favicon\.ico\b)/
			.test(req.url)
		) {
			req.url = "/web" + req.url;
			static_files.serve(req,res);
			return true;
		}
	}
);

routes.push(
	// a recognized full-page request?
	function loadPage(req,res) {
		var url;

		if (
			req.method === "GET" &&
			(url = Pages.recognize(req.url))
		) {
			return ASQ(function ASQ(done){
					View.getPageHTML(url)
					.val(function pageHTML(url,html) {
						res.writeHead(200,{ "Content-type": "text/html; charset=UTF-8" });
						res.end(html);
						done(true);
					})
					.or(done.fail);
				});
		}
	}
);

routes.push(
	// generate-phrase POST fallback?
	function generatePhraseFallback(req,res) {
		if (req.method === "POST" && req.url == "/") {
			var data = url_parser.parse("/?" + req.body,true).query;

			data.wordCount = data.level;
			data.localRandom = data.localized;

			return ASQ(function ASQ(done){
					API.generate(data)
					.seq(function result(phrase) {
						return View.getPageHTML("/",{
								phrase_results: [ phrase ]
							});
					})
					.val(function pageHTML(url,html){
						res.writeHead(200,{
							"Content-type": "text/html; charset=UTF-8",
							"Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
							"Pragma": "no-cache",
							"Expires": "Thu, 01 Dec 1994 16:00:00 GMT"
						});
						res.end(html);
						done(true);
					})
					.or(done.fail);
				});
		}
	}
);

routes.push(
	// api request?
	function api(req,res) {
		if (
			req.method === "GET" &&
			/^\/api\/generate/.test(req.url)
		) {
			var data = url_parser.parse(req.url,true).query;

			return ASQ(function ASQ(done){
					API.generate(data)
					.val(function result(phrase) {
						res.writeHead(200,{
							"Content-type": "application/json; charset=UTF-8",
							"Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
							"Pragma": "no-cache",
							"Expires": "Thu, 01 Dec 1994 16:00:00 GMT"
						});
						res.end(JSON.stringify({
							phrase: phrase
						}));
						done(true);
					})
					.or(done.fail);
				});
		}
	}
);

routes.push(
	// default route
	function defaultRoute(req,res) {
		res.writeHead(404);
		res.end();
	}
);


// server request handling
ASQ.react(function listen(trigger){
	httpserv.on("request",trigger);
})
.runner(router)
.or(responseError);

// start server
httpserv.listen(secret.SERVER_PORT,secret.SERVER_ADDR);


// *****************************

function *router(token) {
	var req = token.messages[0], res = token.messages[1], route, error;

	for (route of routes) {
		try {
			route = route(req,res);
			if (ASQ.isSequence(route)) {
				// wait to resolve the route
				route = yield route;
			}
			if (route === true) {
				break;
			}
		}
		catch (err) {
			error = err;
			break;
		}
	}

	// response error?
	if (error) {
		throw {
			req: req,
			res: res,
			reason: error
		};
	}
}

function logMessage(msg,returnVal) {
	var d = new Date();
	msg = "[" + d.toLocaleString() + "] " + msg;
	if (!!returnVal) {
		return msg;
	}
	else {
		console.log(msg);
	}
}

function NOTICE(location,msg,returnVal) {
	return logMessage("NOTICE(" + location + "): " + msg,!!returnVal);
}

function ERROR(location,msg,returnVal) {
	return logMessage("ERROR(" + location + "): " + msg,!!returnVal);
}

function responseError(respErr) {
	try {
		if (respErr.req && respErr.res) {
			if (respErr.req.headers &&
				respErr.req.headers["accept"] === "application/json"
			) {
				respErr.reason = JSON.stringify({
					error: respErr.reason
				});
			}
			respErr.res.writeHead(500);
			respErr.res.end(respErr.reason.toString());
			return true;
		}
	} catch(e) {}

	ERROR("responseError",
		respErr ? ((respErr.stack + "") || respErr.toString()) : "Unknown response error"
	);
}

function loadTemplates(file) {
	var cache_entry;

	if (/Tmpls\.js$/.test(file)) {
		cache_entry = require.resolve(file);

		// templates already loaded into cache?
		if (require.cache[cache_entry]) {
			NOTICE("templates","Reloaded.");

			// clear the templates-module from the require cache
			delete require.cache[cache_entry];

			// clear out the grips collection cache
			Object.keys(grips.collections).forEach(function forEach(key){
				delete grips.collections[key];
			});
		}
		else {
			NOTICE("templates","Loaded.");
		}

		// load the templates-module and initialize it
		global.Tmpls = Tmpls = require(file);
		Events.emit("Tmpls");
	}
}

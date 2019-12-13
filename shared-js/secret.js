"use strict";

exports.SERVER_NAME = "coolawesome";

exports.SERVER_ADDR = "127.0.0.1";
exports.SERVER_PORT = 8050;

exports.PROD_STATIC_FILE_CACHE_LENGTH = 14400;
exports.DEV_STATIC_FILE_CACHE_LENGTH = 1;

exports.CORS_GET_HEADERS = {
	"Access-Control-Allow-Origin": "http://localhost:8050",
	"Access-Control-Allow-Credentials": false,
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Accept, Content-Type, User-Agent, X-Requested-With"
};
exports.CORS_POST_HEADERS = {
	"Access-Control-Allow-Origin": "http://localhost:8050",
	"Access-Control-Allow-Credentials": false,
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Accept, Content-Type, User-Agent, X-Requested-With"
};

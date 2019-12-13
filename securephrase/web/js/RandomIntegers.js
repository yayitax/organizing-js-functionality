(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("RandomIntegers",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function getRemoteIntegers(count,min,max) {
		count = count || 2;
		min = min || 0;
		max = max || 1E9;

		var url = "https://www.random.org/integers/?num=" + count + "&min=" + min +
			"&max=" + max + "&col=" + count + "&base=10&format=plain&rnd=new";

		return context.Request.remote(url)
			.val(function httpResponse(resp){
				return resp.split(/\s+/).slice(0,-1).map(Number);
			});
	}

	function getLocalIntegers(count,min,max) {
		count = count || 2;
		min = min || 0;
		max = max || 1E9;

		return context.ASQ().val(function val(){
				var results = [];

				// newer, more secure random crypto supported?
				if (
					(context.crypto && context.crypto.getRandomValues) ||
					(context.msCrypto && context.msCrypto.getRandomValues)
				) {
					results = new Uint32Array(count);
					(context.crypto || context.msCrypto).getRandomValues(results);

					results = [].slice.call(results).map(function mapper(v){
						return (v % max) + min;
					});
				}
				// fall back to older sucky `Math.random()`
				else {
					results = [];
					for (var i=0; i<count; i++) {
						results.push( Math.floor( Math.random() * (max - min + 1)) + min );
					}
				}

				return results;
			});
	}

	var public_api = {
		getLocalIntegers: getLocalIntegers,
		getRemoteIntegers: getRemoteIntegers
	};

	return public_api;
});

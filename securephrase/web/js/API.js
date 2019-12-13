(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("API",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function generate(data) {
		// constrain API request data
		data.wordCount = Math.max(4,Math.min(+data.wordCount || 0,8));
		data.localRandom = (typeof data.localRandom == "undefined") ? true : !!data.localRandom;

		return (
			data.localRandom ?
				RandomPhrase.getLocal(data.wordCount) :
				RandomPhrase.getRemote(data.wordCount)
		);
	}

	var public_api = {
		generate: generate
	};

	return public_api;
});

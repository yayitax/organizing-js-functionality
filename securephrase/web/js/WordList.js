(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("WordList",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function load() {
		return context.Request.local("/js/diceware.json");
	}

	function get() {
		if (!wordPr) {
			wordPr = load().defer().toPromise().then(
				// success
				JSON.parse,
				// failure
				function loadError(err){
					context.Events.emit("notify.error",err);
					throw err;
				}
			);
		}
		return wordPr;
	}

	var wordPr;

	// running in server context?
	if (typeof window == "undefined") {
		// proactively load word list
		get();
	}

	return get;
});

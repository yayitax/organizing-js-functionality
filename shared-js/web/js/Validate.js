(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Validate",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function checkMinMax(min,max) {
		min = Number(min);
		max = Number(max);

		if (max <= min) return false;
		if (min < 0) return false;
		if (max > 100) return false;

		return true;
	}


	var public_api = {
		checkMinMax: checkMinMax
	};

	return public_api;
});

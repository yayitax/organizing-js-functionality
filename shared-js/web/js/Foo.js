(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Foo",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function random(min,max) {
		min = Number(min);
		max = Number(max);

		var num = Math.random();
		return Math.trunc(num * 1E9) % (max - min + 1) + min;
	}

	var public_api = {
		random: random
	};

	return public_api;
});

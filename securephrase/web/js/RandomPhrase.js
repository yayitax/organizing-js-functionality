(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition(name,context);
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("RandomPhrase",typeof global != "undefined" ? global : this,function definition(name,context) {
	"use strict";

	function segmentArray(arr,segmentSize) {
		segmentSize = Math.max(1,Math.min(+segmentSize||0,arr.length));
		return Array.apply(null,{length:Math.ceil(arr.length / segmentSize)}).map(function mapper(_,i){
			return arr.slice(i*segmentSize,(i+1)*segmentSize);
		});
	}

	function makePhrase(nums,wordlist) {
		return segmentArray(nums,5).map(function mapper(num){
				return wordlist[num.join("")];
			})
			.join(" ");
	}

	function getLocal(wordCount) {
		return context.ASQ().gate(
			RandomIntegers.getLocalIntegers(wordCount * 5,1,6),
			ASQ().promise( WordList() )
		)
		.val(makePhrase);
	}

	function getRemote(wordCount) {
		return context.ASQ().gate(
			RandomIntegers.getRemoteIntegers(wordCount * 5,1,6),
			ASQ().promise( WordList() )
		)
		.val(makePhrase);
	}


	var public_api = {
		getLocal: getLocal,
		getRemote: getRemote
	};

	return public_api;
});

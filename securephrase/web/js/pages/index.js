(function(context){

	function init(){
		$level = $("[rel='js-level']");
		$local = $("[rel='js-local']");
		$results = $("[rel='js-phrase-results']");
		$btn_generate = $("[rel='js-btn-generate']");

		var phrase_results = [];

		$btn_generate.click(function click(evt){
			evt.preventDefault();

			var wordCount = Number($level.val());

			context.API.generate({
				wordCount: Number($level.val()),
				localRandom: $local.is(":checked")
			})
			.seq(function result(phrase){
				phrase_results.unshift(phrase);

				return View.getPartialHTML("/#phrase_results",{
						phrase_results: phrase_results
					});
			})
			.val(function val(partial,html){
				$results.replaceWith(html);
				$results = $("[rel='js-phrase-results']");
			})
			.or(function or(err){
				console.log("or",err.stack || err);
			});
		});
	}

	function teardown(){
		$btn_generate.unbind("click");
		$level = $local = $btn_generate = null;
	}


	var $form, $level, $local, $btn_generate, $results;

	Pages.page_scripts["/index"] = {
		init: init,
		teardown: teardown
	};

})(window);

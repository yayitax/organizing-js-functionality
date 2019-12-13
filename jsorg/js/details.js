$(document).ready(function() {
    function personClicked(evt) {
        var id = $(evt.target).attr("rel").replace(/^.*(\d+)$/, "$1");
        $.ajax("details/" + id + ".html", { dataType: "text" }).then(function(contents) {
            $content.html(contents);
        });
    }

    var $items = $("[rel=js-carousel] > [rel=js-content] > [rel=js-items]");
    var $content = $("[rel=js-details]");

    $items.on("click", "[rel*='js-item-']", personClicked);

});
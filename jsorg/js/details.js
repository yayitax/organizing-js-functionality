var Details = (function() {
    var $content;

    EVT.on("init", init);


    function init() {
        $content = $("[rel=js-details]");

        $content.on("click", "[rel=js-select-person]", selectPerson);

        EVT.on("person-selected", personClicked);
    }

    function personClicked(id) {
        $.ajax("details/" + id + ".html", { dataType: "text" }).then(function(contents) {
            $content.html(contents);
        });
    }

    function selectPerson(evt) {
        evt.preventDefault();
        var id = $(evt.target).attr("data-person");
        EVT.emit("person-selected", id);
    }

})();
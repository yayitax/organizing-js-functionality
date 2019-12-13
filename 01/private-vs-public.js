/**
 * Private vs. Public
 */

function Hello(name) {
    var id = Math.random();

    function upperFirstName() {
        return name.toUpperCase();
    }

    function speak(lastName) {
        console.log(upperFirstName(), lastName);
    }

    var public_api = {
        say: speak
    };
    return public_api;
}

var o = Hello("Ximena");
o.say('Cadena');
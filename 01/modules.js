/**
 * Modules
 */

function Hello(name) {
    function speak() {
        console.log(name);
    }

    return { say: speak };
}

var o = Hello("Ximena");
o.say();
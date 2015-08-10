define(['jquery'], function () {

function initController () {

    var controlsPressed = {};

    var keyCodeToControl = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    function preventScroll (event) {
        if (event.keyCode === 38 || event.keyCode === 40) {
            event.preventDefault();
        }
    }

    $(window).on('keydown', function (event) {
        var control = keyCodeToControl[event.keyCode];

        if (control) {
            controlsPressed[control] = true;
        }

        preventScroll(event);
    });

    $(window).on('keyup', function (event) {
        delete controlsPressed[keyCodeToControl[event.keyCode]];
    });

    return controlsPressed;

}

return Controller;
});
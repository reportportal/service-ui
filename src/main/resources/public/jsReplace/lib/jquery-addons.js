(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals.
        factory(jQuery);
    }
}(function ($) {

// add some custom functions
$.fn.ForceNumericOnly = function(){
    return this.each(function() {
        $(this).keydown(function(event) {
            // Allow: backspace, delete, tab, escape, and enter
            if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
                // Allow: Ctrl+A
                (event.keyCode == 65 && event.ctrlKey === true) ||
                // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                return; // let it happen, don't do anything
            } else {
                // Ensure that it is a number and stop the keypress
                if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                    event.preventDefault();
                }
            }
        });
    });
};
$.fn.InvertColor = function(hexTripletColor) {
    var color = hexTripletColor.split('#').join('');
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
};
/**
 * @return {string}
 */

$.fn.reduceColor = function(bgColor) {
    bgColor = bgColor.split('#').join('');
    var nThreshold = 130;
    var nThreshold2 = 90;

    var r = bgColor.substring(1, 3);
    var g = bgColor.substring(3, 5);
    var b = bgColor.substring(5, 7);
    var components = {
        R: parseInt(r, 16),
        G: parseInt(g, 16),
        B: parseInt(b, 16)
    };

    var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

    return ((255 - bgDelta) < nThreshold && (255 - bgDelta) > nThreshold2) ? '#000000' : '#ffffff';
};

var o = $({});
$.each({
        trigger: "publish",
        on: "subscribe",
        off: "unsubscribe"
    }, function (key, value) {
        $[value] = function() { o[key].apply(o, arguments); };
    });

}));
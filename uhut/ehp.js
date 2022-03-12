"use strict";
module.exports = function (userData) {
    return (userData['stats'].health * (1 + (userData['stats'].defense / 100)));
};

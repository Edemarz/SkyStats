"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const zombiearray = [0, 5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000];
    const spiderarray = [5, 25, 200, 1000, 5000, 20000, 100000, 400000, 1000000];
    const restarray = [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000];
    var slayers = {
        voidgloomlvl: 0,
        svenlvl: 0,
        tarantulalvl: 0,
        zombielvl: 0,
    };
    zombiearray.forEach((revxp) => {
        if ((userData['slayers'].revenant - revxp) >= 1)
            slayers.zombielvl = zombiearray.findIndex((level) => level === revxp);
    });
    spiderarray.forEach((taraxp) => {
        if ((userData['slayers'].tarantula - taraxp) >= 1)
            slayers.tarantulalvl = spiderarray.findIndex((level) => level === taraxp);
    });
    restarray.forEach((svenxp) => {
        if ((userData['slayers'].sven - svenxp) >= 1)
            slayers.svenlvl = restarray.findIndex((level) => level === svenxp);
    });
    restarray.forEach((emanxp) => {
        if ((userData['slayers'].voidgloom - emanxp) >= 1)
            slayers.voidgloomlvl = restarray.findIndex((level) => level === emanxp);
    });
    return slayers;
});

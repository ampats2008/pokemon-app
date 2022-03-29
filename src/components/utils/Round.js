// Rounding helper function
Number.prototype.round = function(places) {
    return +(Math.round(this + "e+" + places)  + "e-" + places);
}

export default { round: Number.prototype.round }
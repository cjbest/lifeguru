
Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};
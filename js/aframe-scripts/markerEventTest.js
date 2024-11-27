window.onload = function () {

    console.log("Console active");
    
// Marker found event listener
var m = document.querySelector("a-marker");
m.addEventListener("markerFound", (e) => {
    console.log("found");
});

m.addEventListener("markerLost", (e) => {
    console.log("lost");
});

});
window.onload = function () {
    var myBlock = document.getElementById('myElement');
    var aScene = document.getElementById('main');
    var box = document.getElementById('b1');


    // create a simple instance on our object
    var mc = new Hammer(myBlock);

    // add a "PAN" recognizer to it (all directions)
    mc.add(new Hammer.Pan({
        direction: Hammer.DIRECTION_ALL,
        threshold: 0
    }));

    // tie in the handler that will be called
    mc.on("pan", handleDrag);


    // setting up a few vars to keep track of things.
    // at issue is these values need to be encapsulated
    // in some scope other than global.
    var lastPosX = 0;
    var lastPosY = 0;
    var isDragging = false;

    function handleDrag(ev) {

        ev.preventDefault();

        // for convience, let's get a reference to our object
        var elem = myBlock;

        // DRAG STARTED
        // here, let's snag the current position
        // and keep track of the fact that we're dragging
        if (!isDragging) {
            isDragging = true;
            lastPosX = elem.offsetWidth;
            lastPosY = elem.offsetTop;

            setBlockText("WOAH");
        }

        // we simply need to determine where the x,y of this
        // object is relative to where it's "last" known position is
        // NOTE: 
        //    deltaX and deltaY are cumulative
        // Thus we need to always calculate 'real x and y' relative
        // to the "lastPosX/Y"
        var posX = ev.deltaX + lastPosX;
        var posY = ev.deltaY + lastPosY;

        // move our element to that position
        elem.style.width = posX + "px";
        box.setAttribute("color", "blue");
        elem.style.top = posY + "px";
        ///// box.setAttribute("rotation", {x: posY/-2, y: posX/2, z: 0});
        console.log("posX: " + posX + " | posY: " + posY);

        // DRAG ENDED
        // this is where we simply forget we are dragging
        if (ev.isFinal) {
            isDragging = false;
            /////box.setAttribute("color", "green");

            setBlockText("Thanks");
        }
    }




    function setBlockText(msg) {
        myBlock.textContent = msg;
    }
}
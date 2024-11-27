/*
AFRAME.registerComponent("foo", {
    init: function () {
        var element = document.querySelector('body');
        //this.marker = document.querySelector('a-marker')
        var model = document.getElementById('b1');
        var hammertime = new Hammer(element);
        var pinch = new Hammer.Pinch(); // Pinch is not by default in the recognisers

        hammertime.get('pinch').set({
            enable: true
        });

        hammertime.get('rotate').set({
            enable: true
        });

        hammertime.add(pinch); // add it to the Manager instance

        hammertime.on('pan', (ev) => {
            let rotation = model.getAttribute("rotation")
            switch (ev.direction) {
                case 2:
                    rotation.y = rotation.y + 4
                    break;
                case 4:
                    rotation.y = rotation.y - 4
                    break;
                case 8:
                    rotation.x = rotation.x + 4
                    break;
                case 16:
                    rotation.x = rotation.x - 4
                    break;
                default:
                    break;
            }
            model.setAttribute("rotation", rotation)
        });

        hammertime.on("pinch", (ev) => {
            let scale = {
                x: ev.scale,
                y: ev.scale,
                z: ev.scale
            }
            model.setAttribute("scale", scale);
        });
    }
});
*/


window.onload = function () {
        var myElement = document.getElementById('main');
        var box = document.getElementById('myElement');

        // create a simple instance
        // by default, it only adds horizontal recognizers
        var mc = new Hammer(myElement);

        // listen to events...
        /*
        mc.on("panleft panright tap press", function (ev) {
            document.getElementById('myElement').textContent = ev.type + " gesture detected.";
        });
        */


        var lastPosX = 0;
        var lastPosY = 0;
        var isDragging = false;

        mc.on('panleft panright', function (ev) {

                var elem = ev.target

                // DRAG STARTED
                // here, let's snag the current position
                // and keep track of the fact that we're dragging
                if (!isDragging) {
                    isDragging = true;
                    lastPosX = elem.offsetLeft;
                    lastPosY = elem.offsetTop;

                    box.textContent = "WOAH";
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
                elem.style.left = posX + "px";
                elem.style.top = posY + "px";

                // DRAG ENDED
                // this is where we simply forget we are dragging
                if (ev.isFinal) {
                    isDragging = false;
                    box.textContent = "Thanks";


                    /*document.getElementById('myElement').textContent = ev.type + ev.direction + " gesture detected.\nrotx: " + box.object3D.rotation.y;
                    let rotation = box.object3D.rotation.y;
                    switch (ev.direction) {
                        case 2:
                            rotation = rotation - 4
                            break;
                        case 4:
                            rotation = rotation + 4
                            break;
                        case 8:
                            rotation.x = rotation.x + 4
                            break;
                        case 16:
                            rotation.x = rotation.x - 4
                            break;
                        default:
                            break;
                    }
                    box.setAttribute("rotation", {
                        x: 0,
                        y: rotation,
                        z: 0
                    });*/

                });
        }
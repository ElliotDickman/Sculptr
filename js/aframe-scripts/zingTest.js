$(document).ready(function () {
    console.log("Console active!");
    console.log("-------------------");
    console.log("-------------------");


    var box = document.getElementById('gltf-entity');
    var env = document.getElementById('env-image-entity');
    var cam = document.getElementById('cam');
    var close = document.getElementById("container");
    var initialized = 1;
    var defaultAnim = "<a-animation class='gltfAnim' property='rotation' to='0 360 0' dur='30000' easing='linear' repeat='indefinite' enabled='true'></a-animation>";
    var objectList = [];


    // Zoom vars
    var currentZoomIn;
    var zoomSensitivity = 8000;
    var maxZoom = 2.3;
    var minZoom = 0.5;

    var currentAngle;
    var currentX = 0;
    var currentY = 0;


    ///////////////////////////////////
    // Read all marker objects and create a-marker for each
    ///////////////////////////////////

    // Request json
    let requestURL = 'js/aframe-scripts/ar-objects.json';
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    // Load json object
    request.onload = function () {
        var allObjects = request.response;
        console.log("OBJECTS RECIEVED");
        
        // For each object...
        $.each(allObjects, function (k, v) {
            
            // Create a string with the HTML for AR marker with associated id
            var strToAppend = "<a-marker data-name='" + v.name + "' type='barcode' value='" + v.id + "'></a-marker>"
            
            console.log(v.name, strToAppend);
            // If object has id (it isn't the default object with id of 0)...
            if (v.id) {
                
                // Append the AR marker HTML to the scene
                $("a-scene").append(strToAppend);
                
                // Add event listener to each marker to trigger on marker detection
                document.querySelector("[data-name=" + v.name + "]").addEventListener("markerFound", foundMarker);
            }
            
            // Add object to objectList
            objectList.push(v);
        });
    }




    // Enable to hide object on marker lost
    /* m.addEventListener("markerLost", lostMarker); */

    // Enable to hide object on close button
    $("#close").click(function () {
        lostMarker();
    });



    ////////////////////////////////
    // Funtions for marker event listeners
    ////////////////////////////////

    function foundMarker() {
        console.log("found");

        $(".scan-overlay").css('visibility', 'hidden');
        $("#close").css('visibility', 'visible');

        var curID = this.getAttribute("value");

        var curObj = objectList.find(obj => {
            return obj.id == curID;
        });
        
        //////////////
        // Code for GLTF initialization
        //////////////
        
        if (curObj.type == "gltf") {
            
            console.log(curObj);
            
            var newPos = curObj.position.x.toString() + " " + curObj.position.y.toString() + " " + curObj.position.z.toString();
            var newScale = (curObj.zoom.toString() + " " + curObj.zoom.toString() + " " + curObj.zoom.toString());
            var newRot = curObj.angle.x.toString() + " " + curObj.angle.y.toString() + " 0";

            console.log(newPos, newScale, newRot);
            
            // Set new object source in loader
            $("#gltf-loader").attr("src", curObj.url);
            
            // Relink loader to display object and initialize placement
            $("#gltf-entity").attr({
                "gltf-model": "#gltf-loader",
                "position": newPos,
                "scale": newScale
            });
            
            currentZoomIn = curObj.zoom;
            zoomSensitivity = curObj.zoomSense;
            maxZoom = 2.3 * curObj.zoom;
            minZoom = 0.5 * curObj.zoom;

            currentAngle = curObj.angle.y;

            currentX = radify(curObj.angle.x);
            currentY = radify(curObj.angle.y);
            
            // Display the object
            box.setAttribute('visible', true);
            
            // Set initial rotation animation //
            //////////////////////////////////////////
            // Initial rotation animation is currently disabled due to interference with the touch interaction system
            //////////////////////////////////////////
            // For A-Frame 1.0.0 and newer (currently buggy):
            // box.setAttribute('animation', defaultAnim);
            
            // $("a-animation.gltfAnim").replaceWith(defaultAnim);
            
        }
        
        
        if (curObj.type == "env") {
            console.log(curObj);
            
            cam = document.getElementById('cam');
            
            $("#env-image-loader").attr("src", curObj.url);
            
            $("#env-image-entity").attr("material", "src:#env-image-loader;side:double");
            
            env.setAttribute('visible', true);
            cam.setAttribute('look-controls', "enabled", true);
        }

    }

    function lostMarker() {
        console.log("lost");

        box.setAttribute('visible', false);
        env.setAttribute('visible', false);
        
        // Stop rotation animation //
        // For A-Frame 1.0.0 and newer (currently buggy):
        // box.setAttribute("animation", "enabled: false");
        
        //$("a-animation.gltfAnim").replaceWith("<a-animation class='gltfAnim' enabled='false'></a-animation>");


        $(".scan-overlay").css('visibility', 'visible');
        $("#close").css('visibility', 'hidden');

        // TODO ///
        // RESET CAMERA POSITION ON MARKER LOST
        /*
        let controls = document.getElementById('cam');
        
        console.log("CAMERA INFO ON RESET:")
        console.log("CAMERA LOOK OBJ:", controls);
        console.log("PITCH: ", controls.rotation.x, "YAW:", controls.rotation.y);
        
        
        
        cam.setAttribute('look-controls', 'enabled:false');
        controls.rotation.x = 0;
        controls.rotation.y = 0;
        */

        /*
        $("#cam2").attr("camera", "active: true");
        $("#cam").remove();
        $("#endCamList").prev("a-entity").attr("id", "cam");
        //$("#cam").attr("camera", "active", true);
        $("#endCamList").before("<a-entity id='cam2' camera='active: false' look-controls='enabled: false'></a-entity>");
        */
        
        
        /*        
        $("#endCamList").before("<a-entity id='cam2' camera='active: true' look-controls='enabled: false'></a-entity>");
        $("#cam").remove();
        $("#endCamList").prev("a-entity").attr("id", "cam");
        */

        console.log("Camera reset");


    }


    /////////////////////////////////////////////
    // Object gesture interaction
    /////////////////////////////////////////////



    // Rotate vars
    var senseX = 18;
    var senseY = 12;

    console.log("----- Get Scale ------");
    console.log(box.object3D.scale.x);

    // Using a layer on top of the entire page for "fat-finger" detection on mobile devices.
    ///// document.getElementById('myElement').style.transform = 'rotate(15deg)';




    console.log("Box elements: " + box);



    var touchArea = document.getElementById('container');
    var target = document.getElementById('main');
    var region = new ZingTouch.Region(touchArea);


    /**** Pan / rotate *****/

    region.bind(touchArea, 'pan', function (e) {
        // Prevent touch event
        e.preventDefault();
        
        // Stop rotation animation
        // A-frame 1.0.0+ (buggy): box.setAttribute("animation", "enabled: false");
        
        // $("a-animation.gltfAnim").replaceWith("<a-animation class='gltfAnim' enabled='false'></a-animation>");
        
        
        var dir = e.detail.data[0].currentDirection;
        var dist = e.detail.data[0].distanceFromOrigin

        var changeY = Math.cos(radify(dir));
        var changeX = Math.sin(radify(dir));

        /*
        console.log(e.detail);
        console.log(radify(dir));
        console.log(" X norm: " + changeX + " | Y norm: " + changeY);
        */
        ///// var rotatable = document.getElementById('myElement');

        if (dir > 90 && dir < 270) {
            currentAngle -= dist / 15;
            console.log("Backwards...")
        } else {
            currentAngle += dist / 15;
        }


        currentX -= changeX / senseX;
        currentY += changeY / senseY;


        // console.log(" X: " + currentX + " | Y " + currentY);

        ///// rotatable.style.transform = 'rotate(' + currentAngle + 'deg)';


        box.object3D.rotation.y = currentY;
        box.object3D.rotation.x = currentX;


    });


    /**** Zoom in *****/

    region.bind(touchArea, 'expand', function (e) {

        var zoomAmount = e.detail.distance / zoomSensitivity;

        // Prevent touch event
        e.preventDefault();
        
        // Stop rotation animation
        // A-frame 1.0.0+ (buggy): box.setAttribute("animation", "enabled: false");
        
        //$("a-animation.gltfAnim").replaceWith("<a-animation class='gltfAnim' enabled='false'></a-animation>");

        console.log("ZOOOOOM");
        // console.log(e.detail);
        // console.log(zoomAmount + " | " + currentZoomIn);


        currentZoomIn += zoomAmount;

        if (currentZoomIn > maxZoom) {
            currentZoomIn = maxZoom;
        }

        box.object3D.scale.x = currentZoomIn;
        box.object3D.scale.y = currentZoomIn;
        box.object3D.scale.z = currentZoomIn;

    });

    /**** Zoom out *****/

    region.bind(touchArea, 'pinch', function (e) {

        var zoomAmount = e.detail.distance / zoomSensitivity;

        //prevent touch event
        e.preventDefault();

        console.log("OOOUUUTTT");
        // console.log(e.detail);
        // console.log(zoomAmount + " | " + currentZoomIn);

        currentZoomIn -= zoomAmount;

        if (currentZoomIn < minZoom) {
            currentZoomIn = minZoom;
            console.log("Oh no, zoom too smol");
        }
        box.object3D.scale.x = currentZoomIn;
        box.object3D.scale.y = currentZoomIn;
        box.object3D.scale.z = currentZoomIn;

    });


    function radify(num) {
        return THREE.Math.degToRad(num);
    }


    /////////////////////////////////////////////////////
    // Header object margin adjustment to account for body/video display bug
    /////////////////////////////////////////////////////

    var header = document.getElementById("header");
    var bodyOffset = window.getComputedStyle(document.querySelector("body")).marginLeft;

    var offsetApplied = 1;



    // Select the node that will be observed for mutations
    const targetNode = document.querySelector('body');

    // Options for the observer (which mutations to observe)
    const config = {
        attributes: true,
        childList: true,
        subtree: true
    };

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
        // Use traditional 'for loops' for IE 11

        /*
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
            } else if (mutation.type === 'attributes') {
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
        }
        */

        // Edit header based on body offset
        var header = document.getElementById("header");
        var bodyOffset = window.getComputedStyle(document.querySelector("body")).marginLeft;

        // console.log("Body offset: " + bodyOffset);

        if (bodyOffset.charAt(0) == '-') {
            header.style.marginLeft = bodyOffset.substr(1);
        } else {
            header.style.marginLeft = '-' + bodyOffset;
        }

    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Later, you can stop observing
    // observer.disconnect();
});
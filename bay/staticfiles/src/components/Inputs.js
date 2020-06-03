export class inputs_ExL {

    constructor(){
        this.DeadLoadOther = 15.0;
        this.LiveLoad = 40.0;
    }
}

export class inputs_Fire {

    constructor(){
        this.time = '1 hour';
        this.exposureMode = '1 face';
    }
}

export class inputs_Geo {

    constructor(){
        this.GLT_Span_mode = -1;
        this.CLT_Span_mode = -1;
    }
}

export class inputs_Mat {

    constructor(){
        this.GLT_MatFilters = "empty";
        this.CLT_MatFilters = "empty";
    }
}







/*function addControls() {
    var i, l, light, folder, controller;

    // Create GUI
    gui = new dat.GUI({autoPlace:false});

    controls.appendChild(gui.domElement);

    // Create folders
    renderFolder = gui.addFolder('Render');
    meshFolder = gui.addFolder('Mesh');
    lightFolder = gui.addFolder('Light');
    exportFolder = gui.addFolder('Export');

    // Open folders
    lightFolder.open();

    // Add Render Controls
    controller = renderFolder.add(RENDER, 'renderer', {webgl:WEBGL, canvas:CANVAS, svg:SVG});
    controller.onChange(function(value) {
        setRenderer(value);
    });

    // Add Mesh Controls
    controller = meshFolder.addColor(MESH, 'ambient');
    controller.onChange(function(value) {
        for (i = 0, l = scene.meshes.length; i < l; i++) {
            scene.meshes[i].material.ambient.set(value);
        }
    });
    controller = meshFolder.addColor(MESH, 'diffuse');
    controller.onChange(function(value) {
        for (i = 0, l = scene.meshes.length; i < l; i++) {
            scene.meshes[i].material.diffuse.set(value);
        }
    });
    controller = meshFolder.add(MESH, 'width', 0.05, 2);
    controller.onChange(function(value) {
        if (geometry.width !== value * renderer.width) { createMesh(); }
    });
    controller = meshFolder.add(MESH, 'height', 0.05, 2);
    controller.onChange(function(value) {
        if (geometry.height !== value * renderer.height) { createMesh(); }
    });
    controller = meshFolder.add(MESH, 'slices', 1, 800);
    controller.step(1);
    controller.onChange(function(value) {
        if (geometry.slices !== value) { createMesh(); }
    });

    // Add Light Controls
    controller = lightFolder.add(LIGHT, 'currIndex', {1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7}).name('Current light').listen();
    controller.onChange(function(value) {
        LIGHT.proxy = scene.lights[value-1];
        LIGHT.ambient = LIGHT.proxy.ambient.hex;
        LIGHT.diffuse = LIGHT.proxy.diffuse.hex;
        LIGHT.xPos =  LIGHT.proxy.position[0];
        LIGHT.yPos =  LIGHT.proxy.position[1];
        LIGHT.zOffset =  LIGHT.proxy.position[2];
    });

    controller = lightFolder.addColor(LIGHT, 'ambient').listen();
    controller.onChange(function(value) {
        LIGHT.proxy.ambient.set(value);
        LIGHT.proxy.ambientHex =  LIGHT.proxy.ambient.format();
    });

    controller = lightFolder.addColor(LIGHT, 'diffuse').listen();
    controller.onChange(function(value) {
        console.log(value);
        LIGHT.proxy.diffuse.set(value);
        LIGHT.proxy.diffuseHex = LIGHT.proxy.ambient.format();
    });

    controller = lightFolder.add(LIGHT, 'count', 1, 7).listen();
    controller.step(1);
    controller.onChange(function(value) {
        if (scene.lights.length !== value) {
            // If the value is more then the number of lights, add lights, otherwise delete lights
            if (value > scene.lights.length) {
                addLight();
            } else {
                trimLights(value);
            }
        }
    });

    controller = lightFolder.add(LIGHT, 'xPos', -mesh.geometry.width/2, mesh.geometry.width/2).listen();
    controller.step(1);
    controller.onChange(function(value) {
        LIGHT.proxy.setPosition(value, LIGHT.proxy.position[1], LIGHT.proxy.position[2]);
    });

    controller = lightFolder.add(LIGHT, 'yPos', -mesh.geometry.height/2, mesh.geometry.height/2).listen();
    controller.step(1);
    controller.onChange(function(value) {
        LIGHT.proxy.setPosition(LIGHT.proxy.position[0], value, LIGHT.proxy.position[2]);
    });

    controller = lightFolder.add(LIGHT, 'zOffset', 0, 1000).name('Distance').listen();
    controller.step(1);
    controller.onChange(function(value) {
        LIGHT.proxy.setPosition(LIGHT.proxy.position[0], LIGHT.proxy.position[1], value);
    });

    // Add Export Controls
    controller = exportFolder.add(EXPORT, 'width', 100, 3000);
    controller.step(100);
    controller = exportFolder.add(EXPORT, 'height', 100, 3000);
    controller.step(100);
    controller = exportFolder.add(EXPORT, 'export').name('export big');
    controller = exportFolder.add(EXPORT, 'exportCurrent').name('export this');

}

function toggleEl(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'block')
        e.style.display = 'none';
    else
        e.style.display = 'block';
}


//------------------------------
// Callbacks
//------------------------------

function onWindowResize(event) {
    resize(container.offsetWidth, container.offsetHeight);
    render();
}

function onMouseMove(event) {
    if(LIGHT.pickedup){
        LIGHT.xPos = event.x - renderer.width/2;
        LIGHT.yPos = renderer.height/2 -event.y;
        LIGHT.proxy.setPosition(LIGHT.xPos, LIGHT.yPos, LIGHT.proxy.position[2]);
    }
}

// Hide the controls completely on pressing H
Mousetrap.bind('H', function() {
    toggleEl('contrhhols')
});

// Add a light on ENTER key
Mousetrap.bind('enter', function() {
    LIGHT.count++;
    addLight();
});

// Pick up the light when a space is pressed
Mousetrap.bind('space', function() {
    LIGHT.pickedup = !LIGHT.pickedup;
});

// Let there be light!
initialise();
*/
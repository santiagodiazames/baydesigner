//region Imports and Variables
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CLT_Calc  from './components/CLT_Calc.js';
import * as GLT_Calc  from './components/GLT_Calc.js';
import * as Inputs from './components/Inputs.js';
import * as CalcParam from "./components/CalcParam";
import * as Member from "./components/Member";
import * as MatCat from "./components/MaterialCatalog";
import * as Material from "./components/Material";


let controls;
let container, stats;
let camera, scene, renderer;
let bias = 0.5;

let columnPositions = [];
let columnObjects = [];
let columnEdges = [];
let columnQty = 6;
let columnWidth = 14;
let columnGeo = new THREE.BoxBufferGeometry( columnWidth, 132, columnWidth );

let beamPositions = [];
let beamObjects = [];
let beamEdges = [];
let beamQty = 4;
let beamGeo = new THREE.BoxBufferGeometry( 1, 1, 1 );

let panelPositions = [];
let panelObjects = [];
let panelEdges = [];
let panelQty = 4;
let panelGeo = new THREE.BoxBufferGeometry( 1, 1, 1 );
let toppingPositions = [];
let toppingObjects = [];
let toppingEdges = [];
let toppingGeo = new THREE.BoxBufferGeometry( 1, 1, 1 );

let TW = 1.0;

let CLT_Loadings;
let CLT_Strength;
let CLT_Serviceability;
let CLT_FireCheck;
let GLT_Loadings;
let GLT_Strength;
let GLT_Serviceability;
let GLT_FireCheck;

let CLT_Volume;
let GLT_Columns_Volume;
let GLT_Girders_Volume;
let inch3_to_ft3 = 0.000579;
let ft3_to_m3 = 0.0283168;


let CLT_Cost;
let GLT_Columns_Cost;
let GLT_Girders_Cost;
let GLT_unit_cost = 0;
let CLT_unit_cost = 0;


// alert(CLT_cat.thisCLT_Catalog.length);
// Initial Material Catalog components
let CLT_Mat = MatCat.CLT_catalog().catalog[0];
let CLT_MatCustom;
let Topping_Mat = MatCat.Topping_catalog().catalog[0];
let GLT_Mat = MatCat.GLT_catalog().catalog[0];

let CLT_max_str = " ... ";
let GLT_max_str = " ... ";
let CLT_max_description = " ... ";
let GLT_max_description = " ... ";

let iterationMode = true;

//endregion

init();
animate();

function init() {

    //region Setup 3D Scene
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( -300, 250, 300 );
    camera.lookAt( 160, 0, 160);
    scene.add( camera );
    scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );

    addSceneElements();

    // Renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;

    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set(160, 0, 160);
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );


    // Initial Bay Configuration
    let initial_z = 240;
    let initial_x = 288;
    let initial_SpanModeCLT = 'single-span';
    let initial_SpanModeGirder = 'single-span';

        // Initial CLT Layup
    let ini_CLT_Layup_Name = "The name of my CLT layup";
    let ini_CLT_Layup_layers = 5;
    let ini_CLT_Layup_grade = "E1";
    let ini_CLT_Layup_t_l = 1.38;
    let ini_CLT_Layup_t_t = 1.38;

    // Initial Load Requirements
    let initial_FireTime = '1 hour';
    let initial_FireExposureMode = '3 faces';
    let initial_DeadLoadOther = 15;
    let initial_LiveLoad = 40;

    // Initial Geometry for Columns
    let columnHeight = 132;
    columnPositions = [
        new THREE.Vector3( 0.0,   columnHeight / 2, 0.0 ),
        new THREE.Vector3( 0.0,   columnHeight / 2, initial_z ),
        new THREE.Vector3( 0.0,   columnHeight / 2, initial_z * 2.0),
        new THREE.Vector3( initial_x, columnHeight / 2, 0.0 ),
        new THREE.Vector3( initial_x, columnHeight / 2, initial_z ),
        new THREE.Vector3( initial_x, columnHeight / 2, initial_z * 2.0)];

    // Initial Geometry for Beams
    let beamLength = initial_z - columnWidth - bias;
    let beamWidth = 14;
    let beamDepth = initial_z / 10; // <----------------------------- REPLACE WITH STRUCTURAL CALCS
    let beam_y = columnHeight - (beamDepth / 2);
    beamPositions = [
        new THREE.Vector3( 0.0, beam_y, initial_z * 0.5 ),
        new THREE.Vector3( initial_x, beam_y, initial_z * 0.5 ),
        new THREE.Vector3( 0.0, beam_y, initial_z * 1.5 ),
        new THREE.Vector3( initial_x, beam_y, initial_z * 1.5 ),];

    // Initial Geometry for Panels
    let panelLength = initial_x;
    let panelWidth = initial_z * 0.5;
    let panelDepth = CLT_Mat.t_CLT.value; // TO BE UPDATED TO CLT PANEL DEPTH
    let panel_y = columnHeight + bias + (panelDepth / 2);
    panelPositions = [
        new THREE.Vector3( initial_x * 0.5, panel_y, initial_z * 0.25 ),
        new THREE.Vector3( initial_x * 0.5, panel_y, initial_z * 0.75 ),
        new THREE.Vector3( initial_x * 0.5, panel_y, initial_z * 1.25 ),
        new THREE.Vector3( initial_x * 0.5, panel_y, initial_z * 1.75 ),];

    // Initial Geometry for Panels
    let toppingLength = panelLength;
    let toppingWidth = panelWidth;
    let toppingDepth = Topping_Mat.t_Topping.value; // TO BE UPDATED TO TOPPING MATERIAL PROPERTIES
    let topping_y = columnHeight + bias + panelDepth + (toppingDepth / 2);
    toppingPositions = [
        new THREE.Vector3( initial_x * 0.5, topping_y, initial_z * 0.25 ),
        new THREE.Vector3( initial_x * 0.5, topping_y, initial_z * 0.75 ),
        new THREE.Vector3( initial_x * 0.5, topping_y, initial_z * 1.25 ),
        new THREE.Vector3( initial_x * 0.5, topping_y, initial_z * 1.75 ),];

    //endregion

    //region Initial Structural Calculations
    // let inp_CustomCLT = Inputs.inputs_CustomCLT();
    // inp_CustomCLT.name = ini_CLT_Layup_Name;
    // inp_CustomCLT.layers = ini_CLT_Layup_layers;
    // inp_CustomCLT.grade = ini_CLT_Layup_grade;
    // inp_CustomCLT.t_l = ini_CLT_Layup_t_l;
    // inp_CustomCLT.t_t = ini_CLT_Layup_t_t;

    let ExL = new Inputs.inputs_ExL();
    ExL.DeadLoadOther = initial_DeadLoadOther;
    ExL.LiveLoad = initial_LiveLoad;
    let Fire = new Inputs.inputs_Fire();
    Fire.time = initial_FireTime;
    Fire.exposureMode = initial_FireExposureMode;

    let CLT = new Member.member("CLT", "CLT-01", "CLT member", initial_SpanModeCLT, initial_x / 12, 1);
    CLT.self_weight.value = CLT_Mat.SW_CLT.value;

    let GLT = new Member.member("GLT", "GLT-01", "Glulam member", initial_SpanModeGirder, initial_z / 12, initial_x / 12);

    let Members_above = [ CLT ];

    reiterateCalcs();
    //endregion

    //region Initial GUI Values
    let controller_Config = new function() {
        this.SpanCLT_ft = initial_x / 12;
        this.SpanGirder_ft = initial_z / 12;
        this.SpanModeCLT = initial_SpanModeCLT;
        this.SpanModeGirder = initial_SpanModeGirder;
        this.iterationMode = true;
        this.deadLoadOther = ExL.DeadLoadOther;
        this.liveLoad = ExL.LiveLoad;
        this.fireTime = Fire.time;
        this.fireExposureMode = Fire.exposureMode;
    }();
    let controller_CLT = new function() {
        this.maxDCR = CLT_max_str;
        this.maxDescription = CLT_max_description;
    }();
    let controller_GLT = new function() {
        this.maxDCR = GLT_max_str;
        this.maxDescription = GLT_max_description;
    }();
    let controller_CLT_Layup = new function() {
        this.name = "name"; //inp_CustomCLT.name;
        this.layers = 5; //inp_CustomCLT.layers;
        this.grade = "E1"; //inp_CustomCLT.grade;
        this.t_l = 1.38; //inp_CustomCLT.t_l;
        this.t_t = 1.38; //inp_CustomCLT.t_t;
    }();
    let controller_Cost = new function () {
        this.GLT_unit_cost = 250;
        this.CLT_unit_cost = 750;
    }();
    //endregion

    //region GUI
    const gui = new GUI( {width: 300} );

    const f1_1 = gui.addFolder('Configure Bay');
    let gui_SpanCLT = f1_1.add(controller_Config, 'SpanCLT_ft', 18, 30).name('Span of CLT ( ft )');
    let gui_SpanGirder = f1_1.add(controller_Config, 'SpanGirder_ft', 10, 25).name('Span of Girder ( ft )');
    let gui_SpanModeCLT = f1_1.add(controller_Config, 'SpanModeCLT', [ 'single-span', 'double-span' ]).name('Span Mode of CLT');
    let gui_SpanModeGirder = f1_1.add(controller_Config, 'SpanModeGirder', [ 'single-span', 'double-span' ]).name('Span Mode of Girder');
    let gui_iterationMode = f1_1.add(controller_Config, 'iterationMode').name('Optimize members');
    let gui_DeadLoadOther = f1_1.add(controller_Config, 'deadLoadOther', 0, 100).name('Dead Load (excl. self-weight)');
    let gui_LiveLoad = f1_1.add(controller_Config, 'liveLoad', [ 40,50, 80, 100 ]).name('Live Load');
    let gui_fireTime = f1_1.add(controller_Config, 'fireTime', [ '1 hour', '1.5 hours', '2 hours']).name('Fire exposure time');
    let gui_fireExposureMode = f1_1.add(controller_Config, 'fireExposureMode', [ '1 face', '2 faces', '3 faces']).name('Fire exposure mode');
    f1_1.open();

    const f1_3 = gui.addFolder('CLT Member');
    let gui_CLT_description = f1_3.add(controller_CLT, 'maxDescription').name('CLT description');
    let gui_CLT_maxDCR = f1_3.add(controller_CLT, 'maxDCR').name('Governing DCR');
    f1_3.open();

    const f1_4 = gui.addFolder('GLT Member');
    let gui_GLT_description = f1_4.add(controller_GLT, 'maxDescription').name('GLT description');
    let gui_GLT_maxDCR = f1_4.add(controller_GLT, 'maxDCR').name('Governing DCR');
    f1_4.open();

    const f2_1 = gui.addFolder('Cost');
    let gui_Cost_GLT = f2_1.add(controller_Cost, 'GLT_unit_cost', 100, 1000).name('GLT unit cost ( $ / ft^3 )');
    let gui_Cost_CLT = f2_1.add(controller_Cost, 'CLT_unit_cost', 500, 2000).name('CLT unit cost ( $ / ft^3 )');
    f2_1.open();

    const f3_3 = gui.addFolder('Configure a custom CLT Layup');
    let gui_CLT_Layup_Name = f3_3.add(controller_CLT_Layup, 'name');
    let gui_CLT_Layup_Layers = f3_3.add(controller_CLT_Layup, 'layers');
    let gui_CLT_Layup_Grade = f3_3.add(controller_CLT_Layup, 'grade');
    let gui_CLT_Layup_t_l = f3_3.add(controller_CLT_Layup, 't_l');
    let gui_CLT_Layup_t_t = f3_3.add(controller_CLT_Layup, 't_t');


    gui_iterationMode.onChange( function() {
        iterationMode = controller_Config.iterationMode;
        updateGUI_CalcValues();
        updateSpanCLT();
        updateSpanGirder();
    });
    gui_DeadLoadOther.onChange( function() {
        ExL.DeadLoadOther = controller_Config.deadLoadOther;
        updateGUI_CalcValues();
    });
    gui_LiveLoad.onChange( function() {
        ExL.LiveLoad = controller_Config.liveLoad;
        updateGUI_CalcValues();
    });
    gui_fireTime.onChange( function() {
        Fire.time = controller_Config.fireTime;
        updateGUI_CalcValues();
    });
    gui_fireExposureMode.onChange( function() {
        Fire.exposureMode = controller_Config.fireExposureMode;
        updateGUI_CalcValues();
    });
    // gui_CLT_Layup_t_l.onChange( function() {
    //     inp_CustomCLT.t_l = controller_CLT_Layup.t_l;
    //     updateGUI_CalcValues();
    // });
    gui_SpanCLT.onChange( function() {

        // Update 3D model
        updateSpanCLT();

        // Update Structural Calculations
        CLT.span.value = (controller_Config.SpanCLT_ft);
        GLT.spacing.value = (controller_Config.SpanCLT_ft);
        updateGUI_CalcValues();

    } );
    gui_SpanGirder.onChange( function() {

        // Update 3D model
        updateSpanGirder();

        // Update Structural Calculations
        GLT.span.value = (controller_Config.SpanGirder_ft);
        updateGUI_CalcValues();

    });
    gui_SpanModeCLT.onChange( function() {

        // Update Structural Calculations
        CLT.span_mode.value = controller_Config.SpanModeCLT;
        updateGUI_CalcValues();

    });
    gui_SpanModeGirder.onChange( function() {

        // Update Structural Calculations
        GLT.span_mode.value = controller_Config.SpanModeGirder;
        updateGUI_CalcValues();

    });
    gui_Cost_GLT.onChange( function() {

        // Update Structural Calculations
        updateGUI_CalcValues();

    });
    gui_Cost_CLT.onChange( function() {

        // Update Structural Calculations
        updateGUI_CalcValues();

    });
    gui.open();
    //endregion

    //region Add Members
    //region Add Column Objects
    for ( let i = 0; i < columnQty; i ++ ) {
        addColumnObject( columnPositions[ i ] );
    }

    columnPositions = [];
    for ( let i = 0; i < columnQty; i ++ ) {
        columnPositions.push( columnObjects[ i ].position );
    }
    //endregion

    //region Add Beam Objects
    for ( let i = 0; i < beamQty; i ++ ) {
        addBeamObject( beamPositions[ i ], beamWidth, beamDepth, beamLength );
    }

    beamPositions = [];
    for ( let i = 0; i < beamQty; i ++ ) {
        beamPositions.push( beamObjects[ i ].position );
    }
    //endregion

    //region Add Panel and Topping Objects
    for ( let i = 0; i < panelQty; i ++ ) {
        addPanelObject( panelPositions[ i ], panelWidth, panelDepth, panelLength );
        addToppingObject( toppingPositions[ i ], toppingWidth, toppingDepth, toppingLength );
    }

    panelPositions = [];
    toppingPositions = [];
    for ( let i = 0; i < panelQty; i ++ ) {
        panelPositions.push( panelObjects[ i ].position );
        toppingPositions.push( toppingObjects[ i ].position );
    }
    //endregion
    //endregion

    //region Reiterate structural calculations
    function reiterateCalcs() {
        CLT_MatCustom = CLT_Calc.CLT_Assembly(TW, "name", 5, "E1", 1.38, 1.38);

        if ( iterationMode ) {
            //region Iterate CLT calcs
            let CLT_max_name = "";
            for ( let i = 0; i < MatCat.CLT_catalog().catalog.length; i ++ ) {

                let CLT_Mat = MatCat.CLT_catalog().catalog[i];
                CLT.self_weight.value = CLT_Mat.SW_CLT.value;

                let dcr_values = [];
                let dcr_short_names = [];

                CLT_Loadings = CLT_Calc.CLT_Loadings(ExL, CLT, CLT_Mat, Topping_Mat, TW);
                CLT_Strength = CLT_Calc.CLT_Strength(CLT, CLT_Mat, CLT_Loadings);
                CLT_Serviceability = CLT_Calc.CLT_Serviceability(CLT, CLT_Mat, CLT_Loadings, TW);
                CLT_FireCheck = CLT_Calc.CLT_FireCheck(Fire, ExL, CLT, CLT_Mat, TW);

                dcr_values.push(CLT_Strength.DCR_b_single.value);
                dcr_values.push(CLT_Strength.DCR_s_double.value);
                dcr_values.push(CLT_Serviceability.DCR_d_live.value);
                dcr_values.push(CLT_Serviceability.DCR_d_total.value);
                dcr_values.push(CLT_Serviceability.DCR_v_single.value);
                dcr_values.push(CLT_FireCheck.DCR_fire.value);

                dcr_short_names.push("Moment");
                dcr_short_names.push("Shear");
                dcr_short_names.push("Deflection live");
                dcr_short_names.push("Deflection total");
                dcr_short_names.push("Vibration");
                dcr_short_names.push("Fire");

                let CLT_max_value = Math.max(...dcr_values);

                if (CLT_max_value < 1.0)
                {
                    for (let i_max = 0; i_max < dcr_values.length; i_max++)
                    {
                        if (dcr_values[i_max] === CLT_max_value)
                        {
                            CLT_max_name = dcr_short_names[i_max];
                        }
                    }

                    const numFormat = new Intl.NumberFormat('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: 3
                    });
                    CLT_max_str = CLT_max_name + " = " + numFormat.format(CLT_max_value);
                    CLT_max_description = CLT_Mat.name;
                    break;
                }
                else
                {
                    CLT_max_str = "... (member over-utilized)";
                    CLT_max_description = "... (member over-utilized)";
                }
            }
            //endregion

            //region Iterate GLT calcs
            let GLT_max_name = "";
            for ( let i = 0; i < MatCat.GLT_catalog().catalog.length; i ++ ) {

                GLT_Mat = MatCat.GLT_catalog().catalog[i];
                let dcr_values = [];
                let dcr_short_names = [];

                GLT_Loadings = GLT_Calc.GLT_Loadings(ExL, GLT, Members_above, GLT_Mat, Topping_Mat, TW);
                GLT_Strength = GLT_Calc.GLT_Strength(GLT, GLT_Mat, GLT_Loadings);
                GLT_Serviceability = GLT_Calc.GLT_Serviceability(GLT, GLT_Loadings);
                GLT_FireCheck = GLT_Calc.GLT_FireCheck(Fire, GLT, GLT_Mat, GLT_Strength, GLT_Loadings);

                dcr_values.push(GLT_Strength.DCR_moment.value);
                dcr_values.push(GLT_Strength.DCR_shear.value);
                dcr_values.push(GLT_Strength.DCR_shear_R.value);
                dcr_values.push(GLT_Serviceability.DCR_d_live.value);
                dcr_values.push(GLT_Serviceability.DCR_d_total.value);
                dcr_values.push(GLT_FireCheck.DCR_moment_fire.value);
                dcr_short_names.push("Moment");
                dcr_short_names.push("Shear");
                dcr_short_names.push("Shear (reduced section)");
                dcr_short_names.push("Live load deflection");
                dcr_short_names.push("Total deflection");
                dcr_short_names.push("Moment (after fire)");

                let GLT_max_value = Math.max(...dcr_values);

                if (GLT_max_value < 1.0)
                {
                    for (let i_max = 0; i_max < dcr_values.length; i_max++)
                    {
                        if (dcr_values[i_max] === GLT_max_value)
                        {
                            GLT_max_name = dcr_short_names[i_max];
                        }
                    }

                    const numFormat = new Intl.NumberFormat('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: 3
                    });
                    GLT_max_str = GLT_max_name + " = " + numFormat.format(GLT_max_value);
                    GLT_max_description = GLT_Mat.w.annotation + " x " + GLT_Mat.d.annotation;

                    break;
                }
                else
                {
                    GLT_max_str = "... (member over-utilized)";
                    GLT_max_description = "... (member over-utilized)";

                }
            }
            //endregion

        }
        else
        {
            const numFormat = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                maximumFractionDigits: 3
            });


            let CLT_Mat = MatCat.CLT_catalog().catalog[0];
            CLT.self_weight.value = CLT_Mat.SW_CLT.value;

            let CLT_dcr_values = [];
            let CLT_dcr_short_names = [];
            let CLT_max_name = "";

            CLT_Loadings = CLT_Calc.CLT_Loadings(ExL, CLT, CLT_Mat, Topping_Mat, TW);
            CLT_Strength = CLT_Calc.CLT_Strength(CLT, CLT_Mat, CLT_Loadings);
            CLT_Serviceability = CLT_Calc.CLT_Serviceability(CLT, CLT_Mat, CLT_Loadings, TW);
            CLT_FireCheck = CLT_Calc.CLT_FireCheck(Fire, ExL, CLT, CLT_Mat, TW);

            CLT_dcr_values.push(CLT_Strength.DCR_b_single.value);
            CLT_dcr_values.push(CLT_Strength.DCR_s_double.value);
            CLT_dcr_values.push(CLT_Serviceability.DCR_d_live.value);
            CLT_dcr_values.push(CLT_Serviceability.DCR_d_total.value);
            CLT_dcr_values.push(CLT_Serviceability.DCR_v_single.value);
            CLT_dcr_values.push(CLT_FireCheck.DCR_fire.value);

            CLT_dcr_short_names.push("Moment");
            CLT_dcr_short_names.push("Shear");
            CLT_dcr_short_names.push("Deflection live");
            CLT_dcr_short_names.push("Deflection total");
            CLT_dcr_short_names.push("Vibration");
            CLT_dcr_short_names.push("Fire");

            let CLT_max_value = Math.max(...CLT_dcr_values);

            for (let i_max = 0; i_max < CLT_dcr_values.length; i_max++)
            {
                if (CLT_dcr_values[i_max] === CLT_max_value)
                {
                    CLT_max_name = CLT_dcr_short_names[i_max];
                }
            }

            CLT_max_str = CLT_max_name + " = " + numFormat.format(CLT_max_value);
            CLT_max_description = CLT_Mat.name;


            GLT_Mat = MatCat.GLT_catalog().catalog[0];

            let GLT_dcr_values = [];
            let GLT_dcr_short_names = [];
            let GLT_max_name = "";

            GLT_Loadings = GLT_Calc.GLT_Loadings(ExL, GLT, Members_above, GLT_Mat, Topping_Mat, TW);
            GLT_Strength = GLT_Calc.GLT_Strength(GLT, GLT_Mat, GLT_Loadings);
            GLT_Serviceability = GLT_Calc.GLT_Serviceability(GLT, GLT_Loadings);
            GLT_FireCheck = GLT_Calc.GLT_FireCheck(Fire, GLT, GLT_Mat, GLT_Strength, GLT_Loadings);

            GLT_dcr_values.push(GLT_Strength.DCR_moment.value);
            GLT_dcr_values.push(GLT_Strength.DCR_shear.value);
            GLT_dcr_values.push(GLT_Strength.DCR_shear_R.value);
            GLT_dcr_values.push(GLT_Serviceability.DCR_d_live.value);
            GLT_dcr_values.push(GLT_Serviceability.DCR_d_total.value);
            GLT_dcr_values.push(GLT_FireCheck.DCR_moment_fire.value);

            GLT_dcr_short_names.push("Moment");
            GLT_dcr_short_names.push("Shear");
            GLT_dcr_short_names.push("Shear (reduced section)");
            GLT_dcr_short_names.push("Live load deflection");
            GLT_dcr_short_names.push("Total deflection");
            GLT_dcr_short_names.push("Moment (after fire)");

            let GLT_max_value = Math.max(...GLT_dcr_values);

            for (let i_max = 0; i_max < GLT_dcr_values.length; i_max++)
            {
                if (GLT_dcr_values[i_max] === GLT_max_value)
                {
                    GLT_max_name = GLT_dcr_short_names[i_max];
                }
            }

            GLT_max_str = GLT_max_name + " = " + numFormat.format(GLT_max_value);
            GLT_max_description = GLT_Mat.w.annotation + " x " + GLT_Mat.d.annotation;

        }

    }
    //endregion

    //region Update Controller
    function updateSpanCLT() {

        // Columns
        let indices = [3, 4, 5];
        for ( let i = 0; i < indices.length; i ++ ) {
            columnObjects[indices[i]].position.x = (controller_Config.SpanCLT_ft * 12);
            columnEdges[indices[i]].position.x = (controller_Config.SpanCLT_ft * 12);
        }

        // Beams
        indices = [1, 3];
        for ( let i = 0; i < indices.length; i ++ ) {
            beamObjects[indices[i]].position.x = (controller_Config.SpanCLT_ft * 12);
            beamEdges[indices[i]].position.x = (controller_Config.SpanCLT_ft * 12);
        }

        // Panels and Topping
        indices = [0, 1, 2, 3];
        for ( let i = 0; i < indices.length; i ++ ) {
            panelObjects[indices[i]].position.x = (controller_Config.SpanCLT_ft * 0.5 * 12);
            panelEdges[indices[i]].position.x = (controller_Config.SpanCLT_ft * 0.5 * 12);
            panelObjects[indices[i]].scale.x = (controller_Config.SpanCLT_ft * 12);
            panelEdges[indices[i]].scale.x = (controller_Config.SpanCLT_ft * 12);
            toppingObjects[indices[i]].position.x = (controller_Config.SpanCLT_ft * 0.5 * 12);
            toppingEdges[indices[i]].position.x = (controller_Config.SpanCLT_ft * 0.5 * 12);
            toppingObjects[indices[i]].scale.x = (controller_Config.SpanCLT_ft * 12);
            toppingEdges[indices[i]].scale.x = (controller_Config.SpanCLT_ft * 12);
        }

        panelLength = controller_Config.SpanCLT_ft * 12;

    }
    function updateSpanGirder() {

        // Columns
        let indices = [1, 4];
        for ( let i = 0; i < indices.length; i ++ ) {
            columnObjects[indices[i]].position.z = (controller_Config.SpanGirder_ft * 12);
            columnEdges[indices[i]].position.z = (controller_Config.SpanGirder_ft * 12);
        }

        indices = [2, 5];
        for ( let i = 0; i < indices.length; i ++ ) {
            columnObjects[indices[i]].position.z = (controller_Config.SpanGirder_ft * 2.0 * 12);
            columnEdges[indices[i]].position.z = (controller_Config.SpanGirder_ft * 2.0 * 12);
        }

        // Beams
        beamDepth = GLT_Mat.d.value * 0.0393701; // Convert depth from mm to inch
        beam_y = columnHeight - (beamDepth / 2);
        for ( let i = 0; i < beamQty; i ++ ) {
            beamObjects[i].scale.z = (controller_Config.SpanGirder_ft * 12) - columnWidth - bias;
            beamEdges[i].scale.z = (controller_Config.SpanGirder_ft * 12) - columnWidth - bias;

            beamObjects[i].scale.y = beamDepth;
            beamEdges[i].scale.y = beamDepth;

            beamObjects[i].position.y = beam_y;
            beamEdges[i].position.y = beam_y;
        }

        indices = [0, 1];
        for ( let i = 0; i < indices.length; i ++ ) {
            beamObjects[indices[i]].position.z = (controller_Config.SpanGirder_ft * 0.5 * 12);
            beamEdges[indices[i]].position.z = (controller_Config.SpanGirder_ft * 0.5 * 12);
        }

        indices = [2, 3];
        for ( let i = 0; i < indices.length; i ++ ) {
            beamObjects[indices[i]].position.z = (controller_Config.SpanGirder_ft * 1.5 * 12);
            beamEdges[indices[i]].position.z = (controller_Config.SpanGirder_ft * 1.5 * 12);
        }

        beamLength = (controller_Config.SpanGirder_ft * 12) - columnWidth - bias;

        // Panels and Topping
        for ( let i = 0; i < panelQty; i ++ ) {
            panelObjects[i].scale.z = (controller_Config.SpanGirder_ft * 0.5 * 12);
            panelEdges[i].scale.z = (controller_Config.SpanGirder_ft * 0.5 * 12);
            toppingObjects[i].scale.z = (controller_Config.SpanGirder_ft * 0.5 * 12);
            toppingEdges[i].scale.z = (controller_Config.SpanGirder_ft * 0.5 * 12);

            let m = 0.25 + (i * 0.5);
            panelObjects[i].position.z = (controller_Config.SpanGirder_ft * m * 12);
            panelEdges[i].position.z = (controller_Config.SpanGirder_ft * m * 12);
            toppingObjects[i].position.z = (controller_Config.SpanGirder_ft * m * 12);
            toppingEdges[i].position.z = (controller_Config.SpanGirder_ft * m * 12);
        }

        //panelLength = -1;
        panelWidth = controller_Config.SpanGirder_ft * 0.5 * 12;
        //panelDepth = -1;

    }
    function updateGUI_CalcValues() {

        GLT_unit_cost = controller_Cost.GLT_unit_cost;
        CLT_unit_cost = controller_Cost.CLT_unit_cost;

        reiterateCalcs();

        gui_CLT_maxDCR.setValue(CLT_max_str);
        gui_GLT_maxDCR.setValue(GLT_max_str);
        gui_CLT_description.setValue(CLT_max_description);
        gui_GLT_description.setValue(GLT_max_description);

        const costFormat = new Intl.NumberFormat('en-US', {
            style: 'decimal',
            maximumFractionDigits: 0
        });

        const volFormat = new Intl.NumberFormat('en-US', {
            style: 'decimal',
            maximumFractionDigits: 1
        });


        CLT_Volume = panelLength * panelWidth * panelDepth * 4 * inch3_to_ft3; // 4 = Panel Qty
        GLT_Columns_Volume = columnWidth * columnWidth * columnHeight * 6 * inch3_to_ft3; // 6 = Column Qty
        GLT_Girders_Volume = beamLength * beamWidth * beamDepth * 4 * inch3_to_ft3; // 4 = Beam Qty

        CLT_Cost = CLT_Volume * ft3_to_m3 * CLT_unit_cost;
        GLT_Columns_Cost = GLT_Columns_Volume * ft3_to_m3 * GLT_unit_cost;
        GLT_Girders_Cost = GLT_Girders_Volume * ft3_to_m3 * GLT_unit_cost;


        document.getElementById("sidebar_Cost_GLT_Columns").innerHTML = " $ " + costFormat.format(GLT_Columns_Cost);
        document.getElementById("sidebar_Cost_GLT_Girders").innerHTML = " $ " + costFormat.format(GLT_Girders_Cost);
        document.getElementById("sidebar_Cost_CLT_Panels").innerHTML = " $ " + costFormat.format(CLT_Cost);
        document.getElementById("sidebar_Cost_Topping").innerHTML = " $ " + costFormat.format(1);

        document.getElementById("sidebar_Volume_GLT_Columns").innerHTML = volFormat.format(GLT_Columns_Volume) + " ft^3";
        document.getElementById("sidebar_Volume_GLT_Girders").innerHTML = volFormat.format(GLT_Girders_Volume) + " ft^3";
        document.getElementById("sidebar_Volume_CLT_Panels").innerHTML = volFormat.format(CLT_Volume) + " ft^3";

        gui_CLT_maxDCR.setValue(CLT_max_str);
        gui_GLT_maxDCR.setValue(GLT_max_str);
        gui_CLT_description.setValue(CLT_max_description);
        gui_GLT_description.setValue(GLT_max_description);

        document.getElementById("sidebar_CLT_w_dead").innerHTML = CLT_Loadings.w_dead.annotation;
        document.getElementById("sidebar_CLT_w_live").innerHTML = CLT_Loadings.w_live.annotation;
        document.getElementById("sidebar_CLT_UDL_ULS_l").innerHTML = CLT_Loadings.UDL_ULS_l.annotation;
        document.getElementById("sidebar_CLT_UDL_ULS_s").innerHTML = CLT_Loadings.UDL_ULS_s.annotation;
        document.getElementById("sidebar_CLT_M_z_sup").innerHTML = CLT_Loadings.M_z_sup.annotation;
        document.getElementById("sidebar_CLT_V_y_ULS").innerHTML = CLT_Loadings.V_y_ULS.annotation;

        document.getElementById("sidebar_CLT_M1_s_ASD").innerHTML = CLT_Strength.M1_s_ASD.annotation;
        document.getElementById("sidebar_CLT_V_s_ASD").innerHTML = CLT_Strength.V_s_ASD.annotation;
        document.getElementById("sidebar_CLT_DCR_b_single").innerHTML = CLT_Strength.DCR_b_single.annotation;
        document.getElementById("sidebar_CLT_DCR_s_double").innerHTML = CLT_Strength.DCR_s_double.annotation;

        document.getElementById("sidebar_CLT_EI_app").innerHTML = CLT_Serviceability.EI_app.annotation;
        document.getElementById("sidebar_CLT_DELTA_y_s").innerHTML = CLT_Serviceability.DELTA_y_s.annotation;
        document.getElementById("sidebar_CLT_DELTA_y_l").innerHTML = CLT_Serviceability.DELTA_y_l.annotation;
        document.getElementById("sidebar_CLT_l_max").innerHTML = CLT_Serviceability.l_max.annotation;
        document.getElementById("sidebar_CLT_DCR_d_live").innerHTML = CLT_Serviceability.DCR_d_live.annotation;
        document.getElementById("sidebar_CLT_DCR_d_total").innerHTML = CLT_Serviceability.DCR_d_total.annotation;
        document.getElementById("sidebar_CLT_DCR_v_single").innerHTML = CLT_Serviceability.DCR_v_single.annotation;
        document.getElementById("sidebar_CLT_EQ_delta_lim_live").innerHTML = CLT_Serviceability.EQ_delta_lim_live;
        document.getElementById("sidebar_CLT_EQ_delta_lim_total").innerHTML = CLT_Serviceability.EQ_delta_lim_total;

        document.getElementById("sidebar_CLT_t_fo_l").innerHTML = CLT_FireCheck.t_fo_l.annotation;
        document.getElementById("sidebar_CLT_n_lam_l").innerHTML = CLT_FireCheck.n_lam_l.annotation;
        document.getElementById("sidebar_CLT_a_char_l").innerHTML = CLT_FireCheck.a_char_l.annotation;
        document.getElementById("sidebar_CLT_h_fire").innerHTML = CLT_FireCheck.h_fire.annotation;
        document.getElementById("sidebar_CLT_t_remaining").innerHTML = CLT_FireCheck.t_remaining.annotation;
        document.getElementById("sidebar_CLT_y_remaining").innerHTML = CLT_FireCheck.y_remaining.annotation;
        document.getElementById("sidebar_CLT_y_bar").innerHTML = CLT_FireCheck.y_bar.annotation;
        document.getElementById("sidebar_CLT_I_eff1").innerHTML = CLT_FireCheck.I_eff1.annotation;
        document.getElementById("sidebar_CLT_I_eff2").innerHTML = CLT_FireCheck.I_eff2.annotation;
        document.getElementById("sidebar_CLT_I_eff").innerHTML = CLT_FireCheck.I_eff.annotation;
        document.getElementById("sidebar_CLT_S_eff").innerHTML = CLT_FireCheck.S_eff.annotation;
        document.getElementById("sidebar_CLT_M1").innerHTML = CLT_FireCheck.M1.annotation;
        document.getElementById("sidebar_CLT_DL").innerHTML = CLT_FireCheck.DL.annotation;
        document.getElementById("sidebar_CLT_W_tot").innerHTML = CLT_FireCheck.W_tot.annotation;
        document.getElementById("sidebar_CLT_M_z").innerHTML = CLT_FireCheck.M_z.annotation;
        document.getElementById("sidebar_CLT_DCR_fire").innerHTML = CLT_FireCheck.DCR_fire.annotation;

        document.getElementById("sidebar_GLT_UDL_ULS").innerHTML = GLT_Loadings.UDL_ULS.annotation;
        document.getElementById("sidebar_GLT_w_dead").innerHTML = GLT_Loadings.w_dead.annotation;
        document.getElementById("sidebar_GLT_w_live").innerHTML = GLT_Loadings.w_live.annotation;
        document.getElementById("sidebar_GLT_UDL_ULS_l").innerHTML = GLT_Loadings.UDL_ULS_l.annotation;
        document.getElementById("sidebar_GLT_UDL_ULS_s").innerHTML = GLT_Loadings.UDL_ULS_s.annotation;
        document.getElementById("sidebar_GLT_I_xx").innerHTML = GLT_Loadings.I_xx.annotation;
        document.getElementById("sidebar_GLT_S_xx").innerHTML = GLT_Loadings.S_xx.annotation;
        document.getElementById("sidebar_GLT_M_z_span").innerHTML = GLT_Loadings.M_z_span.annotation;
        document.getElementById("sidebar_GLT_M_z_sup").innerHTML = GLT_Loadings.M_z_sup.annotation;
        document.getElementById("sidebar_GLT_M_z").innerHTML = GLT_Loadings.M_z.annotation;
        document.getElementById("sidebar_GLT_V_y_ULS").innerHTML = GLT_Loadings.V_y_ULS.annotation;
        document.getElementById("sidebar_GLT_A_g").innerHTML = GLT_Loadings.A_g.annotation;
        document.getElementById("sidebar_GLT_A_n").innerHTML = GLT_Loadings.A_n.annotation;
        document.getElementById("sidebar_GLT_SW_GLT").innerHTML = GLT_Loadings.SW_GLT.annotation;

        document.getElementById("sidebar_GLT_C_v").innerHTML = GLT_Strength.C_v.annotation;
        document.getElementById("sidebar_GLT_E1_min").innerHTML = GLT_Strength.E1_min.annotation;
        document.getElementById("sidebar_GLT_l_e_top").innerHTML = GLT_Strength.l_e_top.annotation;
        document.getElementById("sidebar_GLT_l_e_bottom").innerHTML = GLT_Strength.l_e_bottom.annotation;
        document.getElementById("sidebar_GLT_DCR_moment_span").innerHTML = GLT_Strength.DCR_moment_span.annotation;
        document.getElementById("sidebar_GLT_DCR_moment_sup").innerHTML = GLT_Strength.DCR_moment_sup.annotation;
        document.getElementById("sidebar_GLT_DCR_moment").innerHTML = GLT_Strength.DCR_moment.annotation;
        document.getElementById("sidebar_GLT_DCR_shear").innerHTML = GLT_Strength.DCR_shear.annotation;
        document.getElementById("sidebar_GLT_DCR_shear_R").innerHTML = GLT_Strength.DCR_shear_R.annotation;
        document.getElementById("sidebar_GLT_C_v").innerHTML = GLT_Strength.C_v.annotation;
        document.getElementById("sidebar_GLT_C_v").innerHTML = GLT_Strength.C_v.annotation;
        document.getElementById("sidebar_GLT_C_v").innerHTML = GLT_Strength.C_v.annotation;

        document.getElementById("sidebar_GLT_E").innerHTML = GLT_Serviceability.E.annotation;
        document.getElementById("sidebar_GLT_DELTA_y_s").innerHTML = GLT_Serviceability.DELTA_y_s.annotation;
        document.getElementById("sidebar_GLT_DELTA_y_l").innerHTML = GLT_Serviceability.DELTA_y_l.annotation;
        document.getElementById("sidebar_GLT_DELTA_y").innerHTML = GLT_Serviceability.DELTA_y.annotation;
        document.getElementById("sidebar_GLT_DCR_d_live").innerHTML = GLT_Serviceability.DCR_d_live.annotation;
        document.getElementById("sidebar_GLT_DCR_d_total").innerHTML = GLT_Serviceability.DCR_d_total.annotation;
        document.getElementById("sidebar_GLT_EQ_delta_lim_live").innerHTML = GLT_Serviceability.EQ_delta_lim_live;
        document.getElementById("sidebar_GLT_EQ_delta_lim_total").innerHTML = GLT_Serviceability.EQ_delta_lim_total;

        document.getElementById("sidebar_GLT_R_b_fire_top").innerHTML = GLT_FireCheck.R_b_fire_top.annotation;
        document.getElementById("sidebar_GLT_R_b_fire_bottom").innerHTML = GLT_FireCheck.R_b_fire_bottom.annotation;
        document.getElementById("sidebar_GLT_F_bE_fire_top").innerHTML = GLT_FireCheck.F_bE_fire_top.annotation;
        document.getElementById("sidebar_GLT_F_bE_fire_bottom").innerHTML = GLT_FireCheck.F_bE_fire_bottom.annotation;
        document.getElementById("sidebar_GLT_C_L_fire_span").innerHTML = GLT_FireCheck.C_L_fire_span.annotation;
        document.getElementById("sidebar_GLT_C_L_fire_sup").innerHTML = GLT_FireCheck.C_L_fire_sup.annotation;
        document.getElementById("sidebar_GLT_c_l_fire_pos").innerHTML = GLT_FireCheck.c_l_fire_pos.annotation;
        document.getElementById("sidebar_GLT_c_l_fire_neg").innerHTML = GLT_FireCheck.c_l_fire_neg.annotation;
        document.getElementById("sidebar_GLT_F_b_fire_span").innerHTML = GLT_FireCheck.F_b_fire_span.annotation;
        document.getElementById("sidebar_GLT_F_b_fire_sup").innerHTML = GLT_FireCheck.F_b_fire_sup.annotation;
        document.getElementById("sidebar_GLT_M_residual_span").innerHTML = GLT_FireCheck.M_residual_span.annotation;
        document.getElementById("sidebar_GLT_M_residual_sup").innerHTML = GLT_FireCheck.M_residual_sup.annotation;
        document.getElementById("sidebar_GLT_DCR_moment_fire_span").innerHTML = GLT_FireCheck.DCR_moment_fire_span.annotation;
        document.getElementById("sidebar_GLT_DCR_moment_fire_sup").innerHTML = GLT_FireCheck.DCR_moment_fire_sup.annotation;
        document.getElementById("sidebar_GLT_DCR_moment_fire").innerHTML = GLT_FireCheck.DCR_moment_fire.annotation;

        switch (GLT.span_mode.value)
        {
            case "single-span":
                document.getElementById("sidebar_GLT_DCR_moment_span").innerHTML = 'N/A';
                document.getElementById("sidebar_GLT_DCR_moment_sup").innerHTML = 'N/A';
                document.getElementById("sidebar_GLT_DCR_moment_fire_span").innerHTML = 'N/A';
                document.getElementById("sidebar_GLT_DCR_moment_fire_sup").innerHTML = 'N/A';

                break;
            case "double-span":
                document.getElementById("sidebar_GLT_DCR_moment").innerHTML = 'N/A';
                document.getElementById("sidebar_GLT_DCR_moment_fire").innerHTML = 'N/A';

                break;
            default:
                break;
        }

    }
    //endregion
}


//region Update functions
function animate() {
    controls.update();
    requestAnimationFrame( animate );
    render();
    //stats.update();

}
function render() {
    //splines.uniform.mesh.visible = params.uniform;
    renderer.render( scene, camera );
}
//endregion

//region Startup functions
function addSceneElements() {
    // Spot Light
    const light = new THREE.SpotLight( 0xffffff, 1.25 );
    light.position.set( 800, 3000, 1200 );
    light.castShadow = true;
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 30, 1, 200, 3600 ) );
    light.shadow.bias = - 0.00005;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    scene.add( light );

    // Plane
    const planeGeometry = new THREE.PlaneBufferGeometry( 2000, 4000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    const planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add( plane );

    // Grid Helper
    const helper = new THREE.GridHelper( 2000, 100 );
    helper.position.y = 0.1;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );
}
function addColumnObject( position ) {
    let columnMaterial = new THREE.MeshLambertMaterial( {color: 0x996600} );
    let columnMesh = new THREE.Mesh( columnGeo, columnMaterial );
    if ( position ) {
        columnMesh.position.copy( position );
    }

    let edgeMaterial = new THREE.LineBasicMaterial( { color:0x392613 } );
    let geo_columnEdges = new THREE.EdgesGeometry( columnMesh.geometry );
    let geo_line = new THREE.LineSegments( geo_columnEdges, edgeMaterial );
    if ( position ) {
        geo_line.position.copy( position );
    }

    columnMesh.castShadow = true;
    columnMesh.receiveShadow = true;
    scene.add( columnMesh );
    columnObjects.push( columnMesh );

    scene.add( geo_line );
    columnEdges.push( geo_line );

    return columnMesh;
}
function addBeamObject( position, width, depth, length ) {
    let beamMaterial = new THREE.MeshLambertMaterial( {color: 0x996600} );
    let beamMesh = new THREE.Mesh( beamGeo, beamMaterial );
    if ( position ) {
        beamMesh.position.copy( position );
    }

    let edgeMaterial = new THREE.LineBasicMaterial( { color:0x392613 } );
    let geo_beamEdges = new THREE.EdgesGeometry( beamMesh.geometry );
    let geo_line = new THREE.LineSegments( geo_beamEdges, edgeMaterial );
    if ( position ) {
        geo_line.position.copy( position );
    }

    beamMesh.scale.x = width;
    beamMesh.scale.y = depth;
    beamMesh.scale.z = length;
    beamMesh.castShadow = true;
    beamMesh.receiveShadow = true;
    scene.add( beamMesh );
    beamObjects.push( beamMesh );

    geo_line.scale.x = width;
    geo_line.scale.y = depth;
    geo_line.scale.z = length;
    scene.add( geo_line );
    beamEdges.push( geo_line );

    return beamMesh;
}
function addPanelObject( position, width, depth, length ) {
    let panelMaterial = new THREE.MeshLambertMaterial( {color: 0x887325} );
    let panelMesh = new THREE.Mesh( panelGeo, panelMaterial );
    if ( position ) {
        panelMesh.position.copy( position );
    }

    let edgeMaterial = new THREE.LineBasicMaterial( { color:0x392613 } );
    let geo_panelEdges = new THREE.EdgesGeometry( panelMesh.geometry );
    let geo_line = new THREE.LineSegments( geo_panelEdges, edgeMaterial );
    if ( position ) {
        geo_line.position.copy( position );
    }

    panelMesh.scale.x = length;
    panelMesh.scale.y = depth;
    panelMesh.scale.z = width;
    panelMesh.castShadow = true;
    panelMesh.receiveShadow = true;
    scene.add( panelMesh );
    panelObjects.push( panelMesh );

    geo_line.scale.x = length;
    geo_line.scale.y = depth;
    geo_line.scale.z = width;
    scene.add( geo_line );
    panelEdges.push( geo_line );

    return panelMesh;
}
function addToppingObject( position, width, depth, length ) {
    let toppingMaterial = new THREE.MeshLambertMaterial( {color: 0x404040} );
    let toppingMesh = new THREE.Mesh( toppingGeo, toppingMaterial );
    if ( position ) {
        toppingMesh.position.copy( position );
    }

    let edgeMaterial = new THREE.LineBasicMaterial( { color:0x392613 } );
    let geo_toppingEdges = new THREE.EdgesGeometry( toppingMesh.geometry );
    let geo_line = new THREE.LineSegments( geo_toppingEdges, edgeMaterial );
    if ( position ) {
        geo_line.position.copy( position );
    }

    toppingMesh.scale.x = length;
    toppingMesh.scale.y = depth;
    toppingMesh.scale.z = width;
    toppingMesh.castShadow = true;
    toppingMesh.receiveShadow = true;
    scene.add( toppingMesh );
    toppingObjects.push( toppingMesh );

    geo_line.scale.x = length;
    geo_line.scale.y = depth;
    geo_line.scale.z = width;
    scene.add( geo_line );
    toppingEdges.push( geo_line );

    return toppingMesh;
}
//endregion

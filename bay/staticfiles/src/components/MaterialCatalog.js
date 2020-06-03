import * as Material from "./Material";

export function CLT_catalog () {

    let K5_0630V = new Material.CLT_Material(
        "K5-0630",
        "V-grade",
        "5-ply",
        'CLT',
        6.285,
        14.718516,
        293E+006,
        4125,
        0.91E006,
        2270,
        1.375,
        1.08,
        875,
        1.4E006,
        450,
        26.1,
        1.5
    );
    let K7_0760V = new Material.CLT_Material(
        "K7-0760",
        "V-grade",
        "7-ply",
        'CLT',
        7.56,
        17.704373,
        435E+006,
        5100,
        1.10E006,
        2725,
        1.08,
        1.08,
        875,
        1.4E006,
        450,
        26.1,
        1.5
    );
    let K5_0630E = new Material.CLT_Material(
        "K5-0630",
        "E-grade",
        "5-ply",
        'CLT',
        6.285,
        14.718516,
        310E+006,
        7770,
        0.92E006,
        2268,
        1.375,
        1.08,
        1650,
        1.5E006,
        450,
        26.1,
        1.5
    );
    let K7_0760E = new Material.CLT_Material(
        "K7-0760",
        "E-grade",
        "7-ply",
        'CLT',
        7.56,
        17.704373,
        470E+006,
        9606,
        1.08E006,
        2722,
        1.08,
        1.08,
        1650,
        1.5E006,
        450,
        26.1,
        1.5
    );

    let catalog = [
        K5_0630V,
        K5_0630E,
        K7_0760V,
        K7_0760E
    ];

    return { catalog };
}

export function GLT_catalog () {

    let MinThickness = 228;
    let LamThickness = 38;
    let t = 0;
    let GLT_w = 273;

    let catalog = [];

    for ( let i = 0; i < 37; i ++ ) {
        t = MinThickness + (LamThickness * i);
        let GLT = new Material.GLT_Material(
            "GLT" + i,
            "V4",
            "Glulam material",
            'GLT',
            t,
            GLT_w,
            2400,
            1850,
            265,
            1.8E06,
            0.95E06,
            500,
            12.7
        );

        catalog.push( GLT );
    }

    for ( let i = 0; i < 37; i ++ ) {
        t = MinThickness + (LamThickness * i);
        let GLT = new Material.GLT_Material(
            "GLT" + i,
            "V8",
            "Glulam material",
            'GLT',
            t,
            GLT_w,
            2400,
            2400,
            265,
            1.8E06,
            0.95E06,
            500,
            12.7
        );

        catalog.push( GLT );
    }

    return { catalog };
}

export function Topping_catalog () {

    let CONC_2in = new Material.Topping_Material(
        "CONC_2in",
        "Concrete topping, 2 inch thick",
        'Topping',
        2.0,
        2406,
        25.039041
    );
    let CONC_3in = new Material.Topping_Material(
        "CONC_3in",
        "Concrete topping, 3 inch thick",
        'Topping',
        3.0,
        2406,
        37.558562
    );

    let catalog = [
        CONC_2in,
        CONC_3in
    ];

    return { catalog };
}

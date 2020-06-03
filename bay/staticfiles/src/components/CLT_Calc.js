import * as CalcParam from './CalcParam.js';
import * as Material from "./Material";

export function CLT_Loadings (ExL, CLT, CLT_Mat, Topping_Mat, TW) {

    // *** Replace with CalcParams ***
    let DL_factor = 1.0;
    let LL_factor = 1.0;

    // STEP 3: LOADING FROM ON THE CLT FLOOR
    let SW_CONC = Topping_Mat.SW_Topping.value;
    let DeadLoadOther = ExL.DeadLoadOther;
    let DL = SW_CONC + DeadLoadOther;
    let LL = ExL.LiveLoad;

    let SW_CLT = CLT_Mat.SW_CLT.value;
    let _w_dead = (SW_CLT + DL) * TW;
    let _w_live = LL * TW;


    // STEP 4: STRENGTH DEMANDS ON THE CLT PANEL (ASD LOAD COMBINATION)
    let Span_CLT = CLT.span.value;

    let _UDL_ULS = (DL_factor * _w_dead) + (LL_factor * _w_live);
    let _UDL_ULS_s = LL_factor * _w_live;
    let _UDL_ULS_l = DL_factor * _w_dead;
    let _M_z_sup;
    let _V_y_ULS;

    switch (CLT.span_mode.value)
    {
        case "single-span":
            _M_z_sup = 0.125 * _UDL_ULS * Math.pow(Span_CLT, 2);
            break;
        case "double-span":
            _M_z_sup = 0.125 * _UDL_ULS * Span_CLT * Span_CLT;
            break;
        case "triple-span":
            _M_z_sup = 0.1 * _UDL_ULS * Span_CLT * Span_CLT;
            break;
        default:
            _M_z_sup = 0.125 * _UDL_ULS * Math.pow(Span_CLT, 2); // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    switch (CLT.span_mode.value)
    {
        case "single-span":
            _V_y_ULS = (_UDL_ULS * Span_CLT) / 2.0;
            break;
        case "double-span":
            _V_y_ULS = (0.125 * _UDL_ULS * Span_CLT) / 2.0;
            break;
        case "triple-span":
            _V_y_ULS = 0.6 * _UDL_ULS * Span_CLT;
            break;
        default:
            _V_y_ULS = (_UDL_ULS * Span_CLT) / 2.0; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    return {
        w_dead: new CalcParam.calcParam(' w_dead', 'this is a param', _w_dead, 'lbf/ft'),
        w_live: new CalcParam.calcParam(' w_live', 'this is a param', _w_live, 'lbf/ft'),
        UDL_ULS_l: new CalcParam.calcParam(' UDL_ULS_l', 'this is a param', _UDL_ULS_l, 'lbf/ft'),
        UDL_ULS_s: new CalcParam.calcParam(' UDL_ULS_s', 'this is a param', _UDL_ULS_s, 'lbf/ft'),
        M_z_sup: new CalcParam.calcParam(' M_z_sup', 'this is a param', _M_z_sup, 'lbf ft'),
        V_y_ULS: new CalcParam.calcParam(' V_y_ULS', 'this is a param', _V_y_ULS, 'lbf')
    };
}

export function CLT_Strength (CLT, CLT_Mat, Loadings) {

    // Hard-coded for now. Eventually needs to draw CLT factors from the CLT member object
    let C_D = 1.0;
    let C_M = 1.0;
    let C_t = 1.0;
    let C_L = 1.0;

    // Data from Loadings
    let M_z_sup = Loadings.M_z_sup.value;
    let V_y_ULS = Loadings.V_y_ULS.value;


    // STEP 7: MAXIMUM MOMENT RESISTANCE OF THE CLT PANEL
    let FbS_eff = CLT_Mat.FbS_eff.value;
    let _M1_s_ASD = FbS_eff * C_D * C_M * C_t * C_L;

    // STEP 8: DEMAND TO CAPACITY RATIO - FOR MOMENTS
    let _DCR_b_single = M_z_sup / _M1_s_ASD;

    // STEP 9: MAXIMUM SHEAR RESISTANCE OF THE CLT PANEL
    let V_s = CLT_Mat.V_s.value;
    let _V_s_ASD = V_s * C_D * C_M * C_t;

    // STEP 10: DEMAND TO CAPACITY RATIO - FOR SHEAR
    let _DCR_s_double = V_y_ULS / _V_s_ASD;

    return {
        M1_s_ASD: new CalcParam.calcParam(' M1_s_ASD', 'Bending strength (a.k.a. moment resistance) of the CLT panel', _M1_s_ASD, 'lbf ft'),
        V_s_ASD: new CalcParam.calcParam(' V_s_ASD', 'Shear resistance of the CLT panel', _V_s_ASD, 'lbf'),
        DCR_b_single: new CalcParam.calcParam(' DCR_b_single', 'this is a param', _DCR_b_single, ''),
        DCR_s_double: new CalcParam.calcParam(' DCR_s_double', 'this is a param', _DCR_s_double, '')
    };
}

export function CLT_Serviceability (CLT, CLT_Mat, Loadings, TW) {

    // Data from CLT member
    let Span_CLT_inch = CLT.span.value * 12.0; // Convert from ft to inch
    let CLT_span_mode = CLT.span_mode.value;

    // Data from Material Properties
    let EI_eff = CLT_Mat.EI_eff.value;
    let GA_eff = CLT_Mat.GA_eff.value;
    let Den_CLT = CLT_Mat.Den_CLT.value;
    let t_CLT = CLT_Mat.t_CLT.value;

    // Data from Loadings
    let UDL_SLS_s_inch = Loadings.UDL_ULS_s.value / 12.0; // Convert from lbf/ft to lbf/in
    let UDL_SLS_l_inch = Loadings.UDL_ULS_l.value / 12.0; // Convert from lbf/ft to lbf/in

    // Retrieve input: CLT Factors
    // Ks: Shear deformation adjustment for continuous CLT
    let Ks;
    switch (CLT_span_mode)
    {
        case "single-span":
            Ks = 11.5; // Single-span
            break;
        case "double-span":
            Ks = 57.6; // Double-span
            break;
        case "triple-span":
            Ks = 57.6; // Triple-span (CHECK WITH HERCEND)
            break;
        default:
            Ks = 11.5; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    // STEP 11: APPLIED BEAM DEFLECTION
    let _EI_app = EI_eff / (1 + ((Ks * EI_eff) / (GA_eff * Math.pow(Span_CLT_inch, 2))));

    let _DELTA_y_s;
    let _DELTA_y_l;
    switch (CLT_span_mode)
    {
        case "single-span":
            _DELTA_y_s = ((5.0 * UDL_SLS_s_inch * Math.pow(Span_CLT_inch, 4)) / (384 * _EI_app));
            _DELTA_y_l = ((5.0 * UDL_SLS_l_inch * Math.pow(Span_CLT_inch, 4)) / (384 * _EI_app));
            break;
        case "double-span":
            _DELTA_y_s = ((UDL_SLS_s_inch * Math.pow(Span_CLT_inch, 4)) / (185 * _EI_app));
            _DELTA_y_l = ((UDL_SLS_l_inch * Math.pow(Span_CLT_inch, 4)) / (185 * _EI_app));
            break;
        case "triple-span":
            _DELTA_y_s = ((0.0069 * UDL_SLS_s_inch * Math.pow(Span_CLT_inch, 4)) / _EI_app);
            _DELTA_y_l = ((0.0069 * UDL_SLS_l_inch * Math.pow(Span_CLT_inch, 4)) / _EI_app);
            break;
        default:
            _DELTA_y_s = ((5.0 * UDL_SLS_s_inch * Math.pow(Span_CLT_inch, 4)) / (384 * _EI_app)); // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            _DELTA_y_l = ((5.0 * UDL_SLS_l_inch * Math.pow(Span_CLT_inch, 4)) / (384 * _EI_app)); // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    let DELTA_single = _DELTA_y_l + _DELTA_y_s;


    // STEP 12: DEMAND TO CAPACITY RATIO - FOR DEFLECTION
    let delta_lim_live = Span_CLT_inch / 360;
    let delta_lim_total = Span_CLT_inch / 240;

    let _DCR_d_live = _DELTA_y_s / delta_lim_live;
    let _DCR_d_total = DELTA_single / delta_lim_total;

    // STEP 13: VIBRATION CHECK
    let _l_max = (1 / 12.05) * (Math.pow(_EI_app, 0.293) / Math.pow(((Den_CLT / 100) * t_CLT * TW), 0.122));

    let _DCR_v_single = CLT.span.value / _l_max;


    return {
        EI_app: new CalcParam.calcParam(' EI_app', 'Applied deflection due to long term loading', _EI_app, 'in'),
        DELTA_y_s: new CalcParam.calcParam(' DELTA_y_s', 'Applied deflection due to short term loading', _DELTA_y_s, 'in'),
        DELTA_y_l: new CalcParam.calcParam(' DELTA_y_l', 'Applied deflection due to long term loading', _DELTA_y_l, 'in'),
        l_max: new CalcParam.calcParam(' l_max', '', _l_max, 'in'),
        DCR_d_live: new CalcParam.calcParam(' DCR_d_live', 'this is a param', _DCR_d_live, ''),
        DCR_d_total: new CalcParam.calcParam(' DCR_d_total', 'this is a param', _DCR_d_total, ''),
        DCR_v_single: new CalcParam.calcParam(' DCR_v_single', 'this is a param', _DCR_v_single, ''),
        EQ_delta_lim_live: 'Span_CLT / 360',
        EQ_delta_lim_total: 'Span_CLT / 240'
    };
}

export function CLT_FireCheck (Fire, ExL, CLT, CLT_Mat, TW) {

    // Data from CLT member
    let CLT_spacing = CLT.spacing.value;
    let CLT_span = CLT.span.value;

    // Data from CLT_Mat
    let t_CLT = CLT_Mat.t_CLT.value;
    let t_l = CLT_Mat.t_l.value;
    let Beta_n = CLT_Mat.Beta_n.value;
    let t_t = CLT_Mat.t_t.value;
    let F_b_0 = CLT_Mat.F_b_0.value;
    let SG = CLT_Mat.SG.value;

    // Data from External Loads (ExL)
    let LL = ExL.LiveLoad;

    // Data from Fire
    let time;
    switch (Fire.time)
    {
        case '1 hour':
            time = 1.0;
            break;
        case '1.5 hours':
            time = 1.5;
            break;
        case '2 hours':
            time = 2.0;
            break;
        default:
            time = 1.0; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    // STEP 1: CALCULATION OF LAMINATION FALL-OFF TIME
    let _t_fo_l = Math.pow(t_l / Beta_n, 1.23);
    let _n_lam_l = Math.floor(time / _t_fo_l);

    // STEP 2: CALCULATION OF THE EFFECTIVE CHAR DEPTH
    let _a_char_l = 1.2 * Math.pow(_n_lam_l * t_l + Beta_n * (time - (_n_lam_l * _t_fo_l)), 0.813);

    // STEP 3: DETERMINATION OF EFFECTIVE RESIDUAL CROSS-SECTION
    let _h_fire = t_CLT - _a_char_l;
    let _t_remaining = t_l - ((t_l + t_t + t_l) - _h_fire); // Need to generalize. This currently assumes 5-ply CLT
    let _y_remaining = (_t_remaining / 2.0) + (t_l + t_t);  // Need to generalize. This currently assumes 5-ply CLT

    // STEP 4: DETERMINATION OF LOCATION OF NEUTRAL AXIS
    // AND SECTION PROPERTIES OF THE EFFECTIVE RESIDUAL CROSS-SECTION
    let _y_bar = (((t_l / 2.0) * t_l) + (_y_remaining * _t_remaining)) / (t_l + _t_remaining);
    let _I_eff1 = (Math.pow(TW * t_l, 3) / 12.0) + (Math.pow(TW * _t_remaining, 3) / 12.0);
    let _I_eff2 = (TW * t_l * (_y_bar - Math.pow(t_l / 2.0, 2)) + (TW * _t_remaining * Math.pow(_y_remaining - _y_bar, 2)));
    let _I_eff = _I_eff1 + _I_eff2;

    // STEP 5: CALCULATION OF DESIGN RESISTING MOMENT
    let _S_eff = _I_eff / (_h_fire - _y_bar);
    let _M1 = 2.85 * 0.85 * F_b_0 * _S_eff;

    // STEP 6: DEMANDS
    let _DL = SG * _h_fire;
    let _W_tot = _DL + LL;
    let _M_z = ((_W_tot * TW) * Math.pow(CLT_span, 2)) / 8.0;

    // STEP 20: DEMAND TO CAPACITY RATIO - FOR MOMENTS
    let _DCR_fire = _M_z / _M1;


    return {
        t_fo_l: new CalcParam.calcParam(' t_fo_l', 'The time (in hours) to reach a glue line for long. layers', _t_fo_l, 'hours'),
        n_lam_l: new CalcParam.calcParam(' n_lam_l', 'Number of laminations charred', _n_lam_l, 'qty'),
        a_char_l: new CalcParam.calcParam(' a_char_l', 'Effective char depths for longitudinal layers', _a_char_l, 'in'),
        h_fire: new CalcParam.calcParam(' h_fire', 'Reduced thickness of CLT panel after fire exposure', _h_fire, 'in'),
        t_remaining: new CalcParam.calcParam(' t_remaining', 'Reduced thickness of CLT panel after fire exposure', _t_remaining, 'in'),
        y_remaining: new CalcParam.calcParam(' y_remaining', 'Location of the centroid of the undamaged layer to the top of the CLT (uncharred)', _y_remaining, 'in'),
        y_bar: new CalcParam.calcParam(' y_bar', 'Neutral axis location', _y_bar, 'in'),
        I_eff1: new CalcParam.calcParam(' I_eff1', 'no description', _I_eff1, 'in^4'),
        I_eff2: new CalcParam.calcParam(' I_eff2', 'no description', _I_eff2, 'in^4'),
        I_eff: new CalcParam.calcParam(' I_eff', 'no description', _I_eff, 'in^4'),
        S_eff: new CalcParam.calcParam(' S_eff', 'no description', _S_eff, 'in^3'),
        M1: new CalcParam.calcParam(' M1', 'no description', _M1, 'lbf ft'),
        DL: new CalcParam.calcParam(' DL', 'Dead load', _DL, 'psf'),
        W_tot: new CalcParam.calcParam(' W_tot', 'no description', _W_tot, 'psf'),
        M_z: new CalcParam.calcParam(' M_z', 'Bending strength (a.k.a. moment resistance) of the CLT panel', _M_z, 'lbf ft'),
        DCR_fire: new CalcParam.calcParam(' DCR_fire', '', _DCR_fire, ''),
    };
}

export function CLT_Assembly (TW, name, layers, grade, t_l, t_t) {

    const Density_M_to_Imp = 0.0624279606;      // Conversion factor from kg/m^3 to 1b/ft^3
    const inch_to_m = 0.0254;
    const Nm2_to_psf = 0.020885434273039;    // Conversion factor from N/m^2 to psf

    // Adjustment factors for CLT (NDS Table 10.3.1)
    let K_rb_y = 0.85;      // CLT Adjustment factor in Major axis (PRG 320 Table A1)
    let K_rb_x = 1.0;       // CLT Adjustment factor in minor axis (PRG 320 Table A1)

    // V2 - CLT MATERIAL PROPERTIES === MAJOR STRENGTH DIRECTION
    let f_b = 875;          // unit: psi        Bending strength (NDS Table 4C)
    let f_v = 135;          // unit: psi        Bending strength (NDS Table 4C notes)
    let f_s = f_v / 3.0;    // unit: psi        Shear strength
    let E_long = 1.4E006;   // unit: psi        Young's modulus of longitudinal layers
    let E_trans = 1.2E006;  // unit: psi        Young's modulus of transverse layers

    // V2 - CLT MATERIAL PROPERTIES === MINOR STRENGTH DIRECTION
    let f_b_minor = 500;     // unit: psi        Bending strength in minor axis
    let f_s_minor = 45;      // unit: psi        Shear strength in minor axis

    // CLT PANEL LAYUP
    t_l = 1.38;         // unit: inch       Thickness of longitudinal layers
    t_t = 1.38;         // unit: inch       Thickness of transverse layers

    let Layer_long = (layers + 1) / 2;          // Number layers in the longitudinal direction
    let Layer_trans = (layers - 1) / 2;         // Number layers in the transverse direction

    let t = (t_l * Layer_long) + (t_t * Layer_trans);   // unit: inch   Total panel thickness
    let t_meter = t * inch_to_m;

    let Ag = ( t * TW );    // unit: inch^2    Gross Cross-section area in major direction

    let Density = 490;  // unit: kg/m^3
    let Density_Imperial = Density * Density_M_to_Imp; // unit: 1b/ft^3

    let F_b_0;  // ASD reference bending stress of a lamination, in psi (Ref: PRG-320-2018)
    let E_0;    // Modulus of elasticity of a lamination, in psi (Ref: PRG-320-2018)
    let F_b_90;
    let E_90;

    let SG;
    let Beta_n;

    switch (grade)
    {
        case 'E1-grade':
            F_b_0 = 1950;  // unit: psi
            E_0 = 1.7E006;  // unit: psi

            break;
        case 'V-grade':
            Density = 490;  // unit: kg/m^3
            break;
        default:
            Density = 490; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    // CLT Self-weight
    let SW_CLT_Metric = ((Density * 9.81) * t_meter);   // unit: N/m^2
    let SW_CLT = SW_CLT_Metric * Nm2_to_psf;            // unit: psf

    // Lever-arm of CLT panels
    let z_l = (t_l / 2.0) + (t_l / 2.0); // unit: inch      Lever - arm to longitudinal layers

    // CLT PANEL ELASTIC BENDING STIFFNESS === MAJOR STRENGTH DIRECTION
    let EI_eff1 = (E_long * TW * (Math.pow(t_l, 3) / 12.0)) * Layer_long;               // unit: lbf in^2
    let EI_eff2 = ((E_trans / 30.0) * TW * (Math.pow(t_t, 3) / 12.0)) * Layer_trans;    // unit: lbf in^2
    let EI_eff3 = (E_long * TW * t_l * (Math.pow(z_l, 2))) * 2;                         // unit: lbf in^2
    let EI_eff = EI_eff1 + EI_eff2 + EI_eff3;

    let S_eff = (EI_eff / E_long) * (2.0 / t); // unit: in^3

    // CLT - ELASTIC SHEAR STIFFNESS OF PANELS === MAJOR STRENGTH DIRECTION
    let G_par = E_long / 16.0;                // unit: psi       Shear modulus of longitudinal layers in major direction
    let G_perp = G_par / 10.0;                // unit: psi       Shear modulus of transverse layers in major direction
    let G_par_trans = E_trans / 16.0;         // unit: psi       Shear modulus of longitudinal layers in minor direction
    let G_perp_trans = G_par_trans / 10.0;    // unit: psi       Shear modulus f transverse layers in minor direction

    let GA_eff_1 = ( (t_l * Layer_long) + (t_t * Layer_trans) ) - (t_l / 2.0) - (t_l / 2.0); // unit: inch
    let GA_eff_2 = t_l / (2 * G_par * TW);      // unit: 1/lbf/ft^2
    let GA_eff_3 = (t_t / G_perp_trans * TW);   // unit: 1/lbf/ft^2
    let GA_eff_4 = t_l / (2 * G_par * TW);      // unit: 1/lbf/ft^2
    let GA_eff = Math.pow(GA_eff_1, 2) / (GA_eff_2 + GA_eff_3 + GA_eff_4);  // unit: lbf    Elastic shear stiffness of panel

    // BENDING CAPACITY === MAJOR STRENGTH DIRECTION
    let FbS_eff = f_b * S_eff * K_rb_y;     // unit: lbf ft     Effective bending strength

    // SHEAR CAPACITY === MAJOR STRENGTH DIRECTION
    let V_s = ( 2.0 / 3.0) * Ag * f_s;      // unit: lbf        Shear strength of the panel in major direction


    // CLT PANEL LAYUP === MINOR STRENGTH DIRECTION
    let Layer_long_minor = 1;                         // Number layers in the longitudinal direction
    let Layer_trans_minor = 0;                        // Number layers in the transverse direction

    let t_minor = (t_l * Layer_long_minor) + (t_t * Layer_trans_minor);   // unit: inch    Total panel thickness
    let Ag_minor = t_minor * TW;  // unit: inch^2       Gross Cross-section area in minor direction

    // Lever-arm of CLT panels
    let z_minor = 0; // unit: inch

    // CLT PANEL ELASTIC BENDING STIFFNESS === MINOR STRENGTH DIRECTION
    let E_long_minor = E_trans;  // unit: psi
    let E_trans_minor = E_long;  // unit: psi

    let EI_eff_minor = (E_long_minor * TW * (Math.pow(t_t, 3) / 12.0)) + (E_long_minor * TW * t_t * Math.pow(z_minor, 2));  // unit: lbf in^2   Elastic bending stiffness of the panel
    let S_eff_minor = (EI_eff_minor / E_long_minor) * (2.0 / t_minor);  // unit: in^3       Section modulus of the panels

    // CLT - ELASTIC SHEAR STIFFNESS OF PANELS === MINOR STRENGTH DIRECTION
    let GA_eff_1_minor = ((t_l * Layer_long) + (t_t * Layer_trans)) - (t_l / 2.0) - (t_l / 2.0);   // unit: inch
    let GA_eff_2_minor = t_l / (2 * G_perp * TW);    // unit: 1/lbf/ft^2
    let GA_eff_3_minor = t_t / (G_par_trans * TW);   // unit: 1/lbf/ft^2
    let GA_eff_4_minor = t_l / (2 * G_perp * TW);    // unit: 1/lbf/ft^2
    let GA_eff_minor = Math.pow(GA_eff_1_minor, 2) / (GA_eff_2_minor + GA_eff_3_minor + GA_eff_4_minor);  // unit: lbf    Elastic shear stiffness of panel

    // BENDING CAPACITY === MINOR STRENGTH DIRECTION
    let FbS_eff_minor = f_b_minor * S_eff_minor * K_rb_x;     // unit: lbf ft     Effective bending strength in minor direction

    // SHEAR CAPACITY === MINOR STRENGTH DIRECTION
    let V_s_minor = ( 2.0 / 3.0) * Ag_minor * f_s_minor;      // unit: lbf        Shear strength of the panel in minor direction

    let panel = new Material.CLT_Material(
        name,
        grade,
        layers + "-ply",
        'CLT',
        t,
        SW_CLT,
        EI_eff,
        FbS_eff,
        GA_eff,
        V_s,
        t_l,
        t_t,
        1650, // IS THIS TYPICAL FOR ALL CLT VARIANTS?
        1.5E006, // IS THIS TYPICAL FOR ALL CLT VARIANTS?
        Density,
        26.1, // IS THIS TYPICAL FOR ALL CLT VARIANTS?
        1.5 // IS THIS TYPICAL FOR ALL CLT VARIANTS?
    );

    return panel;
}
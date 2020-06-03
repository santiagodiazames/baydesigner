import * as CalcParam from "./CalcParam";
import * as Member from "./Member";

export function GLT_Loadings (ExL, GLT, Members_above, GLT_Mat, Topping_Mat, TW) {

    // Unit conversion
    const mm_to_inch = 0.03937008;
    const mm_to_foot = 0.00328084;
    const mm2_to_m2 = 0.000001;
    const mm2_inch2 = 0.00155;
    const N_per_m_to_lbf_per_ft = 0.0685217659;

    let w_inch = GLT_Mat.w.value * mm_to_inch;
    let d_inch = GLT_Mat.d.value * mm_to_inch;
    let d_foot = GLT_Mat.d.value * mm_to_foot;
    let e_p_inch;

    switch (GLT.span_mode.value)
    {
        case "single-span":
            e_p_inch = 0.0; // If the GLT is single-span, then there's no need to reduce its
                            // section width at intermediate support (there is no intermediate support)
            break;
        default:
            e_p_inch = GLT_Mat.e_p.value * mm_to_inch;
            break;
    }

    // *** Replace with CalcParams ***
    let DL_factor = 1.0;
    let LL_factor = 1.0;

    // STEP 1: LOADING FROM ON THE CLT FLOOR
    let SW_CLT = Members_above[0].self_weight.value;
    let SW_CONC = Topping_Mat.SW_Topping.value;
    let DeadLoadOther = ExL.DeadLoadOther;
    let DL = (SW_CLT + SW_CONC + DeadLoadOther) * TW; // Dead Load includes the Self-weight of CLT
    let LL = ExL.LiveLoad * TW;

    // STEP 2: DIMENSIONS OF THE GLULAM BEAMS
    let Den_GLT = GLT_Mat.Den_GLT.value;

    let A_g_m2 = GLT_Mat.w.value * GLT_Mat.d.value * mm2_to_m2;
    let _A_g_inch2 = GLT_Mat.w.value * GLT_Mat.d.value * mm2_inch2;
    let _I_xx = (w_inch * Math.pow(d_inch, 3)) / 12.0;
    let _S_xx = (w_inch * Math.pow(d_inch, 2)) / 6.0;
    let _SW_GLT = (Den_GLT * 9.81) * A_g_m2 * N_per_m_to_lbf_per_ft; // SW_GLT in lbf/ft;

    // STEP 3: DIMENSIONS OF THE GLULAM BEAMS AT THE CONNECTION (WITH REDUCED SECTION)
    let w_n = w_inch - (e_p_inch + e_p_inch);
    let _A_n = w_n * d_inch;

    // STEP 4: LOADING FROM ON THE GLULAM BEAM
    let Spacing_GLT = GLT.spacing.value;

    // The following assumes that the member above always imposes a uniformly distriduted load on the GLT
    // We'll need to generalize this to account for point load conditions
    let M_above_Span_mode_factor;

    let M_above;

    if (Members_above.length === 1)
    {
        M_above = Members_above[0];
    }
    else
    {
        M_above = Members_above[1];
    }

    switch (M_above.span_mode.value)
    {
        case "single-span":
            M_above_Span_mode_factor = 1.00;
            break;
        case "double-span":
            M_above_Span_mode_factor = 1.25;
            break;
        case "triple-span":
            M_above_Span_mode_factor = 1.10;
            break;
        default:
            M_above_Span_mode_factor = 0.00; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    let TW_GLT = M_above_Span_mode_factor * Spacing_GLT;
    let _w_dead;
    let _w_live = LL * TW_GLT;

    if (Members_above.length === 1)
    {
        _w_dead = DL * TW_GLT;
    }
    else
    {
        let M_above_SW = Members_above[1].self_weight.value / TW_GLT; // Self-weight of purlins as an area load (psf)  <---------- CHECK WITH HERCEND
        _w_dead = (DL + M_above_SW) * TW_GLT;
    }

    // STEP 5: STRENGTH DEMANDS ON THE DOUBLE - SPAN GLULAM BEAM(ASD LOAD COMBINTION)
    let Span_GLT = GLT.span.value;

    let _UDL_ULS = (DL_factor * (_w_dead + _SW_GLT)) + (LL_factor * _w_live);
    let _UDL_ULS_s = LL_factor * _w_live;
    let _UDL_ULS_l = DL_factor * (_w_dead + _SW_GLT);
    let _M_z_sup = 0.125 * _UDL_ULS * Span_GLT * Span_GLT;
    let _M_z_span = 0.070 * _UDL_ULS * Span_GLT * Span_GLT;
    let _M_z = (_UDL_ULS * Math.pow(Span_GLT, 2)) / 8.0;
    let _V_y_ULS;
    switch (GLT.span_mode.value)
    {
        case "single-span":
            _V_y_ULS = (_UDL_ULS * (Span_GLT - (2.0 * d_foot))) / 2.0;
            break;
        case "double-span":
            _V_y_ULS = ((5.0 / 8.0) * (_UDL_ULS * Span_GLT)) - (_UDL_ULS * d_foot);
            break;
        default:
            _V_y_ULS = 0.00; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }


    return {
        UDL_ULS: new CalcParam.calcParam(' UDL_ULS', 'this is a param', _UDL_ULS, 'lbf/ft'),
        w_dead: new CalcParam.calcParam(' w_dead', 'this is a param', _w_dead, 'lbf/ft'),
        w_live: new CalcParam.calcParam(' w_live', 'this is a param', _w_live, 'lbf/ft'),
        UDL_ULS_l: new CalcParam.calcParam(' UDL_ULS_l', 'this is a param', _UDL_ULS_l, 'lbf/ft'),
        UDL_ULS_s: new CalcParam.calcParam(' UDL_ULS_s', 'this is a param', _UDL_ULS_s, 'lbf/ft'),
        I_xx: new CalcParam.calcParam(' I_xx', 'this is a param', _I_xx, 'in^4'),
        S_xx: new CalcParam.calcParam(' S_xx', 'this is a param', _S_xx, 'in^3'),
        M_z_span: new CalcParam.calcParam(' M_z_span', 'this is a param', _M_z_span, 'lbf ft'),
        M_z_sup: new CalcParam.calcParam(' M_z_sup', 'this is a param', _M_z_sup, 'lbf ft'),
        M_z: new CalcParam.calcParam(' M_z', 'this is a param', _M_z, 'lbf ft'),
        V_y_ULS: new CalcParam.calcParam(' V_y_ULS', 'this is a param', _V_y_ULS, 'lbf'),
        A_g: new CalcParam.calcParam(' A_g', 'this is a param', _A_g_inch2, 'in^2'),
        A_n: new CalcParam.calcParam(' A_n', 'this is a param', _A_n, 'in^2'),
        SW_GLT: new CalcParam.calcParam(' SW_GLT', 'this is a param', _SW_GLT, 'psf')
    };
}

export function GLT_Strength (GLT, GLT_Mat, Loadings) {

    // TEMPORARY MEASURE: This will need to be soured from a dictionary, or another standards-friendly approach
    let l_u_bottom = new CalcParam.calcParam(' l_u_bottom', 'Unsupported length (spacing between the screws on the CLT)', 5.0, 'ft')

    // Unit conversion
    const mm_to_inch = 0.03937008;
    const mm_to_foot = 0.00328084;

    let w_inch = GLT_Mat.w.value * mm_to_inch;
    let d_inch = GLT_Mat.d.value * mm_to_inch;
    let w_foot = GLT_Mat.w.value * mm_to_foot;
    let d_foot = GLT_Mat.d.value * mm_to_foot;

    // Replace with CalcParams
    let X = 10; // This is the Volume Factor Southern Pine Parameter
    let C_fu = 1.0;

    // Data from Loadings
    let UDL_ULS = Loadings.UDL_ULS.value;
    let S_xx = Loadings.S_xx.value;
    let M_z_span = Loadings.M_z_span.value;
    let M_z_sup = Loadings.M_z_sup.value;
    let M_z = Loadings.M_z.value;
    let V_y_ULS = Loadings.V_y_ULS.value;
    let A_g = Loadings.A_g.value;
    let A_n = Loadings.A_n.value;

    // STEP 9: VOLUME FACTOR
    let Span_zero = 0;
    let l_u_top = 0;

    switch (GLT.span_mode.value)
    {
        case "single-span":
            Span_zero = GLT.span.value;

            l_u_top = l_u_bottom.value; // <----------------------------------------- CHECK WITH HERCEND
            break;
        case "double-span":
            let R_a = 0.375 * UDL_ULS * GLT.span.value;
            Span_zero = 2 * R_a / UDL_ULS;

            l_u_top = (GLT.span.value - Span_zero) * 2.0;
            break;
        default:
            // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    let _C_v = Math.pow((21.0 / Span_zero), (1.0 / X)) * Math.pow((12.0 / d_inch), (1.0 / X)) * Math.pow((5.125 / Math.min(w_inch, 10.75)), (1.0 / X));

    let _l_e_top;
    if (l_u_top / d_foot < 7.0)
    {
        _l_e_top = l_u_top * 2.06;
    }
    else
    {
        _l_e_top = (1.63 * l_u_top) + (3.0 * d_foot);
    }

    let _l_e_bottom;
    if (l_u_bottom / d_foot < 7.0)
    {
        _l_e_bottom = l_u_bottom.value * 2.06;
    }
    else
    {
        _l_e_bottom = (1.63 * l_u_bottom.value) + (3.0 * d_foot);
    }


    // STEP 8: BEAM STABILITY FACTOR
    let R_b_top = Math.sqrt(_l_e_top * d_foot / Math.pow(w_foot, 2));
    let R_b_bottom = Math.sqrt(_l_e_bottom * d_foot / Math.pow(w_foot, 2));

    // *********** DO A SLENDERNESS CHECK HERE, VERY IMPORTANT! *************

    let _E1_min = GLT_Mat.E1_min.value;
    let F_B_pos_ASD = GLT_Mat.F_b_pos.value; // MULTIPLY BY GLT FACTORS (currently all have a value of 1.0)
    let F_B_neg_ASD = GLT_Mat.F_b_neg.value; // MULTIPLY BY GLT FACTORS (currently all have a value of 1.0)

    let F_bE_top = 1.2 * _E1_min / Math.pow(R_b_top, 2);
    let F_bE_bottom = 1.2 * _E1_min / Math.pow(R_b_bottom, 2);

    let C_L_pos = ((1 + (F_bE_top / F_B_pos_ASD)) / 1.9) - Math.sqrt(Math.pow(((1 + (F_bE_top / F_B_pos_ASD)) / 1.9), 2) - ((F_bE_top / F_B_pos_ASD) / 0.95));
    let C_L_neg = ((1 + (F_bE_bottom / F_B_neg_ASD)) / 1.9) - Math.sqrt(Math.pow(((1 + (F_bE_bottom / F_B_neg_ASD)) / 1.9), 2) - ((F_bE_bottom / F_B_neg_ASD) / 0.95));

    // STEP 10: MAXIMUM MOMENT RESISTANCE OF THE BEAM
    let F_B_pos = F_B_pos_ASD * Math.min(C_L_pos, _C_v) * C_fu;
    let F_B_neg = F_B_neg_ASD * Math.min(C_L_neg, _C_v) * C_fu;

    let M_r_pos = F_B_pos * S_xx * (1.0 / 12.0); // Converted from (lbf in) to (lbf ft)
    let M_r_neg = F_B_neg * S_xx * (1.0 / 12.0); // Converted from (lbf in) to (lbf ft)
    let M_r = F_B_pos * S_xx * (1.0 / 12.0); // Converted from (lbf in) to (lbf ft).
                                                // M_r: applies to single-span GLT

    // STEP 11: DEMAND TO CAPACITY RATIO - FOR MOMENTS
    let _DCR_moment_span = M_z_span / M_r_pos;
    let _DCR_moment_sup = M_z_sup / M_r_neg;
    let _DCR_moment = M_z / M_r; // _DCR_moment: applies to single-span GLT

    // STEP 12: MAXIMUM SHEAR RESISTANCE OF THE BEAM
    let F_v_ASD = GLT_Mat.F_v.value; // MULTIPLY BY GLT FACTORS (currently all have a value of 1.0)

    let v_r = F_v_ASD * (2.0 / 3.0) * A_g;
    let v1_r = F_v_ASD * (2.0 / 3.0) * A_n;

    // STEP 11: DEMAND TO CAPACITY RATIO - FOR MOMENTS
    let _DCR_shear = V_y_ULS / v_r;
    let _DCR_shear_R = V_y_ULS / v1_r;


    return {
        C_v: new CalcParam.calcParam(' C_v', 'this is a param', _C_v, ''),
        E1_min: new CalcParam.calcParam(' E1_min', 'Minimum youngs modulus (5th percentile)', _E1_min, 'psi'),
        l_e_top: new CalcParam.calcParam(' l_e_top', 'this is a param', _l_e_top, ''),
        l_e_bottom: new CalcParam.calcParam(' l_e_bottom', 'this is a param', _l_e_bottom, ''),
        DCR_moment_span: new CalcParam.calcParam(' DCR_moment_span', 'this is a param', _DCR_moment_span, ''),
        DCR_moment_sup: new CalcParam.calcParam(' DCR_moment_sup', 'this is a param', _DCR_moment_sup, ''),
        DCR_moment: new CalcParam.calcParam(' DCR_moment', 'this is a param', _DCR_moment, ''),
        DCR_shear: new CalcParam.calcParam(' DCR_shear', 'this is a param', _DCR_shear, ''),
        DCR_shear_R: new CalcParam.calcParam(' DCR_shear_R', 'this is a param', _DCR_shear_R, '')
    };
}

export function GLT_Serviceability ( GLT, Loadings) {

    // Unit conversion
    const inch_to_foot = 1.0 / 12.0;
    const foot_to_inch = 12.0;


    // Replace with CalcParams
    let _E = 1.8E+006; // Young's modulus (psi)

    // Data from GLT Member
    let Span_GLT_inch = GLT.span.value * foot_to_inch;

    // Data from Loadings
    let I_xx = Loadings.I_xx.value;
    let UDL_ULS_s_inch = Loadings.UDL_ULS_s.value * inch_to_foot; // Convert the denominator from foot to inch (1/12)
    let UDL_ULS_l_inch = Loadings.UDL_ULS_l.value * inch_to_foot; // Convert the denominator from foot to inch (1/12)


    // STEP 14: APPLIED BEAM DEFLECTION
    let _DELTA_y_s;
    let _DELTA_y_l;

    switch (GLT.span_mode.value)
    {
        case 'single-span':
            _DELTA_y_s = ((5.0 * UDL_ULS_s_inch * Math.pow(Span_GLT_inch, 4)) / (384 * _E * I_xx));
            _DELTA_y_l = ((5.0 * UDL_ULS_l_inch * Math.pow(Span_GLT_inch, 4)) / (384 * _E * I_xx));
            break;
        case 'double-span':
            _DELTA_y_s = ((UDL_ULS_s_inch * Math.pow(Span_GLT_inch, 4)) / (185 * _E * I_xx)); // This was formerly multiplied by 1.5. That was removed during verification
            _DELTA_y_l = ((UDL_ULS_l_inch * Math.pow(Span_GLT_inch, 4)) / (185 * _E * I_xx)); // This was formerly multiplied by 1.5. That was removed during verification
            break;
        default:
            _DELTA_y_s = ((UDL_ULS_s_inch * Math.pow(Span_GLT_inch, 4)) / (185 * _E * I_xx)); // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            _DELTA_y_l = ((UDL_ULS_l_inch * Math.pow(Span_GLT_inch, 4)) / (185 * _E * I_xx)); // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    let _DELTA_y = (_DELTA_y_s * 1.5) + _DELTA_y_l;

    // STEP 15: DEMAND TO CAPACITY RATIO - FOR DEFLECTION
    let delta_lim_live = Span_GLT_inch / 360;
    let delta_lim_total = Span_GLT_inch / 240;

    let _DCR_d_live = _DELTA_y_s / delta_lim_live;
    let _DCR_d_total = _DELTA_y / delta_lim_total;


    return {
        E: new CalcParam.calcParam(' E', 'Youngs modulus', _E, 'psi'),
        DELTA_y_s: new CalcParam.calcParam(' DELTA_y_s', 'Applied deflection due to short term loading', _DELTA_y_s, 'in'),
        DELTA_y_l: new CalcParam.calcParam(' DELTA_y_l', 'Applied deflection due to long term loading', _DELTA_y_l, 'in'),
        DELTA_y: new CalcParam.calcParam(' DELTA_y', 'this is a param', _DELTA_y, 'in'),
        DCR_d_live: new CalcParam.calcParam(' DCR_d_live', 'this is a param', _DCR_d_live, ''),
        DCR_d_total: new CalcParam.calcParam(' DCR_d_total', 'this is a param', _DCR_d_total, ''),
        EQ_delta_lim_live: 'Span_GLT / 360',
        EQ_delta_lim_total: 'Span_GLT / 240'
    };
}

export function GLT_FireCheck ( Fire, GLT, GLT_Mat, Strength, Loadings ) {

    // Retrieve input dictionary data
    //DesignProvisionsAndEquations DPAE = new DesignProvisionsAndEquations();
    let R_b_min = 50;

    // Unit conversion
    const mm_to_inch = 0.03937008;
    const inch_to_foot = 1.0 / 12.0;

    let w_inch = GLT_Mat.w.value * mm_to_inch;
    let d_inch = GLT_Mat.d.value * mm_to_inch;


    // Replace with CalcParams
    let C_f = 1.0;
    let C_fu = 1.0;

    // Data from Strength
    let C_v = Strength.C_v.value;
    let E1_min = Strength.E1_min.value;
    let l_e_top = Strength.l_e_top.value;
    let l_e_bottom = Strength.l_e_bottom.value;

    // Data from Loadings
    let w_dead = Loadings.w_dead.value;
    let w_live = Loadings.w_live.value;
    let SW_GLT = Loadings.SW_GLT.value;


    // STEP 16: DEMANDS DURING FIRE
    let Span_GLT = GLT.span.value;

    let UDL_fire = (1.0 * (w_dead + SW_GLT)) + (1.0 * w_live);
    let M_z_fire_span = (9.0 / 128) * UDL_fire * Span_GLT * Span_GLT;
    let M_z_fire_sup = 0.125 * UDL_fire * Span_GLT * Span_GLT;
    let M_z_fire = (UDL_fire * Math.pow(Span_GLT, 2)) / 8.0;

    // STEP 17: GLULAM SECTION AFTER FIRE
    let a_char; // Effective char depth (per Fire Exposure Time)  (in)
    switch (Fire.time)
    {
        case '1 hour':
            a_char = 1.8;
            break;
        case '1.5 hours':
            a_char = 2.5;
            break;
        case '2 hours':
            a_char = 3.2;
            break;
        default:
            a_char = 1.8; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    let b_residual;
    let d_residual;
    switch (Fire.exposureMode)
    {
        case '1 face':
            b_residual = w_inch;
            d_residual = d_inch - a_char;
            break;
        case '2 faces':
            b_residual = w_inch - (a_char * 2.0);
            d_residual = d_inch;
            break;
        case '3 faces':
            b_residual = w_inch - (a_char * 2.0);
            d_residual = d_inch - a_char;
            break;
        default:
            b_residual = w_inch; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            d_residual = d_inch - a_char; // NEED TO FIND A BETTER WAY TO HANDLE THIS CONDITION
            break;
    }

    let S_residual = (b_residual * Math.pow(d_residual, 2)) / 6.0;

    // STEP 18: BEAM STABILITY FACTOR AFTER H-HOUR FIRE
    let F_B_pos_ASD = GLT_Mat.F_b_pos.value; // MULTIPLY BY GLT FACTORS (currently all have a value of 1.0)
    let F_B_neg_ASD = GLT_Mat.F_b_neg.value; // MULTIPLY BY GLT FACTORS (currently all have a value of 1.0)

    let _R_b_fire_top = Math.sqrt(l_e_top * (d_residual * inch_to_foot) / Math.pow(b_residual * inch_to_foot, 2));
    let _R_b_fire_bottom = Math.sqrt(l_e_bottom * (d_residual * inch_to_foot) / Math.pow(b_residual * inch_to_foot, 2));
    let _F_bE_fire_top = (1.2 * E1_min / Math.pow(_R_b_fire_top, 2)) * 2.03;
    let _F_bE_fire_bottom = (1.2 * E1_min / Math.pow(_R_b_fire_bottom, 2)) * 2.03;
    let _C_L_fire_span = ((1 + (_F_bE_fire_top / F_B_pos_ASD)) / 1.9) - Math.sqrt(Math.pow(((1 + (_F_bE_fire_top / F_B_pos_ASD)) / 1.9), 2) - ((_F_bE_fire_top / F_B_pos_ASD) / 0.95));
    let _C_L_fire_sup = ((1 + (_F_bE_fire_bottom / F_B_neg_ASD)) / 1.9) - Math.sqrt(Math.pow(((1 + (_F_bE_fire_bottom / F_B_neg_ASD)) / 1.9), 2) - ((_F_bE_fire_bottom / F_B_neg_ASD) / 0.95));

    // This check is not used YET. To be coordinated.
    let Check_b_single;
    if (_R_b_fire_top < R_b_min)
    {
        Check_b_single = "OK";
    }
    else
    {
        Check_b_single = "NOT OK";
    }

    // STEP 19: MAXIMUM MOMENT RESISTANCE OF THE BEAM
    let F_B_pos = GLT_Mat.F_b_pos.value;
    let F_B_neg = GLT_Mat.F_b_neg.value;

    let _c_l_fire_pos = Math.min(_C_L_fire_span, 1.0);
    let _c_l_fire_neg = Math.min(_C_L_fire_sup, 1.0);
    let c_v = Math.min(C_v, 1.0);
    let _F_b_fire_span = F_B_pos * C_f * Math.min(c_v, _c_l_fire_pos) * C_fu;
    let _F_b_fire_sup = F_B_neg * C_f * Math.min(c_v, _c_l_fire_neg) * C_fu;
    let _M_residual_span = 2.85 * _F_b_fire_span * S_residual * inch_to_foot; // Convert from Pound-force inch to Pound-force foot
    let _M_residual_sup = 2.85 * _F_b_fire_sup * S_residual * inch_to_foot; // Convert from Pound-force inch to Pound-force foot

    // STEP 20: DEMAND TO CAPACITY RATIO - FOR MOMENTS
    let _DCR_moment_fire_span = M_z_fire_span / _M_residual_span;
    let _DCR_moment_fire_sup = M_z_fire_sup / _M_residual_sup;
    let _DCR_moment_fire = M_z_fire / _M_residual_span; // _DCR_moment_fire: applies to single-span GLT


    return {
        R_b_fire_top: new CalcParam.calcParam(' R_b_fire_top', 'Slenderness ratio for bending', _R_b_fire_top, ''),
        R_b_fire_bottom: new CalcParam.calcParam(' R_b_fire_bottom', 'Slenderness ratio for bending', _R_b_fire_bottom, ''),
        F_bE_fire_top: new CalcParam.calcParam(' F_bE_fire_top', 'Critical buckling value for bending', _F_bE_fire_top, 'psi'),
        F_bE_fire_bottom: new CalcParam.calcParam(' F_bE_fire_bottom', 'Critical buckling value for bending', _F_bE_fire_bottom, 'psi'),
        C_L_fire_span: new CalcParam.calcParam(' C_L_fire_span', 'Stability factor of the beam at span', _C_L_fire_span, ''),
        C_L_fire_sup: new CalcParam.calcParam(' C_L_fire_sup', 'Stability factor of the beam at support', _C_L_fire_sup, ''),
        c_l_fire_pos: new CalcParam.calcParam(' c_l_fire_pos', 'Check for the beam stability factor at span', _c_l_fire_pos, ''),
        c_l_fire_neg: new CalcParam.calcParam(' c_l_fire_neg', 'Check for the beam stability factor at support', _c_l_fire_neg, ''),
        F_b_fire_span: new CalcParam.calcParam(' F_b_fire_span', 'Bending strength at span', _F_b_fire_span, 'psi'),
        F_b_fire_sup: new CalcParam.calcParam(' F_b_fire_sup', 'Bending strength at support', _F_b_fire_sup, 'psi'),
        M_residual_span: new CalcParam.calcParam(' M_residual_span', 'Moment resistance at span', _M_residual_span, 'psi'),
        M_residual_sup: new CalcParam.calcParam(' M_residual_sup', 'Moment resistance at support', _M_residual_sup, 'psi'),
        DCR_moment_fire_span: new CalcParam.calcParam(' DCR_moment_fire_span', 'Demand to capacity ratio at span', _DCR_moment_fire_span, ''),
        DCR_moment_fire_sup: new CalcParam.calcParam(' DCR_moment_fire_sup', 'Demand to capacity ratio at support', _DCR_moment_fire_sup, ''),
        DCR_moment_fire: new CalcParam.calcParam(' DCR_moment_fire', 'Demand to capacity ratio (single-span)', _DCR_moment_fire, '')
    };
}
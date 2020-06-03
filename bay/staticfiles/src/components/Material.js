import * as CalcParam from "./CalcParam";

export class CLT_Material {

    constructor(
        _name, _grade, _description, _type, _t_CLT, _SW_CLT, _EI_eff, _FbS_eff, _GA_eff, _V_s, _t_l, _t_t, _F_b_0, _E_0, _Den_CLT, _SG, _Beta_n
    ){
        this.name = _name;
        this.grade = _grade;
        this.description = _description;
        this.type = _type;
        this.t_CLT = new CalcParam.calcParam("t_CLT", "Total panel thickness", _t_CLT, "inch");
        this.SW_CLT = new CalcParam.calcParam("SW_CLT", "Self-weight of the CLT panel", _SW_CLT, "psf");
        this.EI_eff = new CalcParam.calcParam("EI_eff", "Elastic bending stiffness of the CLT panel", _EI_eff, "lbf in^2");
        this.FbS_eff = new CalcParam.calcParam("FbS_eff", "Bending capacity of the CLT panel", _FbS_eff, "lbf ft");
        this.GA_eff = new CalcParam.calcParam("GA_eff", "Elastic shear stiffness of the CLT panel", _GA_eff, "lbf");
        this.V_s = new CalcParam.calcParam("V_s", "Shear capacity of the CLT panel", _V_s, "lbf");
        this.t_l = new CalcParam.calcParam("t_l", "Thickness of longitudinal layers", _t_l, "inch");
        this.t_t = new CalcParam.calcParam("t_t", "Thickness of transverse layers", _t_t, "inch");

        // Properties are based on visual grade SPF-No. 1/No. 2 for major strength direction
        this.F_b_0 = new CalcParam.calcParam("F_b_0", "Bending strength of longitudinal layers", _F_b_0, "psi");
        this.E_0 = new CalcParam.calcParam("E_0", "E-modulus of longitudinal layers", _E_0, "psi");
        this.Den_CLT = new CalcParam.calcParam("Den_CLT", "Density of the CLT panel", _Den_CLT, "kg/m^3");
        this.SG = new CalcParam.calcParam("SG", "Specific gravity of the wood", _SG, "lbf/ft^3");
        this.Beta_n = new CalcParam.calcParam("Beta_n", "Nominal char rate per hour", _Beta_n, "inch");
    }
}

export class GLT_Material {

    constructor(
        _name, _grade, _description, _type, _d, _w, _F_b_pos, _F_b_neg, _F_v, _E, _E1_min, _Den_GLT, _e_p
    ){
        this.name = _name;
        this.grade = _grade;
        this.description = _description;
        this.type = _type;
        this.d = new CalcParam.calcParam("d", "Depth of glulam billet section", _d, "mm");
        this.w = new CalcParam.calcParam("w", "Width of glulam billet section", _w, "mm");
        this.F_b_pos = new CalcParam.calcParam("F_b_pos", "Positive bending strength", _F_b_pos, "psi");
        this.F_b_neg = new CalcParam.calcParam("F_b_neg", "Negative bending strength", _F_b_neg, "psi");
        this.F_v = new CalcParam.calcParam("F_v", "Shear strength", _F_v, "psi");
        this.E = new CalcParam.calcParam("E", "Young's modulus", _E, "psi");
        this.E1_min = new CalcParam.calcParam("E_min", "Minimum Young's modulus (5th percentile)", _E1_min, "psi");
        this.Den_GLT = new CalcParam.calcParam("Den_GLT", "Density of the glulam beam", _Den_GLT, "kg/m^3");
        this.e_p = new CalcParam.calcParam("e_p", "Width of the beam notch at the reduced section", _e_p, "mm");
    }
}

export class Topping_Material {

    constructor(
        _name, _description, _type, _t_Topping, _Den_Topping, _SW_Topping
    ){
        this.name = _name;
        this.description = _description;
        this.type = _type;
        this.t_Topping = new CalcParam.calcParam("t_Topping", "Topping thickness", _t_Topping, "inch");
        this.Den_Topping = new CalcParam.calcParam("Den_Topping", "Density of the floor topping", _Den_Topping, "kg/m^3");
        this.SW_Topping = new CalcParam.calcParam("SW_Topping", "Self-weight of the floor topping", _SW_Topping, "psf");
    }
}
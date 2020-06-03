import * as CalcParam from './CalcParam.js';

export class member {

    constructor(_member_type, _ID, _description, _span_mode, _span, _spacing){
        this.member_type = _member_type;
        this.ID = _ID;
        this.description = _description;
        this.span_mode = new CalcParam.calcParam(' span_mode', 'Span mode of a structural member (single, double)', _span_mode, 'foot');
        this.span = new CalcParam.calcParam(' span', 'Span', _span, 'foot');
        this.spacing = new CalcParam.calcParam(' spacing', 'Spacing', _spacing, 'foot');
        this.self_weight = new CalcParam.calcParam(' self_weight', 'self_weight', -1, 'psf');
    }

}
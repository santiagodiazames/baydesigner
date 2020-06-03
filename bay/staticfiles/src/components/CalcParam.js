export class calcParam {

    constructor(_symbol, _description, _value, _unit){
        this.symbol = _symbol;
        this.description = _description;
        this.value = _value;
        this.standard = "undefined";
        this.unit = _unit;
        this.annotation = this.makeAnnotation();
    }

    makeAnnotation() {
        if (this.value < 100000)
        {
            const numFormatA = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                maximumFractionDigits: 3
            });
            return numFormatA.format(this.value) + "  " + this.unit;
        }
        else
        {
            const numFormatB = new Intl.NumberFormat('en-US', {
                notation: 'engineering',
            });
            return numFormatB.format(this.value) + "  " + this.unit;
        }
    }
}

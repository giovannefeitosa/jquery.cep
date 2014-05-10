/**
 * jQuery CEP plugin v0.1
 * https://github.com/giovanneafonso/jquery.cep
 */

(function($) {
    /**
     * Web Service URL
     * Where we get CEP data
     */
    var ws_url = 'http://cep.republicavirtual.com.br/web_cep.php?formato=json&cep=';
    
    /**
     * PLugin instance
     */
    $.fn.cep = function(callback) {
        this.each(function()
        {
            var cepElement = $(this);
            
            cepElement.on('keyup change', function() {
                var cep = CEPNumbers(cepElement.val());
                cepElement.val(maskedCEP(cep));
                
                // When CEP is fully typed
                // Send request and retrieve data
                if(cep.length === 8) {
                    cepElement.attr('disabled', true);
                    $.get(ws_url+cep, function(responseCEP) {
                        callback(responseCEP);
                    }).always(function() {
                        cepElement.attr('disabled', false);
                    });
                }
            });
        });
        
        return this;
    };
    
    /**
     * Return only Numbers with max-length = 8
     *
     * @param number|string str Any number or string
     * @return string String with only numbers
     */
    function CEPNumbers(str)
    {
        return str.toString().replace(/\D/g, '').substr(0,8);
    }
    
    /**
     * Returns formatted CEP
     *
     * @param number|string CEP Any number or string
     * @return string Formatted CEP string
     */
    function maskedCEP(CEP)
    {
        var formattedCEP = '';
        var _CN = CEPNumbers(CEP);
        
        if(_CN.length > 5) {
            formattedCEP = _CN.substr(0,5)+'-'+_CN.substr(5,3);
        } else {
            formattedCEP = _CN;
        }
        return formattedCEP;
    }
})(jQuery);

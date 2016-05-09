/**
 * jQuery CEP plugin v0.3
 * https://github.com/shakegioh/jquery.cep
 */

// TODO: Verificar se é necessário mudar para JSONP
//       por causa do cross domain do Internet Explorer
//       Exemplo aqui: http://www.eliezer.com.br/post/busca-de-cep-no-seu-form-apenas-com-javascript/    
(function ($) {
    /**
     * Return only Numbers with max-length = 8
     *
     * @param number|string str Any number or string
     * @return string String with only numbers
     */
    function cepNumbers(str) {
        return str.toString().replace(/\D/g, "").substr(0, 8);
    }

    /**
     * Returns formatted CEP
     *
     * @param number|string CEP Any number or string
     * @return string Formatted CEP string
     */
    function maskedCEP(cep) {
        var formattedCEP = "";
        var cn = cepNumbers(cep);

        if (cn.length > 5) {
            formattedCEP = cn.substr(0, 5) + "-" + cn.substr(5, 3);
        } else {
            formattedCEP = cn;
        }
        return formattedCEP;
    }

    /**
     * AutoFill inputs when a CEP is fetched
     */
    function autoFill(responseCEP, attr) {
        $("[" + attr + "]").each(function () {
            var self = $(this);
            var field = self.attr(attr);

            if (responseCEP[field]) {
                self.val(responseCEP[field]);
            } else {
                self.val("");
            }
            
            self.trigger("change");
        });
    }
    
    /**
     * Default parser for the webservice response
     */
    function defaultResponseParse(response) {
        response.endereco = "";
        
        if(response.tipo_logradouro) {
            response.endereco += response.tipo_logradouro + " ";
        }
        
        response.endereco += response.logradouro;
        
        return response;
    }

    /**
     * PLugin instance
     */
    $.fn.cep = function (options) {
        /**
         * Default Settings
         */
        var settings = {
            autofill: true,
            autofill_attr: "data-cep",
            ajax: {
                url: "http://cep.republicavirtual.com.br/web_cep.php",
                requestParse: function (request) { return request; },
                responseParse: defaultResponseParse
            },
            init: function (cepElement) { },
            done: function (cepElement, responseCEP) { }
        };

        if (typeof options === "object") {
            // Extend Options
            settings = $.extend(settings, options);
        } else if (typeof options === "function") {
            // Only "done" Callback
            settings.done = options;
        }

        this.each(function () {
            var cepElement = $(this);
            var lastCep = null;
            
            // Track any changes
            cepElement.on("keyup", function (event) {
                // var cep = Only CEP Numbers
                var theKeyCode = event.keyCode || event.which;
                var cepInputValue = cepElement.val();
                var cepNumber = cepNumbers(cepInputValue);
                var maskedCepNumber = maskedCEP(cepInputValue);
                
                // If the key is an arrow, doesn't continue
                if(theKeyCode >= 37 && theKeyCode <= 40) {
                    return;
                }
                
                if(cepInputValue.length > 8 || !lastCep || lastCep != maskedCepNumber) {
                    lastCep = maskedCepNumber;
                    // Update field value with formatted CEP
                    cepElement.val(maskedCepNumber);
                } else {
                    return;
                }
                

                // When CEP is fully typed
                // Send request and retrieve data
                if (cepNumber.length === 8) {
                    
                    cepElement.attr("disabled", true);

                    settings.init(cepElement);

                    var data = { formato: "json", cep: cepNumber };

                    //parserequest for aditional data
                    data = settings.ajax.requestParse(data);

                    $.get(settings.ajax.url, data, function (responseCEP) {

                        //parseResponse for the right format
                        var response = settings.ajax.responseParse(responseCEP);

                        // Autofill
                        if (settings.autofill) {
                            autoFill(response, settings.autofill_attr);
                        }

                        // Execute Callback
                        settings.done(cepElement, responseCEP);
                    }).always(function () {
                        cepElement.attr("disabled", false);
                    });
                }
            });
        });

        return this;
    };

    $(document).ready(function () {
        $("[role=\"cep\"]").each(function () {
            var self = $(this);
            var settings = {
                autofill: true,
                autofill_attr: self.attr("cep-att") != null ? self.attr("cep-att") : "data-cep",
                ajax: {
                    url: self.attr("cep-ajax-url") != null ? self.attr("cep-ajax-url") : "http://cep.republicavirtual.com.br/web_cep.php",
                    requestParse: self.attr("cep-ajax-requestParse") != null ? function (request) { return window[self.attr("cep-ajax-requestParse")](request); } : function (request) { return request; },
                    responseParse: self.attr("cep-ajax-responseParse") != null ? function (response) { return window[self.attr("cep-ajax-responseParse")](response); } : defaultResponseParse
                },
                init: self.attr("cep-init") != null ? function (cepElement) { window[self.attr("cep-init")](cepElement); } : function (cepElement) { },
                done: self.attr("cep-done") != null ? function (cepElement, responseCEP) { window[self.attr("cep-done")](cepElement, responseCEP); } : function (cepElement, responseCEP) { }
            };

            self.cep(settings);
        });
    });
})(jQuery);

/**
 * jQuery CEP plugin v0.2
 * https://github.com/giovanneafonso/jquery.cep
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
                self.val(responseCEP[field]).trigger("change");
            }
        });
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
                responseParse: function (response) { return response; }
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
            // Track any changes
            cepElement.on("keyup", function () {
                // var cep = Only CEP Numbers
                var cepNumber = cepNumbers(cepElement.val());

                // Update field value with formatted CEP
                cepElement.val(maskedCEP(cepNumber));

                // When CEP is fully typed
                // Send request and retrieve data
                if (cepNumber.length === 8) {
                    cepElement.attr("disabled", true);

                    settings.init(cepElement);

                    var data = { formato: "json", cep: cepNumber };

                    //parserequest for aditional data
                    data = settings.ajax.requestParse(data);

                    $.get(settings.ajax.url, data, function (responseCEP) {

                        //parseResponse for the rigth format
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
                    responseParse: self.attr("cep-ajax-responseParse") != null ? function (response) { return window[self.attr("cep-ajax-responseParse")](response); } : function (response) { return response; }
                },
                init: self.attr("cep-init") != null ? function (cepElement) { window[self.attr("cep-init")](cepElement); } : function (cepElement) { },
                done: self.attr("cep-done") != null ? function (cepElement, responseCEP) { window[self.attr("cep-done")](cepElement, responseCEP); } : function (cepElement, responseCEP) { }
            };

            self.cep(settings);
        });
    });
})(jQuery);

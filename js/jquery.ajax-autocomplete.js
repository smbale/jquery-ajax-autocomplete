/**
 * jQuery implementation of asynchronous autocompletion.
 *
 * Copyright (c) 2011 Tristan Waddington <tristan.waddington@gmail.com>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 **/
(function($) {
    $.fn.autocomplete = function(options) {
        // Get our default options
        var timeout;
        var form_elem;
        var input_elem;
        var results_elem;
        var prev_value;

        // Override defaults
        var settings = $.extend(default_settings, options);

        // Get our elements
        form_elem = $(this);
        input_elem = form_elem.find(settings.input_selector);
        results_elem = $(settings.default_container);

        // Grab current value
        prev_value = input_elem.val();

        // On focus
        input_elem.focus(function() {
            // Show cached results on focus
            if (!results_elem.is(':empty')) {
                results_elem.show();
            }
        });

        // On blur
        input_elem.blur(function() {
            results_elem.hide();
        });

        // On keyup
        input_elem.keyup(function() {
            // Clear the previous timeout if one is pending
            if (timeout) {
                clearTimeout(timeout);
            }

            // Bail out if value hasn't changed
            if (input_elem.val() === prev_value) {
                return;
            }

            // Show empty results container
            results_elem.addClass(settings.loading_class).empty().show();

            // Delay server request
            timeout = setTimeout(function() {
                $.ajax({
                    'url': settings.url,
                    'type': settings.type,
                    'data': form_elem.serialize(),
                    'error': function(request, textStatus, errorThrown) {
                        // Call user defined callback
                        if ($.isFunction(settings.ajax_error_callback)) {
                            settings.ajax_error_callback(request, textStatus, errorThrown);
                        }
                    },
                    'success': function(data, textStatus, request) {
                        results_elem.removeClass(settings.loading_class).html(data); 

                        // Call user defined callback
                        if ($.isFunction(settings.ajax_success_callback)) {
                            settings.ajax_success_callback(data, textStatus, request);
                        }
                    },
                    'complete': function(request, textStatus) {
                        prev_value = input_elem.val();

                        // Call user defined callback
                        if ($.isFunction(settings.ajax_complete_callback)) {
                            settings.ajax_complete_callback(request, textStatus);
                        }
                    }
                });
            }, settings.delay);
        });
    };

    var default_settings = {
        'delay': 350, // Delay required before sending new request
        'url': '', // Request URL
        'type': 'GET', // Request type
        'input_selector': ':text:first', // Selector for input element to bind to
        'default_container': '#ajax-autocomplete-container', // Result container
        'loading_class': 'loading', // Class to add to result container while loading
        'ajax_error_callback': '',
        'ajax_success_callback': '',
        'ajax_complete_callback': ''
    };
})(jQuery);

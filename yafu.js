(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.yafu = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $, FileInput, _, jQuery;

$ = jQuery = require("jquery");

_ = require('underscore');

module.exports = FileInput = (function() {
  function FileInput(fileInput) {
    this.fileInput = fileInput;
    this.initInput();
  }

  FileInput.prototype.initInput = function() {
    if (this.fileInput.multiple && (typeof FileReader === "undefined" || FileReader === null)) {
      this.fileInput.removeAttribute('multiple');
    }
    this.$fileInput = $(this.fileInput);
    return this.$fileInput.on('change', (function(_this) {
      return function() {
        return _this._files = null;
      };
    })(this));
  };

  FileInput.prototype.files = function() {
    var file, i, len, ref, value;
    if (!this._files) {
      this._files = _(this.$fileInput.prop("files")).toArray();
      if (!this._files.length) {
        value = this.$fileInput.prop("value");
        if (!value) {
          return [];
        }
        this._files = [
          {
            name: value.replace(/^.*\\/, ""),
            input: this.replaceFileInput()
          }
        ];
      } else if (this._files[0].name === void 0 && this._files[0].fileName) {
        ref = this._files;
        for (i = 0, len = ref.length; i < len; i++) {
          file = ref[i];
          file.name = file.fileName;
          file.size = file.fileSize;
        }
      }
    }
    return this._files;
  };

  FileInput.prototype.replaceFileInput = function() {
    var inputClone, old;
    inputClone = this.$fileInput.clone(true);
    $("<form></form>").append(inputClone)[0].reset();
    this.$fileInput.after(inputClone).detach();
    $.cleanData(this.$fileInput.unbind("remove"));
    old = this.$fileInput[0];
    this.$fileInput.off();
    this.fileInput = inputClone[0];
    this.initInput();
    return old;
  };

  return FileInput;

})();


},{"jquery":"jquery","underscore":"underscore"}],2:[function(require,module,exports){
jQuery = require('jquery');

// This [jQuery](https://jquery.com/) plugin implements an `<iframe>`
// [transport](https://api.jquery.com/jQuery.ajax/#extending-ajax) so that
// `$.ajax()` calls support the uploading of files using standard HTML file
// input fields. This is done by switching the exchange from `XMLHttpRequest`
// to a hidden `iframe` element containing a form that is submitted.

// The [source for the plugin](https://github.com/cmlenz/jquery-iframe-transport)
// is available on [Github](https://github.com/) and licensed under the [MIT
// license](https://github.com/cmlenz/jquery-iframe-transport/blob/master/LICENSE).

// ## Usage

// To use this plugin, you simply add an `iframe` option with the value `true`
// to the Ajax settings an `$.ajax()` call, and specify the file fields to
// include in the submssion using the `files` option, which can be a selector,
// jQuery object, or a list of DOM elements containing one or more
// `<input type="file">` elements:

//     $("#myform").submit(function() {
//         $.ajax(this.action, {
//             files: $(":file", this),
//             iframe: true
//         }).complete(function(data) {
//             console.log(data);
//         });
//     });

// The plugin will construct hidden `<iframe>` and `<form>` elements, add the
// file field(s) to that form, submit the form, and process the response.

// If you want to include other form fields in the form submission, include
// them in the `data` option, and set the `processData` option to `false`:

//     $("#myform").submit(function() {
//         $.ajax(this.action, {
//             data: $(":text", this).serializeArray(),
//             files: $(":file", this),
//             iframe: true,
//             processData: false
//         }).complete(function(data) {
//             console.log(data);
//         });
//     });

// ### Response Data Types

// As the transport does not have access to the HTTP headers of the server
// response, it is not as simple to make use of the automatic content type
// detection provided by jQuery as with regular XHR. If you can't set the
// expected response data type (for example because it may vary depending on
// the outcome of processing by the server), you will need to employ a
// workaround on the server side: Send back an HTML document containing just a
// `<textarea>` element with a `data-type` attribute that specifies the MIME
// type, and put the actual payload in the textarea:

//     <textarea data-type="application/json">
//       {"ok": true, "message": "Thanks so much"}
//     </textarea>

// The iframe transport plugin will detect this and pass the value of the
// `data-type` attribute on to jQuery as if it was the "Content-Type" response
// header, thereby enabling the same kind of conversions that jQuery applies
// to regular responses. For the example above you should get a Javascript
// object as the `data` parameter of the `complete` callback, with the
// properties `ok: true` and `message: "Thanks so much"`.

// ### Handling Server Errors

// Another problem with using an `iframe` for file uploads is that it is
// impossible for the javascript code to determine the HTTP status code of the
// servers response. Effectively, all of the calls you make will look like they
// are getting successful responses, and thus invoke the `done()` or
// `complete()` callbacks. You can only communicate problems using the content
// of the response payload. For example, consider using a JSON response such as
// the following to indicate a problem with an uploaded file:

//     <textarea data-type="application/json">
//       {"ok": false, "message": "Please only upload reasonably sized files."}
//     </textarea>

// ### Compatibility

// This plugin has primarily been tested on Safari 5 (or later), Firefox 4 (or
// later), and Internet Explorer (all the way back to version 6). While I
// haven't found any issues with it so far, I'm fairly sure it still doesn't
// work around all the quirks in all different browsers. But the code is still
// pretty simple overall, so you should be able to fix it and contribute a
// patch :)

// ## Annotated Source

(function($, undefined) {
  "use strict";

  // Register a prefilter that checks whether the `iframe` option is set, and
  // switches to the "iframe" data type if it is `true`.
  $.ajaxPrefilter(function(options, origOptions, jqXHR) {
    if (options.iframe) {
      options.originalURL = options.url;
      return "iframe";
    }
  });

  // Register a transport for the "iframe" data type. It will only activate
  // when the "files" option has been set to a non-empty list of enabled file
  // inputs.
  $.ajaxTransport("iframe", function(options, origOptions, jqXHR) {
    var form = null,
        iframe = null,
        name = "iframe-" + $.now(),
        files = $(options.files).filter(":file:enabled"),
        markers = null,
        accepts = null;

    // This function gets called after a successful submission or an abortion
    // and should revert all changes made to the page to enable the
    // submission via this transport.
    function cleanUp() {
      files.each(function(i, file) {
        var $file = $(file);
        $file.data("clone").replaceWith($file);
      });
      form.remove();
      iframe.one("load", function() { iframe.remove(); });
      iframe.attr("src", "javascript:false;");
    }

    // Remove "iframe" from the data types list so that further processing is
    // based on the content type returned by the server, without attempting an
    // (unsupported) conversion from "iframe" to the actual type.
    options.dataTypes.shift();

    // Use the data from the original AJAX options, as it doesn't seem to be
    // copied over since jQuery 1.7.
    // See https://github.com/cmlenz/jquery-iframe-transport/issues/6
    options.data = origOptions.data;

    if (files.length) {
      form = $("<form enctype='multipart/form-data' method='post'></form>").
        hide().attr({action: options.originalURL, target: name});

      // If there is any additional data specified via the `data` option,
      // we add it as hidden fields to the form. This (currently) requires
      // the `processData` option to be set to false so that the data doesn't
      // get serialized to a string.
      if (typeof(options.data) === "string" && options.data.length > 0) {
        $.error("data must not be serialized");
      }
      $.each(options.data || {}, function(name, value) {
        if ($.isPlainObject(value)) {
          name = value.name;
          value = value.value;
        }
        $("<input type='hidden' />").attr({name:  name, value: value}).
          appendTo(form);
      });

      // Add a hidden `X-Requested-With` field with the value `IFrame` to the
      // field, to help server-side code to determine that the upload happened
      // through this transport.
      $("<input type='hidden' value='IFrame' name='X-Requested-With' />").
        appendTo(form);

      // Borrowed straight from the JQuery source.
      // Provides a way of specifying the accepted data type similar to the
      // HTTP "Accept" header
      if (options.dataTypes[0] && options.accepts[options.dataTypes[0]]) {
        accepts = options.accepts[options.dataTypes[0]] +
                  (options.dataTypes[0] !== "*" ? ", */*; q=0.01" : "");
      } else {
        accepts = options.accepts["*"];
      }
      $("<input type='hidden' name='X-HTTP-Accept'>").
        attr("value", accepts).appendTo(form);

      // Move the file fields into the hidden form, but first remember their
      // original locations in the document by replacing them with disabled
      // clones. This should also avoid introducing unwanted changes to the
      // page layout during submission.
      markers = files.after(function(idx) {
        var $this = $(this),
            $clone = $this.clone().prop("disabled", true);
        $this.data("clone", $clone);
        return $clone;
      }).next();
      files.appendTo(form);

      return {

        // The `send` function is called by jQuery when the request should be
        // sent.
        send: function(headers, completeCallback) {
          iframe = $("<iframe src='javascript:false;' name='" + name +
            "' id='" + name + "' style='display:none'></iframe>");

          // The first load event gets fired after the iframe has been injected
          // into the DOM, and is used to prepare the actual submission.
          iframe.one("load", function() {

            // The second load event gets fired when the response to the form
            // submission is received. The implementation detects whether the
            // actual payload is embedded in a `<textarea>` element, and
            // prepares the required conversions to be made in that case.
            iframe.one("load", function() {
              var doc = this.contentWindow ? this.contentWindow.document :
                (this.contentDocument ? this.contentDocument : this.document),
                root = doc.documentElement ? doc.documentElement : doc.body,
                textarea = root.getElementsByTagName("textarea")[0],
                type = textarea && textarea.getAttribute("data-type") || null,
                status = textarea && textarea.getAttribute("data-status") || 200,
                statusText = textarea && textarea.getAttribute("data-statusText") || "OK",
                content = {
                  html: root.innerHTML,
                  text: type ?
                    textarea.value :
                    root ? (root.textContent || root.innerText) : null
                };
              cleanUp();
              completeCallback(status, statusText, content, type ?
                ("Content-Type: " + type) :
                null);
            });

            // Now that the load handler has been set up, submit the form.
            form[0].submit();
          });

          // After everything has been set up correctly, the form and iframe
          // get injected into the DOM so that the submission can be
          // initiated.
          $("body").append(form, iframe);
        },

        // The `abort` function is called by jQuery when the request should be
        // aborted.
        abort: function() {
          if (iframe !== null) {
            iframe.unbind("load").attr("src", "javascript:false;");
            cleanUp();
          }
        }

      };
    }
  });

})(jQuery);

},{"jquery":"jquery"}],3:[function(require,module,exports){
var $, IframeFormData, XHR, _, addXhrProgressEvent, jQuery;

$ = jQuery = require("jquery");

_ = require('underscore');

require('./jquery.iframe-transport');

(addXhrProgressEvent = function($) {
  var originalXhr;
  originalXhr = $.ajaxSettings.xhr;
  return $.ajaxSetup({
    xhr: function() {
      var req;
      req = originalXhr();
      if (req.upload) {
        if (typeof req.upload.addEventListener === "function") {
          req.upload.addEventListener("progress", ((function(_this) {
            return function(evt) {
              return typeof _this.progressUpload === "function" ? _this.progressUpload(evt) : void 0;
            };
          })(this)), false);
        }
      }
      return req;
    }
  });
})(jQuery);

IframeFormData = (function() {
  function IframeFormData() {
    this._data = [];
  }

  IframeFormData.prototype.append = function(name, value) {
    return this._data.push({
      name: name,
      value: value
    });
  };

  IframeFormData.prototype.value = function() {
    return this._data;
  };

  return IframeFormData;

})();

module.exports = XHR = (function() {
  XHR.prototype["default"] = function() {
    return {
      url: "/",
      paramName: "file",
      type: "POST",
      dataType: "json"
    };
  };

  function XHR(options1) {
    this.options = options1;
    this.options = _(this["default"]()).extend(this.options);
  }

  XHR.prototype.send = function(files, datas) {
    var deferred, options;
    if (datas == null) {
      datas = [];
    }
    deferred = $.Deferred();
    files = _(files).isArray() ? files : [files];
    if (!this.isValidFiles(files)) {
      return deferred;
    }
    options = _(_(this.options).clone()).extend(this.dataOptions(files, datas, deferred));
    $.ajax(options);
    return deferred;
  };

  XHR.prototype.isValidFiles = function(files) {
    if (_(files).isEmpty()) {
      return false;
    }
    return ((window.Blob != null) && files[0] instanceof window.Blob) || ((window.File != null) && files[0] instanceof window.File) || (_(files[0]).has('input') && files[0].input instanceof HTMLInputElement);
  };

  XHR.prototype.dataOptions = function(files, datas, deferred) {
    if (_(files[0]).has('input')) {
      this.formData = new IframeFormData();
      return this.iframeOptions(files, deferred);
    } else {
      this.formData = new FormData();
      return this.XHROptions(files, datas, deferred);
    }
  };

  XHR.prototype.XHROptions = function(files, datas, deferred) {
    var data, file, i, j, len, len1, name, options, value;
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      if (file instanceof File) {
        this.formData.append(this.options.paramName, file, file.uploadName || file.name);
      }
    }
    for (j = 0, len1 = datas.length; j < len1; j++) {
      data = datas[j];
      for (name in data) {
        value = data[name];
        this.formData.append(this.options.paramName + "[" + name + "]", value);
      }
    }
    if (this.options.data) {
      this.handleData(this.options.data);
    }
    return options = {
      data: this.formData,
      processData: false,
      contentType: false,
      success: deferred.resolve,
      error: deferred.reject,
      progressUpload: function(e) {
        if (e.lengthComputable) {
          return deferred.notify(e);
        }
      }
    };
  };

  XHR.prototype.iframeOptions = function(files, deferred) {
    var options;
    if (this.options.data) {
      this.handleData(this.options.data);
    }
    return options = {
      dataType: "iframe " + this.options.dataType,
      fileInput: $(_(files).map(function(f) {
        return f.input;
      })),
      formData: this.formData.value(),
      success: deferred.resolve,
      error: deferred.reject
    };
  };

  XHR.prototype.handleData = function(data) {
    var name, results, v, value;
    results = [];
    for (name in data) {
      value = data[name];
      if (_(value).isArray()) {
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = value.length; i < len; i++) {
            v = value[i];
            results1.push(this.formData.append(name + "[]", v));
          }
          return results1;
        }).call(this));
      } else {
        results.push(this.formData.append(name, value));
      }
    }
    return results;
  };

  return XHR;

})();


},{"./jquery.iframe-transport":2,"jquery":"jquery","underscore":"underscore"}],4:[function(require,module,exports){
var YAFU;

YAFU = {
  XHR: require('./xhr'),
  FileInput: require('./file_input')
};

module.exports = YAFU;


},{"./file_input":1,"./xhr":3}]},{},[4])(4)
});
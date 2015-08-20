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
var $, IframeFormData, XHR, _, addXhrProgressEvent, jQuery;

$ = jQuery = require("jquery");

_ = require('underscore');

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


},{"jquery":"jquery","underscore":"underscore"}],3:[function(require,module,exports){
var YAFU;

YAFU = {
  XHR: require('./xhr'),
  FileInput: require('./file_input')
};

module.exports = YAFU;


},{"./file_input":1,"./xhr":2}]},{},[3])(3)
});
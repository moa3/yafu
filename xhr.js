(function() {
  var addXhrProgressEvent;

  if (this.YAFU == null) {
    this.YAFU = {};
  }

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

  this.YAFU.XHR = (function() {
    XHR.prototype["default"] = function() {
      return {
        url: "/",
        paramName: "file",
        type: "POST",
        dataType: "json"
      };
    };

    function XHR(options) {
      this.options = options;
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
      return files[0] instanceof window.Blob || files[0] instanceof window.File || (_(files[0]).has('input') && files[0].input instanceof HTMLInputElement);
    };

    XHR.prototype.dataOptions = function(files, datas, deferred) {
      if (_(files[0]).has('input')) {
        return this.iframeOptions(files, deferred);
      } else {
        return this.XHROptions(files, datas, deferred);
      }
    };

    XHR.prototype.XHROptions = function(files, datas, deferred) {
      var data, file, formData, name, options, value, _i, _j, _len, _len1;
      formData = new FormData();
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        if (file instanceof File) {
          formData.append(this.options.paramName, file, file.uploadName || file.name);
        }
      }
      for (_j = 0, _len1 = datas.length; _j < _len1; _j++) {
        data = datas[_j];
        for (name in data) {
          value = data[name];
          formData.append("" + this.options.paramName + "[" + name + "]", value);
        }
      }
      return options = {
        data: formData,
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
      return options = {
        dataType: "iframe " + this.options.dataType,
        fileInput: $(_(files).map(function(f) {
          return f.input;
        })),
        success: deferred.resolve,
        error: deferred.reject
      };
    };

    return XHR;

  })();

}).call(this);

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
    XHR.prototype["default"] = {
      url: "/",
      paramName: "file",
      type: "POST",
      dataType: "json"
    };

    function XHR(options) {
      this.options = options;
      this.options = _(this["default"]).extend(this.options);
      this.promises = [];
    }

    XHR.prototype.send = function(files, datas) {
      var deferred, options;
      if (datas == null) {
        datas = [];
      }
      deferred = $.Deferred();
      if (!this.isValidFile(files)) {
        return deferred;
      }
      options = _(this.options).extend(this.dataOptions(files, datas, deferred));
      $.ajax(options);
      return deferred;
    };

    XHR.prototype.isValidFile = function(files) {
      var isAFile, isFilledArray;
      isFilledArray = _(files).isArray() && !_(files).isEmpty();
      isAFile = ((window.Blob != null) && files instanceof window.Blob) || ((window.File != null) && files instanceof window.File) || (files != null ? files.input : void 0);
      return isFilledArray || isAFile;
    };

    XHR.prototype.dataOptions = function(files, datas, deferred) {
      files = _(files).isArray() ? files : [files];
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

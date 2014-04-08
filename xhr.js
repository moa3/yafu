(function() {
  if (this.YAFU == null) {
    this.YAFU = {};
  }

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
      isAFile = files instanceof window.Blob || files instanceof window.File;
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
          formData.append(name, value);
        }
      }
      return options = {
        data: formData,
        processData: false,
        contentType: false,
        success: deferred.resolve,
        error: deferred.reject,
        xhrFields: {
          onprogress: function(e) {
            return deferred.notify(e);
          }
        }
      };
    };

    XHR.prototype.iframeOptions = function(files, deferred) {
      var options;
      return options = {
        dataType: "iframe json",
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

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

    XHR.prototype.send = function(files) {
      var deferred, options;
      deferred = $.Deferred();
      options = _(this.options).extend(this.dataOptions(files, deferred));
      $.ajax(options);
      return deferred;
    };

    XHR.prototype.dataOptions = function(files, deferred) {
      files = _(files).isArray() ? files : [files];
      if (_(files[0]).has('input')) {
        return this.iframeOptions(files, deferred);
      } else {
        return this.XHROptions(files, deferred);
      }
    };

    XHR.prototype.XHROptions = function(files, deferred) {
      var file, formData, options, _i, _len;
      formData = new FormData();
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        formData.append(this.options.paramName, file, file.uploadName || file.name);
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

(function() {
  if (this.YAFU == null) {
    this.YAFU = {};
  }

  this.YAFU.FileInput = (function() {
    function FileInput(fileInput) {
      this.fileInput = fileInput;
      this.initInput();
    }

    FileInput.prototype.initInput = function() {
      this.$fileInput = $(this.fileInput);
      return this.$fileInput.on('change', (function(_this) {
        return function() {
          return _this._files = null;
        };
      })(this));
    };

    FileInput.prototype.files = function() {
      var file, value, _i, _len, _ref;
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
          _ref = this._files;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            file = _ref[_i];
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
      this.fileInput = inputClone;
      this.initInput();
      return old;
    };

    return FileInput;

  })();

}).call(this);

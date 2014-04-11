(function() {
  describe('XHR', function() {
    beforeEach(function() {
      var $input;
      $input = $('<input>', {
        type: 'file'
      });
      this.fileInput = new YAFU.FileInput($input[0]);
      this.originalInput = this.fileInput.$fileInput;
      sinon.stub(jQuery, "ajax", function(options) {
        return options.success();
      });
      return this.XHR = new YAFU.XHR();
    });
    afterEach(function() {
      var _base;
      if (typeof (_base = jQuery.prop).restore === "function") {
        _base.restore();
      }
      return jQuery.ajax.restore();
    });
    it('does not call $.ajax if files is empty', function() {
      this.XHR.send();
      return expect(jQuery.ajax).not.to.have.been.called;
    });
    describe('does not call $.ajax with wrong files property', function() {
      it('like a wrong object', function() {
        var files;
        files = {
          foo: "bar"
        };
        this.XHR.send(files);
        return expect(jQuery.ajax).not.to.have.been.called;
      });
      it('like an Array of wrong objects', function() {
        var files;
        files = [
          {
            foo: "bar"
          }
        ];
        this.XHR.send(files);
        return expect(jQuery.ajax).not.to.have.been.called;
      });
      return it('like an object with an input key but no FileInput inside', function() {
        var files;
        files = {
          input: 'blah'
        };
        this.XHR.send(files);
        return expect(jQuery.ajax).not.to.have.been.called;
      });
    });
    describe('options', function() {
      if (typeof Blob === 'function') {
        return it('calls $.ajax with given options', function() {
          var blob1, blob2, key, options, opts, value, _results;
          blob1 = new Blob;
          blob1.name = "file1.jpg";
          blob2 = new Blob;
          blob2.name = "file2.jpg";
          this.files = [blob1, blob2];
          sinon.stub(jQuery, "prop", (function(_this) {
            return function() {
              return _this.files;
            };
          })(this));
          opts = {
            url: "/images",
            paramName: "images",
            dataType: "text"
          };
          this.XHR = new YAFU.XHR(opts);
          this.XHR.send(this.fileInput.files());
          options = jQuery.ajax.args[0][0];
          _results = [];
          for (key in opts) {
            value = opts[key];
            _results.push(expect(options[key]).to.eq(value));
          }
          return _results;
        });
      }
    });
    describe('with HTML5 files property', function() {
      if (typeof Blob === 'function') {
        beforeEach(function() {
          var blob1, blob2;
          blob1 = new Blob;
          blob1.name = "file1.jpg";
          blob2 = new Blob;
          blob2.name = "file2.jpg";
          this.files = [blob1, blob2];
          sinon.stub(jQuery, "prop", (function(_this) {
            return function() {
              return _this.files;
            };
          })(this));
          return this.XHR.send(this.fileInput.files());
        });
        it('calls $.ajax with default options', function() {
          var key, options, value, _ref, _results;
          expect(jQuery.prop).to.have.been.calledOnce;
          options = jQuery.ajax.args[0][0];
          _ref = this.XHR["default"];
          _results = [];
          for (key in _ref) {
            value = _ref[key];
            _results.push(expect(options[key]).to.eq(value));
          }
          return _results;
        });
        return it('calls $.ajax with some formData', function() {
          return expect(jQuery.ajax.args[0][0].data).to.be.an.instanceOf(FormData);
        });
      }
    });
    return describe('without HTML5 files property ie. old browser', function() {
      beforeEach(function() {
        this.file = "file1.jpg";
        sinon.stub(jQuery, "prop", (function(_this) {
          return function(input, prop) {
            if (prop === "files") {
              return null;
            }
            return _this.file;
          };
        })(this));
        return this.XHR.send(this.fileInput.files());
      });
      it('calls $.ajax', function() {
        return expect(jQuery.ajax).to.have.been.called;
      });
      return it('calls $.ajax with options for iframe-transport', function() {
        var options;
        options = jQuery.ajax.args[0][0];
        expect(options.dataType).to.eq("iframe json");
        return expect(options).to.include.key('fileInput');
      });
    });
  });

}).call(this);

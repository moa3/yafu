(function() {
  describe('FileInput', function() {
    beforeEach(function() {
      var $input;
      $input = $('<input>', {
        type: 'file'
      });
      return this.fileInput = new YAFU.FileInput($input[0]);
    });
    afterEach(function() {
      return jQuery.prop.restore();
    });
    describe('with HTML5 files property', function() {
      beforeEach(function() {
        this.files = [
          {
            name: "file1.jpg",
            size: 42
          }, {
            name: "file2.jpg",
            size: 21
          }
        ];
        return sinon.stub(jQuery, "prop", (function(_this) {
          return function() {
            return _this.files;
          };
        })(this));
      });
      it('returns the files in the same order', function() {
        var f, files, i, _i, _len, _results;
        files = this.fileInput.files();
        _results = [];
        for (i = _i = 0, _len = files.length; _i < _len; i = ++_i) {
          f = files[i];
          _results.push(expect(f).to.eq(this.files[i]));
        }
        return _results;
      });
      return it('memoizes the files', function() {
        this.fileInput.files();
        this.fileInput.files();
        return expect(jQuery.prop).to.have.been.calledOnce;
      });
    });
    return describe('without HTML5 files property ie. old browser', function() {
      beforeEach(function() {
        this.file = "file1.jpg";
        return sinon.stub(jQuery, "prop", (function(_this) {
          return function(input, prop) {
            if (prop === "files") {
              return null;
            }
            return _this.file;
          };
        })(this));
      });
      it('returns a fake File Object with a reference to the FileInput Element', function() {
        this.input = this.fileInput.fileInput;
        this.f = this.fileInput.files();
        expect(this.f.length).to.eq(1);
        expect(this.f[0].name).to.eq(this.file);
        return expect(this.f[0].input).to.equal(this.input);
      });
      it('clones the original FileInput Element', function() {
        this.input = this.fileInput.fileInput;
        expect(this.fileInput.fileInput).to.equal(this.input);
        this.fileInput.files();
        expect(this.fileInput.fileInput).not.to.equal(this.input);
        return expect(this.fileInput.fileInput.outerHTML).to.equal(this.input.outerHTML);
      });
      return it('memoizes the files', function() {
        this.fileInput.files();
        this.fileInput.files();
        return expect(jQuery.prop).to.have.been.calledTwice;
      });
    });
  });

}).call(this);

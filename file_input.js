(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.yafu = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var FileInput;

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


},{}]},{},[1])(1)
});
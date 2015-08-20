$ = jQuery = require "jquery"
_ = require 'underscore'
YAFU = require 'yafu'

describe 'FileInput', ->

  beforeEach ->
    $input = $('<input>', type: 'file')
    @fileInput = new YAFU.FileInput $input[0]

  afterEach ->
    jQuery.prop.restore()

  describe 'with HTML5 files property', ->

    beforeEach ->
      @files =
        [
          {name: "file1.jpg", size: 42}
          {name: "file2.jpg", size: 21}
        ]
      #Mock jQuery prop function to mimic HTML FileApi
      sinon.stub jQuery, "prop", => @files

    it 'returns the files in the same order', ->
      files = @fileInput.files()
      for f, i in files
        expect(f).to.eq @files[i]

    it 'memoizes the files', ->
      @fileInput.files()
      @fileInput.files()
      expect(jQuery.prop).to.have.been.calledOnce

  describe 'without HTML5 files property ie. old browser', ->

    beforeEach ->
      @file = "file1.jpg"
      sinon.stub jQuery, "prop", (input, prop) =>
        return null if prop is "files" #no "files" property
        @file #for the "value" property

    it 'returns a fake File Object with a reference to the FileInput Element', ->
      @input = @fileInput.fileInput
      @f = @fileInput.files()
      expect(@f.length).to.eq 1
      expect(@f[0].name).to.eq @file
      expect(@f[0].input).to.equal @input

    it 'clones the original FileInput Element', ->
      @input = @fileInput.fileInput
      expect(@fileInput.fileInput).to.equal @input
      @fileInput.files()
      expect(@fileInput.fileInput).not.to.equal @input
      expect(@fileInput.fileInput.outerHTML).to.equal @input.outerHTML

    it 'memoizes the files', ->
      @fileInput.files()
      @fileInput.files()
      expect(jQuery.prop).to.have.been.calledTwice

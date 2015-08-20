$ = jQuery = require "jquery"
_ = require 'underscore'
YAFU = require '../yafu'

describe 'XHR', ->

  beforeEach ->
    $input = $('<input>', type: 'file')
    @fileInput = new YAFU.FileInput $input[0]
    @originalInput = @fileInput.$fileInput
    sinon.stub jQuery, "ajax", (options)->
      options.success()
    @XHR = new YAFU.XHR()

  afterEach ->
    jQuery.prop.restore?()
    jQuery.ajax.restore()

  it 'does not call $.ajax if files is empty', ->
    @XHR.send()
    expect(jQuery.ajax).not.to.have.been.called

  describe 'does not call $.ajax with wrong files property', ->

    it 'like a wrong object', ->
      files =
        foo: "bar"
      @XHR.send files
      expect(jQuery.ajax).not.to.have.been.called

    it 'like an Array of wrong objects', ->
      files =
        [
          {foo: "bar"}
        ]
      @XHR.send files
      expect(jQuery.ajax).not.to.have.been.called

    it 'like an object with an input key but no FileInput inside', ->
      files =
        input: 'blah'
      @XHR.send files
      expect(jQuery.ajax).not.to.have.been.called

  describe 'options', ->

    if typeof Blob is 'function'
      it 'calls $.ajax with given options', ->
        blob1 = new Blob
        blob1.name = "file1.jpg"
        blob2 = new Blob
        blob2.name = "file2.jpg"
        @files =
          [
            blob1
            blob2
          ]
        #Mock jQuery prop function to mimic HTML FileApi
        sinon.stub jQuery, "prop", => @files
        opts =
          url: "/images"
          paramName: "images"
          dataType: "text"
        @XHR = new YAFU.XHR opts
        @XHR.send @fileInput.files()
        options = jQuery.ajax.args[0][0]
        for key, value of opts
          expect(options[key]).to.eq value

  describe 'with HTML5 files property', ->

    if typeof Blob is 'function'
      beforeEach ->
        blob1 = new Blob
        blob1.name = "file1.jpg"
        blob2 = new Blob
        blob2.name = "file2.jpg"
        @files =
          [
            blob1
            blob2
          ]
        #Mock jQuery prop function to mimic HTML FileApi
        sinon.stub jQuery, "prop", => @files
        @XHR.send @fileInput.files()

      it 'calls $.ajax with default options', ->
        expect(jQuery.prop).to.have.been.calledOnce
        options = jQuery.ajax.args[0][0]
        for key, value of @XHR.default
          expect(options[key]).to.eq value

      it 'calls $.ajax with some formData', ->
        expect(jQuery.ajax.args[0][0].data).to.be.an.instanceOf FormData

  describe 'without HTML5 files property ie. old browser', ->

    beforeEach ->
      @file = "file1.jpg"
      sinon.stub jQuery, "prop", (input, prop) =>
        return null if prop is "files" #no "files" property
        @file #for the "value" property
      @XHR.send @fileInput.files()

    it 'calls $.ajax', ->
      expect(jQuery.ajax).to.have.been.called

    it 'calls $.ajax with options for iframe-transport', ->
      options = jQuery.ajax.args[0][0]
      expect(options.dataType).to.eq "iframe json"
      expect(options).to.include.key 'fileInput'

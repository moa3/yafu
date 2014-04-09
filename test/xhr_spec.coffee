
@base64toBlob = (base64Data, contentType='image/png') ->
  contentType = contentType or ""
  sliceSize = 1024
  byteCharacters = atob(base64Data)
  bytesLength = byteCharacters.length
  slicesCount = Math.ceil(bytesLength / sliceSize)
  byteArrays = new Array(slicesCount)
  sliceIndex = 0

  while sliceIndex < slicesCount
    begin = sliceIndex * sliceSize
    end = Math.min(begin + sliceSize, bytesLength)
    bytes = new Array(end - begin)
    offset = begin
    i = 0

    while offset < end
      bytes[i] = byteCharacters[offset].charCodeAt(0)
      ++i
      ++offset
    byteArrays[sliceIndex] = new Uint8Array(bytes)
    ++sliceIndex
  new Blob(byteArrays,
    type: contentType
  )

@blob1 = base64toBlob 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
@blob1.name = "file1.jpg"
@blob2 = base64toBlob 'R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw=='
@blob2.name = "file2.jpg"

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

    it 'calls $.ajax with given options', ->
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

    beforeEach ->
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

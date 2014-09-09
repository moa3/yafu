@YAFU ?= {}

class @YAFU.FileInput

  constructor: (@fileInput)->
    @initInput()

  initInput: ->
    #Safari has a strange behavior with multiple file input
    if @fileInput.multiple and not FileReader?
      @fileInput.removeAttribute 'multiple'
    @$fileInput = $(@fileInput)
    @$fileInput.on 'change', =>
      @_files = null

  files: ->
    unless @_files
      @_files = _(@$fileInput.prop("files")).toArray()
      unless @_files.length
        value = @$fileInput.prop("value")
        return [] unless value
        # If the files property is not available, the browser does not
        # support the File API and we add a pseudo File object with
        # the input value as name with path information removed:
        # TODO use moxie/src/javascript/core/utils/Mime.js to infer
        # mimetype from file extension
        # and add it to the "type" key
        @_files = [
          name: value.replace(/^.*\\/, "")
          input: @replaceFileInput()
        ]
      else if @_files[0].name is undefined and @_files[0].fileName
        # File normalization for Safari 4 and Firefox 3:
        for file in @_files
          file.name = file.fileName
          file.size = file.fileSize
    @_files

  replaceFileInput: ->
    inputClone = @$fileInput.clone(true)
    $("<form></form>").append(inputClone)[0].reset()

    # Detaching allows to insert the fileInput on another form
    # without loosing the file input value:
    @$fileInput.after(inputClone).detach()

    # Avoid memory leaks with the detached file input:
    $.cleanData @$fileInput.unbind("remove")

    # Replace the original file input element in the fileInput
    old = @$fileInput[0]
    @$fileInput.off()
    @fileInput = inputClone[0]
    @initInput()
    old

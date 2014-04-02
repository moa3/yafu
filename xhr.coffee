#= require iframe-transport
@YAFU ?= {}

class @YAFU.XHR

  default:
    url: "/"
    paramName: "file"
    type: "POST"
    dataType: "json"

  constructor: (@options)->
    @options = _(@default).extend @options
    @promises = []

  send: (files) ->
    deferred = $.Deferred()
    return deferred unless @isValidFile files
    options = _(@options).extend @dataOptions(files, deferred)
    $.ajax(options)
    deferred

  isValidFile: (files)->
    isFilledArray = _(files).isArray() and not _(files).isEmpty()
    isAFile = files instanceof window.Blob || files instanceof window.File
    isFilledArray or isAFile

  dataOptions: (files, deferred) ->
    files = if _(files).isArray() then files else [files]
    if _(files[0]).has 'input' #this is an iframe upload
      @iframeOptions files, deferred
    else
      @XHROptions files, deferred

  XHROptions: (files, deferred)->
    formData = new FormData()
    for file in files when file instanceof File
      formData.append @options.paramName, file, file.uploadName or file.name
    options =
      data: formData
      processData: no
      contentType: no
      success: deferred.resolve
      error: deferred.reject
      xhrFields:
        onprogress: (e) ->
          deferred.notify(e)

  iframeOptions: (files, deferred)->
    options =
      dataType: "iframe json"
      fileInput: $ _(files).map (f) -> f.input
      success: deferred.resolve
      error: deferred.reject

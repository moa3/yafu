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

  send: (files, datas=[]) ->
    deferred = $.Deferred()
    return deferred unless @isValidFile files
    options = _(@options).extend @dataOptions(files, datas, deferred)
    $.ajax(options)
    deferred

  isValidFile: (files)->
    isFilledArray = _(files).isArray() and not _(files).isEmpty()
    isAFile = files instanceof window.Blob || files instanceof window.File
    isFilledArray or isAFile

  dataOptions: (files, datas, deferred) ->
    files = if _(files).isArray() then files else [files]
    if _(files[0]).has 'input' #this is an iframe upload
      @iframeOptions files, deferred
    else
      @XHROptions files, datas, deferred

  XHROptions: (files, datas, deferred)->
    formData = new FormData()
    for file in files when file instanceof File
      formData.append @options.paramName, file, file.uploadName or file.name
    for data in datas
      for name, value of data
        formData.append "#{paramName}[#{name}]", value
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

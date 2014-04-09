@YAFU ?= {}
(addXhrProgressEvent = ($) ->
  originalXhr = $.ajaxSettings.xhr
  $.ajaxSetup
    xhr: ->
      req = originalXhr()
      if req.upload
        if typeof req.upload.addEventListener is "function"
          req.upload.addEventListener "progress", ((evt) =>
            @progressUpload? evt
          ), false
      req
) jQuery

class @YAFU.XHR

  default: ->
    url: "/"
    paramName: "file"
    type: "POST"
    dataType: "json"

  constructor: (@options)->
    @options = _(@default()).extend @options

  send: (files, datas=[]) ->
    deferred = $.Deferred()
    files = if _(files).isArray() then files else [files]
    return deferred unless @isValidFiles files
    options = _(_(@options).clone()).extend @dataOptions(files, datas, deferred)
    $.ajax(options)
    deferred

  isValidFiles: (files)->
    return no if _(files).isEmpty()
    files[0] instanceof window.Blob or
    files[0] instanceof window.File or
    (_(files[0]).has('input') and files[0].input instanceof HTMLInputElement)

  dataOptions: (files, datas, deferred) ->
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
        formData.append "#{@options.paramName}[#{name}]", value
    options =
      data: formData
      processData: no
      contentType: no
      success: deferred.resolve
      error: deferred.reject
      progressUpload: (e)->
        deferred.notify(e) if e.lengthComputable

  iframeOptions: (files, deferred)->
    options =
      dataType: "iframe #{@options.dataType}"
      fileInput: $ _(files).map (f) -> f.input
      success: deferred.resolve
      error: deferred.reject

$ = jQuery = require "jquery"
_ = require 'underscore'

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

class IframeFormData

  constructor: ->
    @_data = []

  append: (name, value)->
    @_data.push
      name: name
      value: value

  value: -> @_data

module.exports = class XHR

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
    (window.Blob? and files[0] instanceof window.Blob) or
    (window.File? and files[0] instanceof window.File) or
    (_(files[0]).has('input') and files[0].input instanceof HTMLInputElement)

  dataOptions: (files, datas, deferred) ->
    if _(files[0]).has 'input' #this is an iframe upload
      @formData = new IframeFormData()
      @iframeOptions files, deferred
    else
      @formData = new FormData()
      @XHROptions files, datas, deferred

  XHROptions: (files, datas, deferred)->
    for file in files when file instanceof File
      @formData.append @options.paramName, file, file.uploadName or file.name
    for data in datas
      for name, value of data
        @formData.append "#{@options.paramName}[#{name}]", value
    @handleData @options.data if @options.data
    options =
      data: @formData
      processData: no
      contentType: no
      success: deferred.resolve
      error: deferred.reject
      progressUpload: (e)->
        deferred.notify(e) if e.lengthComputable

  iframeOptions: (files, deferred)->
    @handleData @options.data if @options.data
    options =
      dataType: "iframe #{@options.dataType}"
      fileInput: $ _(files).map (f) -> f.input
      formData: @formData.value()
      success: deferred.resolve
      error: deferred.reject

  handleData: (data)->
    for name, value of data
      if _(value).isArray()
        for v in value
          @formData.append "#{name}[]", v
      else
        @formData.append name, value

# Let's fake a server
fakeServer = sinon.useFakeXMLHttpRequest()
request = ''

fakeServer.onCreate = (xhr)->
  request = xhr

$input = $ 'input[type=file]'

fileInput = new YAFU.FileInput $input[0]
xhr = new YAFU.XHR
  url: '/exemple/exemple.json'

onChange = ->
  $selected = $('#files')
  template = _.template "<li><%= name %>&nbsp;<a href=\"#\">upload (<%= msg %>)</a></li>"
  _(fileInput.files()).each (f, i)->
    msg = if i % 2 then "This will succeed" else "This will fail"
    li = $ template name: f.name, msg: msg
    $selected.append li
    onClick = (e)->
      e.preventDefault()
      xhr.send(f).done((response)->
        li.append _.template("<span>Success with message: <%= message %></span>")(message: response.message)
      ).fail((jqXHR, status, message)->
        li.append _.template("<span>Failure with message: <%= message %></span>")(message: message)
      )
      if i % 2
        request.respond 200,
          { "Content-Type": "application/json" },
          "{ \"message\": \"#{f.name} was uploaded\" }"
      else
        request.respond 500
    li.find('a').click onClick

$input.change onChange

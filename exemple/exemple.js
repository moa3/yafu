(function() {
  var $input, fakeServer, fileInput, onChange, request, xhr;

  fakeServer = sinon.useFakeXMLHttpRequest();

  request = '';

  fakeServer.onCreate = function(xhr) {
    return request = xhr;
  };

  $input = $('input[type=file]');

  fileInput = new YAFU.FileInput($input[0]);

  xhr = new YAFU.XHR({
    url: '/exemple/exemple.json'
  });

  onChange = function() {
    var $selected, template;
    $selected = $('#files');
    template = _.template("<li><%= name %>&nbsp;<a href=\"#\">upload (<%= msg %>)</a></li>");
    return _(fileInput.files()).each(function(f, i) {
      var li, msg, onClick;
      msg = i % 2 ? "This will succeed" : "This will fail";
      li = $(template({
        name: f.name,
        msg: msg
      }));
      $selected.append(li);
      onClick = function(e) {
        e.preventDefault();
        xhr.send(f).done(function(response) {
          return li.append(_.template("<span>Success with message: <%= message %></span>")({
            message: response.message
          }));
        }).fail(function(jqXHR, status, message) {
          return li.append(_.template("<span>Failure with message: <%= message %></span>")({
            message: message
          }));
        });
        if (i % 2) {
          return request.respond(200, {
            "Content-Type": "application/json"
          }, "{ \"message\": \"" + f.name + " was uploaded\" }");
        } else {
          return request.respond(500);
        }
      };
      return li.find('a').click(onClick);
    });
  };

  $input.change(onChange);

}).call(this);

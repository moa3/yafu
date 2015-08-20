(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.yafu = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}]},{},[1])(1)
});
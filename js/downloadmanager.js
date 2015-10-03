$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
  // check for conditions and support for blob / arraybuffer response type
  if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
  {
    return {
      // create new XMLHttpRequest
      send: function(headers, callback){
        // setup all variables
        var xhr = new XMLHttpRequest(),
          url = options.url,
          type = options.type,
          async = options.async || true,
        // blob or arraybuffer. Default is blob
          dataType = options.responseType || "blob",
          data = options.data || null,
          username = options.username || null,
          password = options.password || null;

        xhr.addEventListener('load', function(){
          var data = {};
          data[options.dataType] = xhr.response;
          // make callback and send data
          callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
        });

        xhr.open(type, url, async, username, password);

        // setup custom headers
        for (var i in headers ) {
          xhr.setRequestHeader(i, headers[i] );
        }

        xhr.responseType = dataType;
        xhr.send(data);
      },
      abort: function(){
        jqXHR.abort();
      }
    };
  }
});

function readFileParam() {
  var fileParam = getUrlParam("file");
  if (fileParam != null) {
    encodeUrlFromBase64(fileParam);
  }
}

function encodeUrlFromBase64(urls) {
  console.log(urls)
  var key = atob(decodeURIComponent(urls.split('|')[0]))
  var cipher = atob(decodeURIComponent(urls.split('|')[1]))
  var name = atob(decodeURIComponent(urls.split('|')[2]))

  console.log(key)
  console.log(cipher)

  downloadFileParts(key, cipher, name);
}

function downloadFileParts(key, cipher, name) {
  downloadStarted("Downloading file parts");

  var count = 0

  var splitfile = {
    plain: '',
    key: ''
  }

  getFile(key).then(function(result){
    console.log("Key download done")
    splitfile.key = result
    count++
    callback(result)
  })

  getFile(cipher).then(function(result){
      console.log("Cipher download done")
      splitfile.cipher = result
      count++
      callback(result)
  })

  function callback() {
    console.log(splitfile)
    if(count < 2) {
      return
    }

    console.log(splitfile)

    decrypt(splitfile)
    saveByteArray([splitfile.plain], name);
    downloadFinished();
  }

  //for (var i = 0; i < urls.length; i++) {
  //  var progress = Math.random() * 100;
  //  setDownloadStatus("Downloading part " + i, progress);
  //
  //  // download
  //}

}

function decrypt(splitfile){
  splitfile.plain =  new Uint8Array(splitfile.cipher.length)
  for (var cycle = 0 ; cycle < splitfile.cipher.length ; cycle++) {
    if(splitfile.cipher[cycle] < splitfile.key[cycle]){
      splitfile.plain[cycle] = splitfile.cipher[cycle] + 255 - splitfile.key[cycle]
    } else {
      splitfile.plain[cycle] = splitfile.cipher[cycle] - splitfile.key[cycle]
    }
  }
}

var saveByteArray = (function () {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  return function (data, name) {
    var blob = new Blob(data, {type: "octet/stream"}),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  };
}());

function readFileParam() {
  var fileParam = getUrlParam("file");
  if (fileParam != null) {
    encodeUrlFromBase64(fileParam);
  }
}

function encodeUrlFromBase64(base64) {
  var urls;

  var key = atob(urls.split('|')[0])
  var cipher = atob(urls.split('|')[1])

  downloadFileParts(key, cipher);
}

function downloadFileParts(key, cipher) {
  downloadStarted("Downloading file parts");

  var count = 0

  var splitfile = {
    plain: plain,
    key: key
  }

  $.ajax({
    type: "GET",
    url:key,
    success: function(result) {
      splitfile.key = result
      count++
      callback(result)
    }
  });

  $.ajax({
    type: "GET",
    url:cipher
    success: function(result) {
      splitfile.cipher = result
      count++
      callback(result)
    }
  });

  function callback() {
    if(count < 2) {
      return
    }

    decrypt(splitfile)
    saveByteArray([splitfile.plain], "test.txt");
    downloadFinished();
  }

  for (var i = 0; i < urls.length; i++) {
    var progress = Math.random() * 100;
    setDownloadStatus("Downloading part " + i, progress);

    // download
  }

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
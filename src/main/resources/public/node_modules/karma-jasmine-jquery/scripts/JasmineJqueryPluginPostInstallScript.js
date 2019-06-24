var fs = require('fs');
var someFile = 'lib/jasmine-jquery.js';
fs.unlinkSync('lib/jasmine');
fs.readFile(someFile, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/window\.jQuery/g, '$j');

  fs.writeFile(someFile, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});

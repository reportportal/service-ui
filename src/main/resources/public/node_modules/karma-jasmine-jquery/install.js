require('child_process').exec(require('path').join('node_modules', '.bin', 'bower-installer') + ' --keep --remove');
var fs = require('fs');
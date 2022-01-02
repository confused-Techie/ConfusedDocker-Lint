const conf = new (require('conf'))()

var main = require('../src/main');

function lint(fileDir) {
  if (fileDir != null) {
    main.leader(fileDir)
      .then(res => {
        console.log(res);
      });
  } else {
    console.log('No File or Folder Specified');
  }
}

module.exports = lint;

var lint = require('./filereader/filereader.js');
const Tokenizer = require('./tokenizer');
const Parser = require('./parser');
const Scanner = require('./scanner');

module.exports.leader = function(fileDir) {
  return new Promise(function (resolve, reject) {
    lint(fileDir)
      .then(linterData => {

        var findTokens = new Tokenizer(linterData);
        var tokens = findTokens.tokenize();

        // now with the data parsed from the file character by character and the tokenizer reducing the complcity of that data
        // we can move on to a language specific parser
        var Parse = new Parser(tokens);
        var parsed = Parse.parse();
        console.log(findTokens);
        console.log(tokens);
        console.log(parsed);

        var Scan = new Scanner(tokens, parsed);
        Scan.init();
      });
  });
}

const TokenConst = require('./tokenconst');

module.exports =  class Tokenizer {
  constructor(input) {
    this.data = input;
  }

  tokenize() {
    const tokens = [];

    for (var i = 0; i < this.data.length; i++) {
      var curItem = this.data[i];

      // try to match the token to language specific type
      var result = this.matchToken(curItem);

      switch (result) {
        case "COMMENT/PARSER":
          var smushed = this.smushType(tokens, result, curItem.value);
          if (!smushed) {
            tokens.push(new TokenConst(curItem.value, curItem.kind, result));
            break;
          }
          break;

        case "STRING":
          var smushed = this.smushType(tokens, result, curItem.value);
          if (smushed) {
            break;
          } else {
            tokens.push(new TokenConst(curItem.value, curItem.kind, result));
            break;
          }
          //tokens.push(new TokenConst(fullItemString, curItem.kind, result));
          break;

        case "WHITE_SPACE":
          var smushed = this.smushType(tokens, result, curItem.value);
          if (smushed) {
            // since smushed will add the item into the tokens array, we need to modify the tokens kind to be multiple whitespace
            tokens[tokens.length -1].langkind = "WHITESPACE_GROUP";
            break;
          } else {
            tokens.push(new TokenConst(curItem.value, curItem.kind, result));
            break;
          }
          break;

        case "NEW_LINE":
          var smushed = this.smushType(tokens, result, curItem.value);
          if (!smushed) {
            tokens.push(new TokenConst(curItem.value, curItem.kind, result));
            break;
          }
          break;

        case "INTEGER":
          var smushed = this.smushType(tokens, result, curItem.value);
          if (!smushed) {
            tokens.push(new TokenConst(curItem.value, curItem.kind, result));
            break;
          }
          break;

        default:
          // default ensures no tokens are dropped 
          tokens.push(new TokenConst(curItem.value, curItem.kind, curItem.kind));
          break;
      }
    }
    //console.log(tokens);
    return tokens;
  }

  matchToken(item) {
    if (item.value.match(/#/)) {
      return "COMMENT/PARSER";
    } else if (item.value.match(/^([a-zA-Z]+)/)) {
      return "STRING";
    } else if (item.value.match(/[ ]/)) {
      return "WHITE_SPACE";
    } else if (item.value.match(/[\n\r]/)) {
      return "NEW_LINE";
    } else if (item.value.match(/[0-9]/)) {
      return "INTEGER";
    }
  }

  smushType(tokens, curMatch, curItemValue) {
    // this will take the current token type returned, and if equal to the last token pushed will smush them.
    if (tokens[tokens.length -1]) {
      var lastToken = tokens[tokens.length -1];
      // since whitespaces have a dynamic langkind we will add a special check for that
      if (lastToken.langkind == curMatch || (lastToken.langkind == "WHITESPACE_GROUP" && curMatch == "WHITE_SPACE")) {
        lastToken.value += curItemValue;
        return true;
      } else {
        return false;
      }
    } else {
      // there are no previous tokens to smush
      return false;
    }
  }

}

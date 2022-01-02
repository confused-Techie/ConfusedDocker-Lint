module.exports = class Parser {
  constructor(tokens) {
    this.tokens = tokens;
  }

  parse() {

    // The parser will work by taking a line by line approch, and matching that way since dockerfile is line based
    var tokenLines = this.constructLine();
    var parsedTokenLines = [];

    for (var i = 0; i < tokenLines.length; i++) {
      var type = this.matchType(tokenLines[i]);
      var tmpObj = { lines: tokenLines[i], type: type };
      parsedTokenLines.push(tmpObj);
    }

    return parsedTokenLines;
  }

  constructLine() {
    var allLines = [];
    var curLine = [];
    for (var i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i].langkind != "NEW_LINE") {
        curLine.push(this.tokens[i]);
      } else {
        allLines.push(curLine);
        curLine = [];
      }
    }
    return allLines;
  }

  matchType(line) {
    // DEFINITIONS to look for
    // Comment = whitespace || whitespace_group -> comment/parser -> string -> !equal_sign
    if (this.matchComment(line)) {
      return "COMMENT";
    } else if (this.matchDirective(line)) {
      return "PARSER_DIRECTIVE";
    } else if (this.matchInstruction(line)) {
      return "INSTRUCTION";
    }
    return "UNKNOWN";
  }

  matchComment(line) {
    // Comment = whitespace || whitespace_group -> comment/parser -> string -> !equal_sign
    var declareIndex = this.findType(line, "COMMENT/PARSER");
    if (declareIndex != -1) {

      var getPrev = (value) => this.getPrevious(line, value, declareIndex);
      var getNex = (value) => this.getNext(line, value, declareIndex);

      if (getPrev(1) == "WHITESPACE_GROUP" || getPrev(1) == "WHITE_SPACE" || getPrev(1) == "") {
        if (getNex(1) == "STRING" || getNex(1) == "WHITE_SPACE" || getNex(1) == "WHITESPACE_GROUP") {
          // once we have confirmed that : whitespace || whitespace_group -> comment/parser -> whitespace,whitespace_group,stirng
          // we need to see if it was a string the next can't be an equal sign
          // if whitespace or group then string can't be equal sign
          if (getNex(1) == "STRING" && getNex(2) != "EQUALS" && getNex(3) != "EQUALS") {
            return true;
          } else if (getNex(1) == "WHITE_SPACE" || getNex(1) == "WHITESPACE_GROUP") {
            if (getNex(2) == "STRING" && getNex(3) != "EQUALS" && getNex(4) != "EQUALS") {
              return true;
            } else {
              return false;
            }
          }
        } else {
          return false;
        }
      } else {
        return false;
      }

    } else {
      return false;
    }
    return false;
  }

  matchDirective(line) {
    // Directive = whitespace || whitespace_group -> comment/parser -> string -> equal_sign
    // In the match comment I tried my new method, here we will try regex
    var fullLine = this.concoctLine(line);
    if (fullLine.match(/(^\s*[#]\s*[a-zA-Z0-9]+\s*[[=]\s*[\S]+)/)) {
      return true;
    } else {
      return false;
    }
  }

  matchInstruction(line) {
    var fullLine = this.concoctLine(line);
    if (fullLine.match(/(^\s*[A-Z]+\s*\S)/)) {
      return true;
    } else {
      return false;
    }
  }

  findType(line, requestType) {
    // findType takes a line and returns the index of the requested language type
    for (var i = 0; i < line.length; i++) {
      if (line[i].langkind == requestType) {
        return i;
      }
    }
    return -1;
  }

  getPrevious(line, value, declareIndex) {
    if (line[declareIndex -value]) {
      return line[declareIndex -value].langkind;
    } else {
      return "";
    }
  }

  getNext(line, value, declareIndex) {
    if (line[declareIndex +value]) {
      return line[declareIndex +value].langkind;
    } else {
      return "";
    }
  }

  concoctLine(line) {
    var fullLine = "";
    for (var i = 0; i < line.length; i++) {
      fullLine += line[i].value;
    }
    return fullLine;
  }
}

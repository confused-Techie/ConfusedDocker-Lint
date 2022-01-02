module.exports = class Scanner {
  constructor(rawTokens, rawParsed) {
    this.rawTokens = rawTokens,
    this.rawParsed = rawParsed,
    this.alerts = [],
    this.tokens,
    this.lines = [],
    this.totalAlerts = 0,
    // next will be global variables to allow definition while processing the code to aid in making alerts
    this.escapeCharacter = "\\",
    this.globalVariables = []
  }

  // Scanner will attempt at full validation of the codebase, and building alerts, and a more structured tokens or even AST

  //---------------
  // Alerts:
  // [ { id: INT, msg: 'Reason its been thrown', evidence: 'Offending text', line: LINE_INT, remedy: 'Possible fixes',
  //     severity: 'High/medium/low', type: 'style/best practices/...' } ]

  // Types: Style/Syntax

  //-------------
  // Tokens:
  //

  //------------
  // Lines:
  // { line: 1, type: 'PARSER_DIRECTIVE', parent: 0, value: 'line_of_code' };

  init() {
    var constructLinesDone = this.constructLines();
    if (constructLinesDone) {
      // first run functions that set up any globals
      this.findIntendedEscape();


      this.checkLineContinuation();
      this.findErrors();
      console.log(this.lines);
      console.log(this.alerts);
    }

  }

  constructLines() {

    for (var i = 0; i < this.rawParsed.length; i++) {
      var curLineValue = "";
      for (var y = 0; y < this.rawParsed[i].lines.length; y++) {
        curLineValue += this.rawParsed[i].lines[y].value;
      }
      this.lines.push({ line: i+1, type: this.rawParsed[i].type, parent: 0, value: curLineValue });
    }
    return true;
  }

  checkLineContinuation() {
    // the goal of check lines is to find lines that have an unknown type and attempt to determine what they are
    // mainly checking if they belong to line continuation since that isn't handled in the parser.
    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].type == "UNKNOWN" && this.lines[i].value) {
        var lastValidIndex = 1;
        // While originally these would just check the last line, then I built in an exception for comments,
        // rather than inspect this with proper syntax first, we will instead look for continuation characters only.
        // the last available, and if run commands are found instead then that can be a warning
        // to support different specified escape characters we need to create this regex obj on the fly
        //var defaultEscapeReg = /[\\]\s*$/;
        //var defaultEscapeReg = defaultEscapeReg.replace("\\", this.escapeCharacter);
        //var reg = new RegExp(defaultEscapeReg);
        try {
          if (this.lines[i-lastValidIndex].value) {
            while (this.lines[i-lastValidIndex].value.match(/\S$/) != this.escapeCharacter) {
              console.log(`Failed Check: For: ${this.lines[i].line} Line: ${this.lines[i-lastValidIndex].line} Char: ${this.lines[i-lastValidIndex].value.match(/\S$/)} Escape: ${this.escapeCharacter}`);
              lastValidIndex++;
            }
            this.lines[i].type = this.lines[i-lastValidIndex].type;
            this.lines[i].parent = this.lines[i-lastValidIndex].line;
          }
        } catch(err) {
          console.log(`Couldn't identify line: ${this.lines[i].line}. Error: ${err}`);
        }

      //  if (this.lines[i-lastValidIndex].value.match(/[\\]\s*$/)) {
          // this will see if there is a continuation character at the end of the last line.
          // its worth noting somewhere that the REVERSE_SOLIDUS is duplicated to escape the character when used within nodejs
        //  this.lines[i].type = this.lines[i-1].type;
        //  this.lines[i].parent = this.lines[i-1].line;
        //} // else if other methods of matching unknown lines
      }
    }
  }

  findErrors() {
    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].type == "COMMENT") {
        this.findCommentError(this.lines[i]);
      } else if (this.lines[i].type == "PARSER_DIRECTIVE") {
        this.findParserError(this.lines[i]);
      }
    }
  }

  findIntendedEscape() {
    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].type == "PARSER_DIRECTIVE") {
        var intendedDirective = this.lines[i].value.match(/[#]\s*\S*\s*[=]/);
        var intendedDirective = intendedDirective[0].replace("#", "").replace("=", "").trim().toLowerCase();
        if (intendedDirective == "escape") {
          var intendedDirectiveValue = this.lines[i].value.match(/[=]\s*\S*/);
          var intendedDirectiveValue = intendedDirectiveValue[0].replace("=", "").trim().toLowerCase();
          // now that we have a new escape character defined we can modify the global variable for escapes. To further process the code as inteded by the author
          if (intendedDirectiveValue != this.escapeCharacter) {
            this.escapeCharacter = intendedDirectiveValue;
            console.log("Global Escape Character Modified");
          }
        }
      }
    }
  }

  hasChild(number) {
    // has child takes a line number and returns the index within this.lines of that lines child.
    // else it returns -1
    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].parent == number) {
        return i;
      }
    }
    return -1;
  }

  countType(type) {
    // countType takes a type of line matching langkind and returns how many times this type appears in all lines. Including itself.
    var totalTimes = 0;
    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].type == type) {
        totalTimes++;
      }
    }
    return totalTimes;
  }

  findCommentError(line) {
    // this will contain all methods of errors that could be found within a comment
    var commentWithParentObj = { id: 0, msg: "Line Continuation characters are not supported in Comments. So this comment that results from line continuation is not valid.",
                                  evidence: "", line: 0, remedy: "Combine the comment into a single line.", severity: "High", type: "Syntax" };

    var commentWithChildObj = { id: 0, msg: "Line Continuation characters are not supported in Comments. This comment has a line continuation character with a child comment that is not valid.",
                                evidence: "", line: 0, remedy: "Combine the comment into a single line.", severity: "High", type: "Syntax" };

    var commentLeadingWhitespaceObj = { id: 0, msg: "Leading whitespace before comments is ignored for backward compatibility, but discouraged.",
                                        evidence: "", line: 0, remedy: "Remove Leading Whitespace.", severity: "Low", type: "Style" };

    if (line.parent != 0) {
      // since having a parent means this comes after a line continuation

      // now to fill in the warning information.
      this.totalAlerts++;
      commentWithParentObj.id = this.totalAlerts;
      commentWithParentObj.evidence = line.value;
      commentWithParentObj.line = line.line;
      this.alerts.push(commentWithParentObj);
    }
    if (this.hasChild(line.line) != -1) {
      // since comments again don't support continuation characters we can see if this comment has a child object
      this.totalAlerts++;
      commentWithChildObj.id = this.totalAlerts;
      commentWithChildObj.evidence = line.value + " :: " + this.lines[this.hasChild(line.line)].value;
      commentWithChildObj.line = line.line;
      this.alerts.push(commentWithChildObj);
    }
    if (line.value.match(/^\s+[#]/)) {
      this.totalAlerts++;
      commentLeadingWhitespaceObj.id = this.totalAlerts;
      commentLeadingWhitespaceObj.evidence = line.value;
      commentLeadingWhitespaceObj.line = line.line;
      this.alerts.push(commentLeadingWhitespaceObj);
    }
  }

  findParserError(line) {
    // since a single line can offend more than one rule, these will be changed from else if to all ifs
    var notAtStartObj = { id: 0, msg: "Parser Directives must be at the start of a Dockerfile to be processed.",
                          evidence: "", line: 0, remedy: "Place Parser Directive at very start of Dockerfile.", severity: "High", type: "Syntax" };
    var parserWithParentObj = { id: 0, msg: "Line Continuation Characters are not supported in Parser Directives.",
                                evidence: "", line: 0, remedy: "Combine into a single line.", severity: "High", type: "Syntax" };

    var parserWithChildObj = { id: 0, msg: "Line Continuation Characters are not supported in Parser Directives.",
                                evidence: "", line: 0, remedy: "Combine into a single line.", severity: "High", type: "Syntax" };

    var parserDuplicates = { id: 0, msg: "Only one Parser Directive is supported in a Dockerfile. After the first is processed all others are ignored",
                              evidence: "", line: 0, remedy: "Remove extra directive, and keep only the one needed.", severity: "Medium", type: "Syntax" };
    var unknownDirective = { id: 0, msg: "Unrecognized Parser Directive.", evidence: "", line: 0,
                              remedy: "Determine if this is a misspelling or error.", severity: "Medium", type: "Syntax" };

    if (line.line != 1) {
      this.totalAlerts++;
      notAtStartObj.id = this.totalAlerts;
      notAtStartObj.evidence = line.value;
      notAtStartObj.line = line.line;
      this.alerts.push(notAtStartObj);
    }
    if (line.parent != 0) {
      // line continuation characters not supported in parser directives
      this.totalAlerts++;
      parserWithParentObj.id = this.totalAlerts;
      parserWithParentObj.evidence = line.value;
      parserWithParentObj.line = line.line;
      this.alerts.push(parserWithParentObj);
    }
    if (this.hasChild(line.line) != -1) {
      // line continuation characters not supported in parser directives
      this.totalAlerts++;
      parserWithChildObj.id = this.totalAlerts;
      parserWithChildObj.evidence = line.value + " :: " + this.lines[this.hasChild(line.line)].value;
      parserWithChildObj.line = line.line;
      this.alerts.push(parserWithChildObj);
    }
    if (this.countType(line.type) > 1 && line.line != 1) {
      // only one parser directive is supported.
      // but this will only raise an error when it is not the first line, in case one is already valid
      this.totalAlerts++;
      parserDuplicates.id = this.totalAlerts;
      parserDuplicates.evidence = line.value;
      parserDuplicates.line = line.line;
      this.alerts.push(parserDuplicates);
    }

    // now time to check the correct syntax of the directive
    var directiveString = line.value.match(/[#]\s*\S*\s*[=]/);
    // Now if somehow a line was classified as a parser but didn't have this valid match we should catch it
    if (directiveString) {
      var directiveString = directiveString[0].replace("#", "").replace("=", "").trim().toLowerCase();
      // with this returns just the text of the parser directive lowercase, no whitespace, without # or =
      if (directiveString != "syntax" || directiveString != "escape") {
        this.totalAlerts++;
        unknownDirective.id = this.totalAlerts;
        unknownDirective.evidence = line.value;
        unknownDirective.line = line.line;
        this.alerts.push(unknownDirective);
      }
    } else {
      // we weren't able to find the proper grammer in this parser directive
      this.totalAlerts++;
      unknownDirective.id = this.totalAlerts;
      unknownDirective.evidence = line.value;
      unknownDirective.line = line.line;
      this.alerts.push(unknownDirective);
    }
  }

}

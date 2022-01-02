const fs = require('fs');

function lint(fileDir) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileDir, "utf8", function(err, data) {
      if (!err) {
        var returnData = [];

        for (const ch of data) {
          linterChar(ch)
            .then(chRes => {
          //  console.log(`Lint: ${ch}, ${ch.charCodeAt()}, ${chRes}`);
              var tmp = { value: ch, kind: chRes };
              returnData.push(tmp);
            });

        //var linterCh = linterChar(ch);
        //console.log(`Lint: ${ch}, ${ch.charCodeAt()}, ${linterCh}`);
        }
        resolve(returnData);
      } else {
        console.log(err);
      }
    });
  });
}

module.exports = lint;

var unicodeValue = [
  {
    "code": 0,
    "id": "NULL"
  },
  {
    "code": 9,
    "id": "TAB"
  },
  {
    "code": 10,
    "id": "NEW_LINE"
  },
  {
    "code": 13,
    "id": "CARRIAGE_RETURN"
  },
  {
    "code": 32,
    "id": "SPACE"
  },
  {
    "code": 33,
    "id": "EXCLAMATION_MARK"
  },
  {
    "code": 34,
    "id": "QUOTE"
  },
  {
    "code": 35,
    "id": "NUMBER_SIGN"
  },
  {
    "code": 36,
    "id": "DOLLAR_SIGN"
  },
  {
    "code": 37,
    "id": "PERCENT_SIGN"
  },
  {
    "code": 38,
    "id": "AMPERSAND"
  },
  {
    "code": 39,
    "id": "APOSTROPHE"
  },
  {
    "code": 40,
    "id": "OPEN_PARENTHESIS"
  },
  {
    "code": 41,
    "id": "CLOSE_PARENTHESIS"
  },
  {
    "code": 42,
    "id": "ASTERISK"
  },
  {
    "code": 43,
    "id": "PLUS"
  },
  {
    "code": 44,
    "id": "COMMA"
  },
  {
    "code": 45,
    "id": "HYPHEN"
  },
  {
    "code": 46,
    "id": "PERIOD"
  },
  {
    "code": 47,
    "id": "SOLIDUS"
  },
  {
    "code": [ 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
    "id": "INTEGER"
  },
  {
    "code": 58,
    "id": "COLON"
  },
  {
    "code": 59,
    "id": "SEMICOLON"
  },
  {
    "code": 60,
    "id": "LESS_THAN"
  },
  {
    "code": 61,
    "id": "EQUALS"
  },
  {
    "code": 62,
    "id": "GREATER_THAN"
  },
  {
    "code": 63,
    "id": "QUESTION_MARK"
  },
  {
    "code": 64,
    "id": "AT"
  },
  {
    "code": [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122],
    "id": "TEXT"
  },
  {
    "code": 91,
    "id": "LEFT_SQUARE_BRACKET"
  },
  {
    "code": 92,
    "id": "REVERSE_SOLIDUS"
  },
  {
    "code": 93,
    "id": "RIGHT_SQUARE_BRACKET"
  },
  {
    "code": 94,
    "id": "CIRCUMFLEX_ACCENT"
  },
  {
    "code": 95,
    "id": "LOW_LINE"
  },
  {
    "code": 96,
    "id": "GRAVE_ACCENT"
  }
];

// linterChar Takes in the raw single character, looks at its code and returns a proper lint Identifier
function linterChar(char) {
  return new Promise(function (resolve, reject) {
    var code = char.charCodeAt();
    unicodeValue.forEach((element, index) => {
      if (Array.isArray(element.code)) {
        // To support code declarations of arrays for items that don't need individual values assigned this shoudl work.
        var pos = element.code.indexOf(code);
        if (pos != -1) {
          resolve(element.id);
        }
      } else {
        if (element.code == code) {
          resolve(element.id);
        }
      }
      if (index == unicodeValue.length -1) {
        resolve("UNKOWN");
      }
    });
  });
}

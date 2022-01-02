module.exports = class TokenConst {
  constructor(value, kind, langkind) {
    this.value = value;
    this.kind = kind;
    this.langkind = langkind;
  }

  getAll() {
    console.log(`Value: ${this.value}; Kind: ${this.kind}; Language Kind: ${this.langkind}`);
  }
}

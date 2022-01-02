#! /usr/bin/env node

const { program } = require('commander')

const lint = require('./commands/lint');

program
  .command('lint')
  .argument('[filedir]', 'File to Read')
  .description('Only Lint the specified File')
  .action(filedir => { lint(filedir); })

program.parse();

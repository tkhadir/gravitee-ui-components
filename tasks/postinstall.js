const del = require('del');
const fs = require('fs-extra');

async function run () {
  await del([
    'node_modules/codemirror/mode/rpm/changes',
    'assets/css/github-markdown-css',
    'assets/css/highlight.js',
  ]);

  fs.copy('node_modules/github-markdown-css/github-markdown.css', 'assets/css/github-markdown-css/github-markdown.css');
  fs.copy('node_modules/highlight.js/styles/github-gist.css', 'assets/css/highlight.js/github-gist.css');
}

run().catch(console.error);

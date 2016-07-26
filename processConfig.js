"use strict";

var fs = require('fs');
var path = require('path');

const context = 'src';

const walk = dir => {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results = results.concat([file]);
    }
  });
  return results;
};

module.exports = function(config) {
  var demosStaticFolder = './.demos-static';
  var finalConfig = {};
  var p;
  for (p in config) if (config.hasOwnProperty(p)) finalConfig[p] = config[p];
  finalConfig.entry = {};
  walk(config.context).filter(p => /__demo__.*\.jsx?/.test(p)).forEach(p => {
    var hash = p.split('').map(c => c.charCodeAt(0)).reduce((c, h) => ((h << 5) - h) + c).toString(16);
    finalConfig.entry[path.basename(p) + hash] = [p];
  });

  try {
    fs.accessSync(demosStaticFolder, fs.F_OK);
  } catch (e) {
    fs.mkdirSync(demosStaticFolder);
  }

  fs.writeFileSync(demosStaticFolder + '/index.html', `
  <!DOCTYPE html>
  <html lang="en"><head><meta charset="UTF-8"></head><body>
  ${Object.keys(finalConfig.entry).map(entryName => `<a href="${entryName}.html">${entryName}</a>`)}
  </body></html>
  `);

  for (p in finalConfig.entry) if (finalConfig.entry.hasOwnProperty(p)) {
    fs.writeFileSync(`${demosStaticFolder}/${p}.html` , `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="/dist/${p}.bundle.css"/>
    </head>
    <body>
        <div id="root"></div>
        <script src="/dist/${p}.bundle.js"></script>
    </body>
    </html>
    `);
  };

  finalConfig.devServer = finalConfig.devServer || {};
  finalConfig.devServer.contentBase = demosStaticFolder;
  return finalConfig;
};

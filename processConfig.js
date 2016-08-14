"use strict";

var fs = require('fs');
var path = require('path');

const context = '.';

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
  walk(context)
    .filter(p => p.indexOf(demosStaticFolder) === -1 && /__demo__.*\.jsx?$/.test(p))
    .forEach(p => {
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
  <style>
    a { display: block; color: #397DC0; padding: 5px 20px; border-bottom: 1px solid #eee; text-decoration: none; font: 15px/20px normal -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"}
    a: hover { color: #3A91D8 }
  </style>
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
  finalConfig.devServer.test = 1;
  return finalConfig;
};

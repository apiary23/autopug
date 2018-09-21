'use strict';

const fs = require('fs'),
    path = require('path'),
    pug = require('pug'),
    chokidar = require('chokidar'),
    args = require('minimist')(process.argv, {
        alias: {
            s: 'srcDir',
            d: 'destDir',
            o: 'overwrite'
        },
        default: {
            srcDir: null,
            destDir: null,
            overwrite: false
        }
    });

const log = function (str) {
    console.log(`\x1b[36m[autopug]\x1b[0m ${str}`);
};
const warn = function (str) {
    console.log(`\x1b[93m[autopug]\x1b[0m ${str}`);
};

let src = args.srcDir,
    dest = args.destDir;

if (!src) {
    const list = fs.readdirSync('./');
    if (!list.some(n => n === 'autopug')) {
        warn('./autopug not found; creating');
        fs.mkdir('autopug');
    }
    src = './autopug';
}
if (!dest) {
    dest = './';
}

const normalize = path.sep === '\\'
    ? path.normalize.bind(path)
    : path.win32.normalize.bind(path.win32);
const pugFiles = path.posix.normalize(`${src}**/*.pug`);
src = normalize(src);
dest = normalize(dest);

warn(pugFiles);

log(`${src} Pug -> ${dest} HTML`);

const watcher = chokidar.watch(pugFiles);
watcher.on('change', (path, stats) => {
    log(`path: ${path}`);
    const outputDest = path.replace(src, '').replace('pug', 'html');
    log(`output to: ${dest}/${outputDest}`);
});
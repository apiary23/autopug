#!/usr/bin/env node

'use strict';

const fs = require('fs-extra'),
    path = require('path'),
    pug = require('pug'),
    chokidar = require('chokidar'),
    args = require('minimist')(process.argv, {
        alias: {
            s: 'srcDir',
            d: 'destDir',
            p: 'pretty',
            t: 'delay'
        },
        default: {
            srcDir: null,
            destDir: null,
            pretty: true,
            delay: 0
        }
    });

// Logging
const log = function (str) {
    console.log(`\x1b[36m[autopug]\x1b[0m ${str}`);
};
const warn = function (str) {
    console.log(`\x1b[93m[autopug]\x1b[0m ${str}`);
};

// shorthand
let srcDir = args.srcDir,
    destDir = args.destDir;


if (!srcDir) { // default to ./autopug for source and ./ for destination
    // const list = fs.readdirSync('./');
    // if (!list.some(n => n === 'autopug')) {
    //     warn('./autopug not found; creating');
    // }
    srcDir = './autopug';
}
if (!destDir) {
    destDir = './';
}

fs.ensureDir(srcDir);

// normalize between posix/win32 paths
const normalize = path.sep !== '\\'
    ? path.normalize.bind(path)
    : path.win32.normalize.bind(path.win32);
const pugFolder = path.posix.normalize(`${srcDir}**/*.pug`); // chokidar expects a posix-y glob
srcDir = normalize(srcDir);
destDir = normalize(destDir);

log(`Watching: ${srcDir} Pug -> ${destDir} HTML`);

let delayed = false;

const watcher = chokidar.watch(pugFolder);
watcher.on('change', async (filePath) => {
    if (delayed) { return; } // skip write if delay is set

    const outputDest = filePath.replace(srcDir, '').replace('pug', 'html');
    let html;
    try {
        while (!html) { // accommodate for editors that appear to double-modify a file during write
            html = pug.renderFile(filePath, { pretty: args.pretty });
        }
    } catch (e) { // invalid Pug
        warn(`WARNING: file ${filePath} contains invalid pug; not compiling`);
        warn(`${e.message}`);
        return;
    }
    const outName = `${path.join(destDir, outputDest)}`;
    fs.outputFile(outName, html, { encoding: 'utf-8' });
    if (typeof args.delay === 'number' && args.delay) {
        delayed = true;
        setTimeout(() => {
            delayed = false;
        }, args.delay);
    }
    log(`output to: ${outName}`);
});
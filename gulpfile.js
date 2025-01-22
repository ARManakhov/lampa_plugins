process.on('uncaughtException', function (err) {
    console.log(err)
});

const gulp = require('gulp');
const fs = require('fs');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const rollup = require('@rollup/stream');

const babel = require('@rollup/plugin-babel').babel;
const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve');


const dstFolder = './dest/';
const plgFolder = './plugins/';


function bubbleFile(name) {
    let plug = [babel({
        babelHelpers: 'bundled'
    }), commonjs, nodeResolve]

    rollup({
        input: plgFolder + name,
        plugins: plug,
        output: {
            format: 'iife',
        },
        onwarn: function () {
        }
    })
        .pipe(source(name))
        .pipe(buffer())
        .pipe(gulp.dest(dstFolder));
}

function plugins(done) {
    fs.readdirSync(plgFolder)
        .filter(function (file) {
            return fs.statSync(plgFolder + '/' + file).isDirectory();
        })
        .forEach(folder => {
            bubbleFile(folder + '/' + folder + '.js')
        });

    done();
}

gulp.task('build', plugins)
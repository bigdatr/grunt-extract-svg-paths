/*
 * grunt-extract-svg-path-data
 * Please answer the follow
 *
 * Copyright (c) 2014 Allan Hortle
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var SVGO = require('svgo');
    var svgo = new SVGO();
    var cheerio = require('cheerio');

    grunt.registerMultiTask('extract-svg-paths', 'Extracts pathdata from svgs', function() {
        
        var pathObj = {};

        this.files.forEach(function(f) {
            f.src.filter(function(filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                }
                return true;
            }).forEach(function(filepath) {
                var svgContent;
                var filename = filepath.match(/([^\/]+)(?=\.\w+$)/)[0];

                svgo.optimize(grunt.file.read(filepath), function(result) {
                    if (result.error) { return grunt.warn('Error parsing SVG: (' + filepath + ') ' + result.error); }
                    svgContent = result.data;
                });

                var $ = cheerio.load(svgContent);

                var pathArray = $('path').map(function() {
                    return this.attribs.d;
                }).get();

                pathObj[filename] = pathArray;
            });

            grunt.file.write(f.dest, JSON.stringify(pathObj));
            grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });

};

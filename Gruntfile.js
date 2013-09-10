module.exports = function (grunt) {

  var docsetPath = 'grails.docset/Contents';
  var docsetPathPlist = docsetPath + '/Info.plist';
  var docsetPathDB    = docsetPath + '/Resources/docSet.dsidx';
  var docsetPathDocs  = docsetPath + '/Resources/Documents/';
  // var srcPath = 'src/grails.org/';
  var srcPath = 'snapshots/';

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-html-snapshot');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-dom-munger');

  var config = {
    clean: [docsetPath + '/*'],
    copy: {
      meta: {
        src: 'template/Info.plist',
        dest: docsetPathPlist
      },
      docs: {
        files: [
          {expand: true, src: [srcPath+'/**'], dest: docsetPathDocs}, // includes files in path and its subdirs
          // {src: srcPath + 'style.css', dest: docsetPathDocs + 'style.css'},
          // {
          //   expand: true,
          //   src: srcPath + 'images/*',
          //   dest: docsetPathDocs + 'images/',
          //   flatten: true
          // }
        ]
      }
    },
    dom_munger: {
      api: {
        options: {
          remove: 'script, nav.clearfix, #menu',
          callback: function ($) {
            // Convert relative protocol links to explicit http
            $('link[href^="//"]').attr('href', function (i, oldHref) {
              return 'http:' + oldHref;
            });
          }
        },
        src: srcPath + 'single.html',
        dest: docsetPathDocs + 'single.html'
      }
    },
     htmlSnapshot: {
                all: {
                  options: {
                    //that's the path where the snapshots should be placed
                    //it's empty by default which means they will go into the directory
                    //where your Gruntfile.js is placed
                    snapshotPath: 'snapshots/',
                    //This should be either the base path to your index.html file
                    //or your base URL. Currently the task does not use it's own
                    //webserver. So if your site needs a webserver to be fully
                    //functional configure it here.
                    sitePath: 'http://grails.org/doc/2.2.2/guide/',
                    //you can choose a prefix for your snapshots
                    //by default it's 'snapshot_'
                    fileNamePrefix: 'sp_',
                    //by default the task waits 500ms before fetching the html.
                    //this is to give the page enough time to to assemble itself.
                    //if your page needs more time, tweak here.
                    msWaitForPages: 1000,
                    //if you would rather not keep the script tags in the html snapshots
                    //set `removeScripts` to true. It's false by default
                    removeScripts: true,
                    // allow to add a custom attribute to the body
                    bodyAttr: 'data-prerendered',
                    //here goes the list of all urls that should be fetched
                    urls: [
                      'single.html',
                    ]
                  }
                }
            }
  };

  grunt.initConfig(config);

  // Update submodule for grails.org site
  grunt.loadNpmTasks('grunt-update-submodules');
  grunt.registerTask('update', ['update_submodules']);

  // Build docset index
  grunt.registerTask('index', function () {
    var gruntDone = this.async();

    var cheerio = require('cheerio'),
      Sequelize = require('sequelize'),
      _ = require('underscore');
      fs = require('fs');

    var reEndParens = /\(\)$/;
    var idxGroups;

    // Read the API file and get out the links we want
    var apiHtml = fs.readFileSync(srcPath + 'single.html');
    var $ = cheerio.load(apiHtml);
    idxGroups = $('#menu > li').map(function () {
      var $li = $(this);
      // Any top-level links are groups
      var $link = $li.children('a');
      var group = {
        type: 'Guide',
        name: $link.text(),
        link: '#' + $link.text().toLowerCase(), // The links point to a method anchor, use the group anchor instead
        children: []
      };

      // Find all methods in this group
      group.children = _.flatten($li.find('ul > li').map(function () {
        var $link = $(this).children('a');
        var name = $link.text();
        var isMethod = reEndParens.test(name);
        var type = isMethod ? 'Function' : 'Property';
        if (isMethod) {
          name = name.replace(reEndParens, '');
        }
        return {
          type: type,
          name: name,
          link: $link.attr('href')
        };
      }));

      return group;
    });

    // Create database file
    // Most of this section copied from https://github.com/exlee/d3-dash-gen
    var db = new Sequelize('database', 'username', 'password', {
      dialect: 'sqlite',
      storage: docsetPathDB
    });

    // Create the searchIndex table
    var table = db.define('searchIndex', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.TEXT
      },
      path: {
        type: Sequelize.TEXT
      }
    }, {
      freezeTableName: true,
      timestamps: false
    });

    var errorHandler = function () {
      gruntDone(false);
    };

    table.sync({force: true}).success(function () {
      // Add the data
      var buildRowData = function (data) {
        return {
          name: data.name,
          type: data.type,
          path: 'single.html' + data.link
        };
      };

      var rows = _.flatten(_.map(idxGroups, function (group) {
        return [group].concat(group.children);
      }));

      table.bulkCreate(_.map(rows, buildRowData))
        .success(gruntDone)
        .error(errorHandler);

    }).error(errorHandler);
  });

  // Main task
  //grunt.registerTask('generate', ['update', 'copy:meta', 'copy:docs', 'dom_munger:api', 'index']);
  grunt.registerTask('generate', ['htmlSnapshot:all', 'copy:meta', 'copy:docs', 'dom_munger:api', 'index']);
  grunt.registerTask('default', ['generate']);

};

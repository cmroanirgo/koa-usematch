/**
 * @license MIT
 * Copyright (c) 2017 Craig Monro (cmroanirgo)
 **/

"use strict";

/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var usematch = require('usematch');
var debug = require('debug')('koa-usematch')

var l = debug;

// promisify a few funcs we need
"readdir,readFile".split(',').forEach(function(fn) {
	fs[fn+'P'] = Promise.promisify(fs[fn])
});

/**
 * default render options
 * @type {Object}
 */
var defaultSettings = {
	cache: true,
	viewExt: 'html',
	views: 'views',
	partials: 'partials'
};

/**
 * set app.context.render
 *
 * usage:
 * ```
 * var render = require('koa-usematch')({settings})
 * yield render('user', {name: 'John Doe'});
 * ```
 */
exports = module.exports = function (settings) {
	settings = extend({}, defaultSettings, settings)
	l('settings: %j', settings)

	settings.views = path.resolve(path.dirname(process.argv[1]), settings.views);
	l('views: ' + settings.views)
	settings.partials = path.resolve(path.dirname(process.argv[1]), settings.partials);
	l('partials: ' + settings.partials)

	var partials = undefined;

	/**
	* cache the generate package
	* @type {Object}
	*/
	var cache = {};
	settings.viewExt = settings.viewExt ? '.' + settings.viewExt.replace(/^\./, '') : '';

  /**
   * generate html with view name and context
   * @param {String} view
   * @param {Object} context
   * @return {String} html
   */
	function *render(view, context, settings) {
		view += settings.viewExt;
		var viewPath = path.join(settings.views, view);

		// get from cache
		var tokens;
		if (settings.cache && cache[viewPath]) {
			tokens = cache[viewPath];
		}

		if (!tokens) {
		    var tpl = yield fs.readFileP(viewPath, 'utf8');
		    var tokens = usematch.parse(tpl, settings);
		    l('parsed: ' + viewPath)

		    if (settings.cache) {
		    	cache[viewPath] = tokens;
		    }
		}

		l('render: ' + viewPath)
		return usematch.render(tokens, context, settings);
	}

	function *loaddir(dir) {
		var ret = {};
    	try {
    		var list = yield fs.readdirP(dir);
    		for(var i=0; i<list.length; i++) {
    			var name = list[i];
    			var ext = path.extname(name);
	    		
    			if (ext==settings.viewExt) {
    				try  {
    					var tpl = yield fs.readFileP(path.join(dir, name), 'utf8');
    					ret[path.basename(name, ext)+''] = usematch.parse(tpl, settings);
						l('loaded partial: ' + path.basename(name, ext))
    				}
    				catch(e2) {
						l('partial error: %j' + e2)
    				}
    			}
    		}
    	}
    	catch(e) {
			l('partials error: %j' + e)
    	}
    	return ret;

	}

	return function *(view, context) {
	    
	    // load the partials, the first time
	    if (!partials) {
	    	l('loading partials')
	    	partials = yield loaddir(settings.partials);
	    	settings.partials = partials;
	    }
	    var html = yield *render(view, context||{}, settings);

	/*
	    var layout = context.layout === false ? false : (context.layout || settings.layout);
	    if (layout) {
			// if using layout
			context.body = html;
			html = yield *render(layout, context);
	    }
	*/
		return html;
  	}
}


/**
 * merge source to target
 *
 * @param {Object} target
 * @param {Object} source1
 * @param {Object} source2, ...
 * @return {Object}
 * @api private
 */
function extend(origin) {
	for (var a=1; a<arguments.length; a++) {
		var add = arguments[a];
		if (add === null || typeof add !== 'object')
			continue;

		var keys = Object.keys(add)
		var i = keys.length
		while (i--) {
			origin[keys[i]] = add[keys[i]]
		}
	}

	return origin
}

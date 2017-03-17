# koa-usematch

This provides middleware for koa to use the [usematch templating engine](https://www.npmjs.com/package/usematch).

## Installation

In your existing koa folder:

```
npm install koa-usematch
```

## Usage

```
var options = {
	views: path.join(__dirname, 'views'),
	partials: path.join(__dirname, 'partials'),
	defaults: { ... default fields here ...}
}
var render = require('koa-usematch')( options );

router.get('/', function *(next) {
	var data = { title: "Home", ... }
	this.body = yield render('home', data);
});
```

Where options can contain any [usematch option](https://github.com/cmroanirgo/usematch#usematch-api), including:

```
var defaultSettings = {
	cache: true,					// whether views and partials are cached. For a server this should probably be enabled
	viewExt: 'html',				// views and partials all end with this extension
	views: '/path/to/views',		// the path to the 'views' folder for an MVC style implementation
	partials: '/path/to/partials'	// the path to any 'partials' (also uses viewExt setting)
};
```






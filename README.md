# koa-usematch

This provides middleware for koa to use the usematch templating engine.

## Installation

In your existing koa folder:

```
npm install koa-usematch
```

## Usage

```
var options = {
	
}
var render = require('koa-usematch')( ));

router.get('/', function *(next) {
	var data = { title: "Home", ... }
	this.body = yield render('home', data);
});
```

Where options can contain any usematch option, including:

```
var defaultSettings = {
	cache: true,			// whether views and partials are cached. For a server this should probably be enabled
	viewExt: 'html',	
	views: 'views',			// the relative path to 'views' folder for an MVC style implementation
	partials: 'partials'	// the relative path to any 'partials'
};
```






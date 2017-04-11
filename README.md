# q & dq [![Build Status](https://travis-ci.org/redoPop/dq.svg?branch=master)](https://travis-ci.org/redoPop/dq)

Inline JS is handy for selectively calling external modules and passing data from the page:

```html
<script>myModule.init({ modelId: 42, modelName: 'Ford Prefect' })</script>
```

This approach can't be used with asynchronously loaded modules because the browser could encounter the inline script before the module has loaded.

**q & dq is a tiny pattern and library that solves this problem by _queuing_ inline JS until external scripts are ready:**

```html
<script>q('myModule.init', { modelId: 42, modelName: 'Ford Prefect' })</script>
```

dq can be used with any asynchronous script loading method.

## Installation

q & dq is available via NPM:

```
npm install --save qdq
```

It's also available on Bower:

```
bower install --save qdq
```

You can also copy source directly from `src/dq.js` in this repo.

## Using q & dq

Add this to your `<head>`, in front of any other script tags:

```html
<script>_q=[];q=function(){_q.push(arguments)};</script>
```

This creates a `q` function, which can be used throughout the rest of the page to queue your external JS calls.

`q`'s first parameter is the name of your function or module method reference as a string. Any arguments after that will be passed directly to the queued method.

For example, if you had a method that you'd normally call like this:

```html
<script>
  fancifier.fancify('wibbly-wobbly', { id: 42, name: 'Ford Prefect' })
</script>
```

…you would instead _queue_ it like this:

```html
<script>
  q('fancifier.fancify', 'wibbly-wobbly', { id: 42, name: 'Ford Prefect' })
</script>
```

`dq` itself – the JS library provided by this repo – should be added to your external JS. Within your external JS, you must process all the queued scripts by calling dq:

```javascript
dq();
```

### Use with AMD & RequireJS

`dq` is AMD-friendly and defines itself as an anonymous AMD module if AMD support is detected.

To use dq with RequireJS, declare your queue in the `<head>` _before_ you load RequireJS:

```html
<script>_q=[];q=function(){_q.push(arguments)};</script>
<script async data-main="whatever" src="require.js"></script>
```

You can then start queuing up module/method calls inline:

```html
<script>q('someModule.someMethod', 'arg1', 'arg2', 'arg3')</script>
```

Since AMD modules aren't part of the global scope, you need to pass them in using the `modules` option when you call dq:

```javascript
define(['dq', 'amd/module'], function (dq, loadedModule) {
  dq({
    modules: { someModule: loadedModule }
  });
});
```

## Advanced use

There are a number of options you can set with your dq call:

```javascript
dq({

  /**
  Set a custom queue array if you want to use something
  other than _q, or if you want to use more than one queue
  on the same page:
  */
  q: queueArray,

  /**
  If you're using AMD or another method of avoiding the
  global scope, you'll need to pass dq a modules object
  that pairs module references with the actual modules:
  */
  modules: {
    module: module
  },

  /**
  You can create your own custom callback for processing
  your queue. For each queued item, the callback is called
  with the following parameters:

  * functionCallArray - the queue item array (in which the
    the first element is the function reference and
    subsequent elements are arguments).
  * dqOptionsObject - a copy of the options object, useful
    for referencing the modules object and other options.
  */
  callback: function (functionCallArray, dqOptionsObject) {
    // ...
  }

});
```

## License

[MIT](LICENSE)

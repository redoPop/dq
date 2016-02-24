# q & dq

If you want to do this:

	<script async data-main="whatever" src="require.js"></script>

...and also this:

	<script>require('some').method('and call it inline!')</script>

...dq can help you. It's a tiny script for managing dependency queues
with whatever asynchronous script loading method you choose.

## Basic use (pure JS)

Add this to your head, in front of any other script tags:

	<script>_q=[];q=function(){_q.push(arguments)};</script>

Throughout your HTML, add inline initializers to your queue like this:

	<script>q('module.method', 'arg1', 'arg2', 'arg3')</script>

...where you would normally `module.method('arg1', 'arg2', 'arg3')`

Inside your asynchronously loaded script, once you're sure all the
dependencies have loaded, process your inline queue by calling dq:

	dq();

## RequireJS use

dq is AMD friendly and defines itself as an anonymous module if AMD
support is detected.

To use dq with RequireJS, declare your queue in the head _before_
you load require.js:

	<script>_q=[];q=function(){_q.push(arguments)};</script>
	<script async data-main="whatever" src="require.js"></script>

You can then start queuing up module/method calls inline:

	<script>q('someModule.someMethod', 'arg1', 'arg2', 'arg3')</script>

Since AMD modules aren't part of the global scope, you need to pass
them in using the `modules` option when you call dq:

	define(['dq', 'amd/module'], function (dq, loadedModule) {
		dq({
			modules: { someModule: loadedModule }
		});
	});

## Advanced use

There are a number of options you can set with your dq call:

	dq({
		// Set a custom queue array if you want to use something
		// other than _q, or if you want to use more than one queue
		// on the same page:
		q: queueArray,

		// If you're using AMD or another method of avoiding the
		// global scope, you'll need to pass dq a modules object
		// that pairs module references with the actual modules:
		modules: {
			module: module
		},

		// You can create your own custom callback for processing
		// your queue. For each queued item, the callback is called
		// with the following parameters:
		// * functionCallArray - the queue item array (in which the
		//   the first element is the function reference and
		//   subsequent elements are arguments).
		// * dqOptionsObject - a copy of the options object, useful
		//   for referencing the modules object and other options.
		callback: function (functionCallArray, dqOptionsObject) {
			// ...
		}
	});

# Dispatcher

Inline initializers are good. Inline logic is bad.

Dispatcher is a tiny front-end JavaScript trick that can be paired with non-blocking script loading techniques to make terse inline initializers that don't tempt you to slip into bad inline scripting habits.

There's no room for naughtiness in your HTML script tags if your inline initializers are as tight as this:

	<script>pool.add("mySite.initSlideshow")</script>

***

## Documentation Contents

* [Example](#example)
* [Dispatcher "vs" LABjs?](#vslabjs)
* [Dispatcher API](#api)
	* [dispatcher()](#api-dispatcher)
	* [dispatcherObject.add()](#api-add)
	* [dispatcherObject.dispatch()](#api-dispatch)
* [Download](#download)
* [License](#license)

***

<a id="example"></a>

## Example

An example showing how to use dispatcher with [LABjs](http://labjs.com/) is included with this repository: [examples/slideshow.html](http://github.com/jdbartlett/dispatcher/blob/master/examples/slideshow.html). The code in that example is explained below.

After loading LABjs and dispatcher (the two are concatenated into one file), a new dispatcher object is created called `pool`:

	var pool = dispatcher();

Then a LABjs chain is created, with `pool.dispatch` added as a `wait` callback:

	$LAB
		.script("js/libs.js")
		.script("js/mysite.js").wait(pool.dispatch)
		.script("js/analytics.js");

Initializer methods can now be queued inside `pool`. In the example, a slideshow appears on the page, and its initializer -- sensibly named `mySite.initSlideshow` -- is added to the dispatcher object after the slideshow's HTML container:

	<div id="slideshow"></div>
	<script>pool.add("mySite.initSlideshow")</script>

Once mysite.js is loaded, `pool` is dispatched by LABjs and the `mySite.initSlideshow` method is called along with any other pooled initializers.

When applicable, arguments can be sent to initializer methods by including them after the method reference in the dispatcher object's add call. For example:

	<script>pool.add("mySite.initSlideshow", "Slide 1", "Slide 2")</script>

When the dispatcher object is dispatched, the above would become the equivalent of:

	mySite.initSlideshow("Slide 1", "Slide 2");

***

<a id="vslabjs"></a>

## Dispatcher _"vs"_ LABjs?

With LABjs, function callbacks are normally queued using $LAB.wait, which may make dispatcher seem redundant to some. Without dispatcher, I might name my LABjs chain in the page head, like this:

	var chain = $LAB
		.script("js/lib.js")
		.script("js/mysite.js")
		.script("js/analytics.js");

...and then write inline initializers like this:

	<script>
	chain.wait(function () {
		mySite.initSlideshow();
	});
	</script>

Dispatcher complements LABjs to provide some distinct advantages:

* Dispatcher's inline initializers are more terse.
* Dispatcher doesn't use function callbacks, which means there's no temptation to start coding inline. It enforces the rule that script tags should be used for direct method initialization only!
* Without splitting the LABjs chain (which can make complex dependencies awkward), the inline initializer in the above example won't fire until both mysite.js and slow.js are ready. With dispatcher, it's easier to fine-tune queues inside a single LABjs chain.

The temptation to abuse function callbacks for general inline scripting is what prompted me to write dispatcher in the first place. This is particularly a problem during maintenance, when it's tempting to sneak code inline rather than writing it in an external resource file and re-running build scripts.

***

<a id="api"></a>

## Dispatcher API

Calling the `dispatcher` method returns a new dispatcher object. A dispatcher object has two methods: add (to collect method references), and dispatch (to parse and call the collected references).

***

<a id="api-dispatcher"></a>

**dispatcher**( [ _object_ **contextObject** ] )

`dispatcher` is a factory method that returns a new dispatcher object.

> Example 1:
>
	dispatcherObject = dispatcher();

The dispatcher method accepts one optional argument: a context object, which will be used as the root for any method references added to the dispatch pool:

> Example 2:
>
	var cat = {};
	dispatcherObject = dispatcher(cat);
	...
	dispatcherObject.add("meow");
	...
	cat.meow = function () { ... };

In the above example, the `cat` object is provided for use as the dispatcher's context. The subsequent `dispatcherObject.add("meow")` would be equivalent to `dispatcherObject.add("cat.meow")` if no context object were provided.

The custom context object must be declared ad the time `dispatch` is called, but the methods themselves can come later. In Example 2, the `cat.meow` method is declared after the "meow" reference is added to the dispatch pool.

If no custom context object is provided, the default "global" object (`window` except in obscure cases) will be used for context instead.

***

<a id="api-add"></a>

dispatcherObject.**add**( _string_ **reference**, [ _argument_, ... ] )

A dispatcher object's `add` method adds a method reference to your dispatch pool.

The primary parameter ("reference") should be your method reference: a string, period-delimited when describing object-property relationships. e.g., "object.childObject.methodName" just like you'd normally call `object.childObject.methodName()`.

Any subsequent parameters (optional) will be applied to the method as arguments during dispatch.

> Example 1:
>
	dispatcherObject.add("cat.meow", "I am a cat.");

Adding a method to the dispatcher object after its dispatch method has been called will result in immediate parsing and execution of the referenced method.

***

<a id="api-dispatch"></a>

dispatcherObject.**dispatch**( _none_ )

A dispatcher object's `dispatch` method calls all the methods you've pooled, in the same order their references were added. You should call the dispatch method once you're sure all the methods have been made available.

***

<a id="download"></a>

# Download

The only file you need to use dispatcher is [dispatcher.js](http://github.com/jdbartlett/dispatcher/blob/master/dispatcher.js) included in the root of this repository.

An unminified version [dispatcher.src.js](http://github.com/jdbartlett/dispatcher/blob/master/dispatcher.src.js) is also available, along with Jasmine specs found in the [spec/javascripts](http://github.com/jdbartlett/dispatcher/blob/master/spec/javascripts/dispatcherSpec.js) folder.

***

<a id="license"></a>

# License

This script is completely, totally, and utterly free. It comes without any warranty, to the extent permitted by applicable law. You can redistribute it and/or modify it under the terms of the Do What The Fuck You Want To Public License, Version 2, as published by Sam Hocevar. See [here](http://sam.zoy.org/wtfpl/COPYING) for more details.
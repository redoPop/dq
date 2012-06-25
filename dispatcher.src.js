/*! dispatcher 1.0 | http://github.com/jdbartlett/dispatcher | License: WTFPL */

/*
 * Dispatcher is a tiny front-end JavaScript trick that
 * can be paired with non-blocking script loading
 * techniques to make terse inline initializers that
 * don't tempt you to slip into bad inline scripting
 * habits.
 * 
 * Impractical illustrative example:
 * 
 * 1. First the dispatcher is created:
 * var pool = dispatcher();
 * 
 * 2. Then the "cat.meow" call is added to it:
 * pool.add("cat.meow");
 * 
 * 3. Some time later, the cat.meow method is declared:
 * var cat = { meow: function () { alert("Meow."); } };
 * 
 * 4. ...after which, the pool is dispatched:
 * pool.dispatch();
 * 
 * Need more info? Check out github.com/jdbartlett/dispatcher
 */
var dispatcher = (function () {
	"use strict";

	// Scope the global object for later use
	var global = this;

	// Get property of context object by a string reference
	function getProperty(reference, context) {
		var i, property, refinements;

		refinements = reference.split(".").reverse();
		i = refinements.length;
		property = context;

		// Loop through the split reference to refine...
		while (i) {
			i -= 1;
			property = property[refinements[i]];
		}

		return property;
	}

	// Internal method to process method references
	function callReference(reference, context, args) {
		var method = reference;

		method = getProperty(reference, context);

		// Make sure the method is a function
		if (!method || !method.apply) {
			throw "No such method: " + reference;
		}

		method.apply(context, args);
	};

	return function (context) {
		var dispatched = false,
			dispatcher = {},
			pool = [];

		// If a context object wasn't provided, use the global object
		context = context || global;

		// Add a new reference to the dispatch pool
		dispatcher.add = function (reference) {
			var args;

			// Reference must be a string
			if (!reference.match) {
				throw "Not a string: " + reference;
			}

			// Grab an array of all the other arguments
			args = Array.prototype.slice.call(arguments, 1);

			// Has the dispatch method been called?
			if (dispatched) {

				// Process the method reference immediately
				callReference(reference, context, args);
			} else {

				// Add this reference and its arguments to the pool
				pool.push({
					ref: reference,
					args: args
				});
			}
		};

		// Processes all the string references in the dispatch pool
		dispatcher.dispatch = function () {
			var i, poolLength = pool.length;

			// Make sure we only dispatch references once
			if (dispatched) {
				return;
			}

			// We have now dispatched all references
			dispatched = true;

			// Loop through the reference pool...
			for (i = 0; i < poolLength; i += 1) {

				// Attempt to call the referenced method
				callReference(pool[i].ref, context, pool[i].args);
			}
		};

		// Return the dispatcher object
		return dispatcher;
	};
}());

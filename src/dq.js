/*! dq 2.0 | github.com/jdbartlett/dq | License: WTFPL */

(function () {
  var global = this,
      globalName = 'dq',
      defaultQ = '_q',
      modelArray = [];

  // Convenience wrapper for throwing errors
  function throwError(message) {
    throw new Error(message);
  }

  // Splits reference string by period delimiter and traverses
  // context object for a chain that matches the resultant array.
  // Returns an object with two properties:
  // {
  //   p: the referenced property
  //   c: p's parent context (useful for call/apply scenarios)
  // }
  //
  // e.g.:
  //   getProperty('foo.bar.baz', {foo: {bar: baz: 'hello'}})
  //   => {p: 'hello', c: {baz: 'hello'}}
  //
  // Adapted from my original gist here:
  // http://gist.github.com/jdbartlett/1018008
  function processReference(reference, context) {
    var refinements = reference.split('.').reverse(),
        i = refinements.length,
        property = context;

    // Reset the context return value
    context = null;

    // Loop through the split reference to refine...
    while (i && property) {
      i -= 1;

      context = property;
      property = property[refinements[i]];
    }

    return property ? {
      p: property,
      c: context
    } : false;
  }

  // Internal method to process method references
  function callReference(referenceString, contexts, args) {
    var context, referenceObject;

    var i = contexts.length;
    while (i-- && !referenceObject) {
      context = contexts[i];
      referenceObject = processReference(referenceString, context);
    }

    // Make sure referenceObject.p is a function
    if (!referenceObject || !referenceObject.p.apply) {
      throwError('No such method: ' + referenceString);
    }

    referenceObject.p.apply(referenceObject.c, args);
  }

  function defaultCallback(functionCall, options) {
    callReference(functionCall[0], [global, options.modules], functionCall.slice(1));
  }

  // Convert arguments object to an array
  function arrayify(value) {
    return modelArray.slice.apply(value);
  }

  function dequeueLoop(queue, options) {
    for (var i = -1, queueLength = queue.length; ++i < queueLength;) {
      options.callback(arrayify(queue[i]), options);
    }
  }

  function dequeue(options) {
    if (!options) {
      options = {};
    }

    options.q = options.q || defaultQ;

    if (typeof options.q === 'string') {
      options.q = global[options.q];
    }

    options.callback = options.callback || defaultCallback;
    options.modules = options.modules || [];

    // Loop through the queue
    dequeueLoop(options.q, options);

    // Overwrite the original push method for this queue array
    options.q.push = function () {
      dequeueLoop(arrayify(arguments), options);
    };
  }

  // UMD (based on returnExports.js template)
  // https://github.com/umdjs/umd
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return dequeue;
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = dequeue;
  } else {
    global[globalName] = dequeue;
  }
}());

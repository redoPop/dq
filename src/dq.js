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

  // Get property of context object by a string reference
  // http://gist.github.com/jdbartlett/1018008
  function getProperty(reference, context) {
    var refinements = reference.split('.').reverse(),
        i = refinements.length,
        property = context;

    // Loop through the split reference to refine...
    while (i && property) {
      i -= 1;
      property = property[refinements[i]];
    }

    return property;
  }

  // Internal method to process method references
  function callReference(reference, contexts, args) {
    var context, method;

    var i = contexts.length;
    while (i-- && !method) {
      context = contexts[i];
      method = getProperty(reference, context);
    }

    // Make sure the method is a function
    if (!method || !method.apply) {
      throwError('No such method: ' + reference);
    }

    method.apply(context, args);
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

  // Wrapper for AMD friendliness
  if (typeof define === 'function' && define.amd) {
    // Register as an anonymous module
    define(/* globalName, */function () {
      return dequeue;
    });
  } else {
    global[globalName] = dequeue;
  }
}());

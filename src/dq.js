/**!
q & dq: https://github.com/redoPop/dq
Copyright (c) 2012 Joe Bartlett | MIT license
*/

(function () {
  var global = this,
      globalName = 'dq',
      defaultQ = '_q',
      modelArray = [];

  /**
  Internal helper for throwing errors.

  @private
  @param {string} message - Error message.
  */
  function throwError(message) {
    throw new Error(message);
  }

  /**
  Object returned by the processReference method.

  @private
  @typedef {object} ProcessedReference
  @property {string} p - The name of the referenced method.
  @property {object} c - Context module object in which the method
      named `p` can be found.
  */

  /**
  An object containing one or more modules.

  Each module is included as a property: property names are module
  names, and property values are module contents.

  e.g., a ModulesContext containing a module named `foo`, which has
  methods named `baz` and `qux`, would look like this:

      {
        foo: {
          baz: function () { … },
          qux: function () { … }
        }
      }

  @typedef {object} ModulesContext
  */

  /**
  Splits the `reference` string by period delimiter and then
  traverses the `context` object looking for the chain matching
  the reference.

  Returns an object with two properties:

  * p: the referenced property
  * c: p's parent context (useful for call/apply scenarios)

  For example:

      getProperty('foo.bar.baz', {foo: {bar: baz: 'hello'}})
        => { p: 'hello', c: { baz: 'hello' } }

  @private
  @param {string} reference - Name of or reference to a method.
  @param {ModulesContext} context - Context in which the referenced
      method/module can be found.
  @returns {ProcessedReference|boolean} Referenced method name
      and parent module context object if the reference was found.
      Boolean false otherwise.
  */
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

  /**
  Scans the provided module `contexts` for the function indicated
  by `referenceString`.

  Once the function has been found, it is called, applying `args`
  as arguments.

  @private
  @param {string} referenceString - String containing a natural JS
      method reference (i.e. using periods to indicate module path)
  @param {ModulesContext[]} contexts - Array of context objects in
      which the module indicated by referenceString might be found.
  @param {array} args - Array of arguments to include when calling
      the referenced method.
  */
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

  /**
  Array representing a queued method call.

  The first member of the array is a string indicating the method
  that should be called. Subsequent array members are arguments
  that should be included when calling that method.

  @typedef {array} callReference
  */

  /**
  Method used to parse and call an individual queue item.

  @callback dqCallback
  @param {callReference} functionCall
  @param {object} options - Configuration options for the
      dequeue process.
  @param {ModulesContext} options.modules - Used to explicitly
      declare modules referenced in the queue. Handy for exposing
      modules that won't be found in the global object, or if
      the global object won't be available to dq (e.g. strict mode).
  */

  /**
  The default callback method to use for handling queue items when
  no override is provided.

  @type dqCallback
  */
  function defaultCallback(functionCall, options) {
    callReference(functionCall[0], [global, options.modules], functionCall.slice(1));
  }

  /**
  Internal helper to convert an arguments object to an array.

  @private
  @param {arguments} value - A native JS arguments object.
  @returns {array} A proper array containing the values from the
      arguments object.
  */
  function arrayify(value) {
    return modelArray.slice.apply(value);
  }

  /**
  Used internally by the main dq method to process a queue once all
  options have been normalized with defaults.

  @private
  @param {callReference[]} queue - A queue of method references
      that should be parsed and called.
  @param {object} options - Normalized configuration options for
      the dequeue process.
  @param {dqCallback} options.callback - The callback to use for
      handling individual queue items.
  @param {ModulesContext} options.modules - Used to explicitly
      declare modules referenced in the queue. Handy for exposing
      modules that won't be found in the global object, or if
      the global object won't be available to dq (e.g. strict mode).
  */
  function dequeueLoop(queue, options) {
    for (var i = -1, queueLength = queue.length; ++i < queueLength;) {
      options.callback(arrayify(queue[i]), options);
    }
  }

  /**
  Main dq method.

  Called at the _end_ of the external JS file, when everything that
  might be referenced in a queue has been loaded.

  @public
  @param {object} [options]
  @param {callReference[]} [options.q=_q] - A queue of method
      references that should be parsed and called. By default a
      globally declared array `_q` is assumed.
  @param {ModulesContext} [options.modules] - Used to explicitly
      declare modules referenced in the queue. Handy for exposing
      modules that won't be found in the global object, or if
      the global object won't be available to dq (e.g. strict mode).
  @param {dqCallback} [options.callback=defaultCallback] - Callback
      for custom handling of individual queue items.
  */
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
    dequeueLoop(options.q.splice(0), options);

    // Overwrite the original push method for this queue array
    options.q.push = function () {
      dequeueLoop(arrayify(arguments), options);
    };
  }

  // UMD based on returnExports.js template
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

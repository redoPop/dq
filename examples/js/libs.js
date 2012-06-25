/*
 * This file is part of an example showing how to use
 * dispatcher. It doesn't contain anything useful per se.
 *
 * See here for more information:
 * https://github.com/jdbartlett/dispatcher
 */

/*
 * Paul Irish's console.log wrapper:
 * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
 */
window.log = function () {
	log.history = log.history || [];
	log.history.push(arguments);

	if (this.console) {
		console.log(Array.prototype.slice.call(arguments));
	}
};

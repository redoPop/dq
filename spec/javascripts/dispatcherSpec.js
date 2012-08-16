describe("dispatcher", function () {
	var dispatcherObject, foo, history, stump;

	stump = function (name) {
		return function () { history.push(name); };
	};

	beforeEach(function () {
		var i, methods;

		foo = {};
		history = [];

		methods = ["bar", "baz", "qux"];
		i = methods.length;
		while (i--) {
			foo[methods[i]] = stump(methods[i]);
			spyOn(foo, methods[i]).andCallThrough();
		}

		dispatcherObject = dispatcher(foo);
	});

	it("should return a new dispatcher object", function () {
		expect(dispatcherObject.add).toBeDefined();
		expect(dispatcherObject.dispatch).toBeDefined();
	});

	describe("a dispatcher object", function () {

		it("should process references on dispatch", function () {
			dispatcherObject.add("bar");
			dispatcherObject.dispatch();

			expect(foo.bar).toHaveBeenCalled();
		});

		it("should wait until dispatch to process references", function () {
			dispatcherObject.add("bar");

			expect(foo.bar.calls.length).toEqual(0);
		});

		it("should process references in order added", function () {
			dispatcherObject.add("baz");
			dispatcherObject.add("qux");
			dispatcherObject.add("bar");
			dispatcherObject.dispatch();

			expect(history).toEqual(["baz", "qux", "bar"]);
		});

		it("should apply arguments during dispatch", function () {
			dispatcherObject.add("bar", 1, "two", { three: 3 });
			dispatcherObject.dispatch();

			expect(foo.bar).toHaveBeenCalledWith(1, "two", { three: 3 });
		});

		it("should immediately process post-dispatch additions", function () {
			dispatcherObject.dispatch();
			expect(foo.bar.calls.length).toEqual(0);

			dispatcherObject.add("bar");
			expect(foo.bar).toHaveBeenCalled();
		});

		it("should throw error when dispatching undeclared methods", function () {
			var msg = "";

			dispatcherObject.add("bork");

			try {
				dispatcherObject.dispatch();
			} catch (e) {
				msg = e;
			}

			expect(msg).toMatch("No such method: bork");
		});

		it("should throw error when adding non-string references", function () {
			var msg = "";

			try {
				dispatcherObject.add(function () { });
			} catch (e) {
				msg = e;
			}

			expect(msg).toMatch("Not a string: ");
		});

	});

});

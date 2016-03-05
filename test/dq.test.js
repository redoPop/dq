/* globals globalSpy:true, modules:true, _q:true, q:true */

var assert = require('assert');
var sinon = require('sinon');
var dq = require('../src/dq');

suite('dq', function () {
  setup(function () {
    globalSpy = sinon.spy();

    modules = {
      module: {
        moduleSpy: sinon.spy()
      }
    };

    _q = [];
    q = function () {
      _q.push(arguments);
    };
  });

  test('processes queued calls to global methods', function () {
    q('globalSpy');
    dq();
    sinon.assert.calledOnce(globalSpy);
  });

  test('processes queued calls to module methods', function () {
    q('module.moduleSpy');
    dq({ modules: modules });
    sinon.assert.calledOnce(modules.module.moduleSpy);
  });

  test('preserves context when calling module methods', function () {
    q('module.moduleSpy');
    dq({ modules: modules });
    sinon.assert.calledOn(modules.module.moduleSpy, modules.module);
  });

  test('sends arguments when making calls', function () {
    q('globalSpy', 1, 'two', { three: 3 });
    dq();
    sinon.assert.calledWith(globalSpy, 1, 'two', { three: 3 });
  });

  test('makes calls in the order queued', function () {
    q('globalSpy', 1);
    q('globalSpy', 2);
    q('globalSpy', 3);
    dq();
    assert.equal(globalSpy.firstCall.args[0], 1);
    assert.equal(globalSpy.secondCall.args[0], 2);
    assert.equal(globalSpy.thirdCall.args[0], 3);
  });

  test('throws an error when encountering undeclared methods', function () {
    q('bork');
    var spy = sinon.spy(dq);
    try { spy(); } catch (e) {
      assert.equal(e.message, 'No such method: bork');
    }
    sinon.assert.threw(spy, 'Error');
  });

  test('processes globally declared _q queue array by default', function () {
    _q = [['globalSpy']];
    dq();
    sinon.assert.calledOnce(globalSpy);
  });

  test('empties queue array to prevent accidental double-execution', function () {
    q('globalSpy');
    dq();
    dq();
    sinon.assert.calledOnce(globalSpy);
  });

  suite('callReference', function () {
    test('prefers module methods over identically named global ones', function () {
      modules.globalSpy = sinon.spy();
      q('globalSpy');
      dq({ modules: modules });
      sinon.assert.calledOnce(modules.globalSpy);
      sinon.assert.notCalled(globalSpy);
    });
  });

  suite('getProperty', function () {
    test('resolves period.delimited.module.paths', function () {
      modules.path = { to: { method: sinon.spy() } };
      q('path.to.method', 'foo');
      dq({ modules: modules });
      sinon.assert.calledOnce(modules.path.to.method);
      sinon.assert.calledWith(modules.path.to.method, 'foo');
    });
  });

  suite('queueArray.push override', function () {
    test('should cause subsequently queued module methods to be invoked immediately', function () {
      dq({ modules: modules });
      sinon.assert.notCalled(modules.module.moduleSpy);
      q('module.moduleSpy');
      sinon.assert.calledOnce(modules.module.moduleSpy);
    });

    test('should cause subsequently queued global methods to be invoked immediately', function () {
      dq();
      sinon.assert.notCalled(globalSpy);
      q('globalSpy');
      sinon.assert.calledOnce(globalSpy);
    });

    test('should handle multiple calls in the order queued', function () {
      dq();
      sinon.assert.notCalled(globalSpy);
      q('globalSpy', 1);
      q('globalSpy', 2);
      q('globalSpy', 3);
      assert.equal(globalSpy.firstCall.args[0], 1);
      assert.equal(globalSpy.secondCall.args[0], 2);
      assert.equal(globalSpy.thirdCall.args[0], 3);
    });
  });
});

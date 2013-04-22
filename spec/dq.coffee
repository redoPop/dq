describe 'dq', =>
  global = this
  output = null
  options = null

  queue = []
  modules = {}

  beforeEach =>
    global._spy = sinon.spy()
    modules = {
      say: (something) =>
        output.push something
      spy: sinon.spy()
    }

    queue = []
    output = []
    options = {
      q: queue,
      modules: modules
    }

  it 'should process queued calls to global methods', =>
    queue.push(['_spy'])
    dq(options)
    expect(_spy).to.have.been.calledOnce

  it 'should process queued calls to module methods', =>
    queue.push(['spy'])
    dq(options)
    expect(modules.spy).to.have.been.calledOnce

  it 'should send arguments when making calls', =>
    queue.push(['spy', 1, "two", { three: 3 }])
    dq(options)
    expect(modules.spy).to.have.been.calledWith(1, "two", { three: 3 })

  it 'should make calls in the order queued', =>
    queue.push(
      ['say', 1],
      ['say', 2],
      ['say', 3]
    )
    dq(options)
    expect(output).to.eql([1, 2, 3])

  it 'should throw an error when encountering undeclared methods', =>
    fn = ->
      dq(options)
    queue.push(['bork'])
    expect(fn).to.throw('No such method: bork')

  it 'should process globally declared _q query array by default', =>
    global._q = [['_spy']]
    dq()
    expect(_spy).to.have.been.calledOnce

  describe 'callReference', =>

    it 'should prefer module methods over global ones', =>
      queue.push(['_spy'])
      modules._spy = modules.spy
      dq(options)
      expect(modules._spy).to.have.been.calledOnce
      expect(_spy).not.to.have.been.called

  describe 'getProperty', =>

    it 'should resolve period.delimited.module.paths', =>
      modules.path = {
        to: {
          method: sinon.spy()
        }
      }
      queue.push(['path.to.method', 'foo'])
      dq(options)
      expect(modules.path.to.method).to.have.been.calledOnce
      expect(modules.path.to.method).to.have.been.calledWith('foo')

  describe 'queueArray.push override', =>

    it 'should cause subsequently queued module methods to be invoked immediately', =>
      expect(modules.spy).not.to.have.been.called
      dq(options)
      queue.push(['spy'])
      expect(modules.spy).to.have.been.calledOnce

    it 'should cause subsequently queued global methods to be invoked immediately', =>
      expect(_spy).not.to.have.been.called
      dq(options)
      queue.push(['_spy'])
      expect(_spy).to.have.been.calledOnce

    it 'should work with the recommended queue.push wrapper', =>
      queueFn = ->
        queue.push(arguments)

      queueFn('spy', 1)

      dq(options)

      expect(modules.spy).to.have.been.calledOnce
      expect(modules.spy).to.have.been.calledWith(1)

      queueFn('spy', 2)

      expect(modules.spy).to.have.been.calledTwice
      expect(modules.spy).to.have.been.calledWith(2)

    it 'should handle multiple calls in the order queued', =>
      dq(options)
      queue.push(
        ['say', 1],
        ['say', 2],
        ['say', 3]
      )
      expect(output).to.eql([1, 2, 3])

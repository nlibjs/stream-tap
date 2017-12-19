const {Transform} = require('stream');

const noop = () => {};
const ON_FLUSH = Symbol('onFlush');
const IS_RUNNING = Symbol('isRunning');
const TURN = Symbol('turn');
const FLUSH = Symbol('flush');
const BUFFER = Symbol('buffer');
const FLUSH_CALLBACK = Symbol('flushCallback');

module.exports = class Tap extends Transform {

	constructor({
		isRunning = false,
		onFlush = noop,
	} = {}) {
		Object.assign(
			super({objectMode: true}),
			{
				[BUFFER]: [],
				[IS_RUNNING]: isRunning,
				[ON_FLUSH]: onFlush,
			}
		);
	}

	get isRunning() {
		return this[IS_RUNNING];
	}

	get receivesNoMoreData() {
		return Boolean(this[FLUSH_CALLBACK]);
	}

	_transform(chunk, encoding, callback) {
		this[BUFFER].push(chunk);
		if (this.isRunning) {
			this[FLUSH]();
		}
		callback();
	}

	_flush(callback) {
		this[FLUSH_CALLBACK] = callback;
		if (this.isRunning) {
			this[FLUSH]();
		}
		this[ON_FLUSH](this);
	}

	[FLUSH]() {
		while (0 < this[BUFFER].length) {
			const chunk = this[BUFFER].shift();
			this.push(chunk);
		}
		if (this[FLUSH_CALLBACK]) {
			this[FLUSH_CALLBACK]();
			this[FLUSH_CALLBACK] = noop;
		}
	}

	[TURN](state) {
		this[IS_RUNNING] = state;
		if (state) {
			this[FLUSH]();
		}
	}

	turnOn() {
		this[TURN](true);
	}

	turnOff() {
		this[TURN](false);
	}

};

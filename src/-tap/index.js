const {Transform} = require('stream');
const noop = () => {};

const ON_FLUSH = Symbol('onFlush');
const IS_RUNNING = Symbol('isRunning');
const TURN = Symbol('turn');
const FLUSH = Symbol('flush');
const BUFFER = Symbol('buffer');
const FLUSH_CALLBACK = Symbol('flushCallback');

module.exports = class Tap extends Transform {

	constructor({isRunning = false, onFlush = noop} = {}) {
		Object.assign(
			super(),
			{
				[BUFFER]: [],
				[IS_RUNNING]: isRunning,
				[ON_FLUSH]: onFlush,
			}
		)
		.on('pipe', ({_readableState: {objectMode}}) => {
			this._readableState.objectMode = objectMode;
			this._writableState.objectMode = objectMode;
		});
	}

	get isRunning() {
		return this[IS_RUNNING];
	}

	get receivesNoMoreData() {
		return Boolean(this[FLUSH_CALLBACK]);
	}

	_transform(chunk, encoding, callback) {
		if (this.isRunning) {
			this.push(chunk);
		} else {
			this[BUFFER].push(chunk);
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
			this.push(this[BUFFER].shift());
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

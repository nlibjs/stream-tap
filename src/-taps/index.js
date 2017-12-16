const EventEmitter = require('events');
const Tap = require('../-tap');

const STATE = Symbol('state');
const STATE_OPEN = 0;
const STATE_CLOSE = 1;

module.exports = class Taps extends EventEmitter {

	constructor(name) {
		Object.assign(
			super(),
			{
				name,
				taps: new Set(),
				ready: new Set(),
				[STATE]: STATE_CLOSE,
			}
		);
	}

	get isOpened() {
		return this[STATE] === STATE_OPEN;
	}

	get isClosed() {
		return this[STATE] === STATE_CLOSE;
	}

	tap() {
		const tap = new Tap(this);
		this.taps.add(tap);
		return tap;
	}

	onReady(tap) {
		this.ready.add(tap);
		if (!this.isClosed) {
			this.open();
		} else if (this.taps.size === this.ready.size) {
			this.emit('ready');
		}
	}

	open() {
		this[STATE] = STATE_OPEN;
		for (const tap of this.ready) {
			this.ready.delete(tap);
			tap.open();
		}
	}

	close() {
		this[STATE] = STATE_CLOSE;
		for (const tap of this.taps) {
			tap.close();
		}
	}

};

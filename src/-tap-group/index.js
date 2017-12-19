const Tap = require('../-tap');
const noop = () => {};

const TURN = Symbol('turn');
const TAPS = Symbol('taps');
const FINISHED = Symbol('finished');
const IS_RUNNING = Symbol('isRunning');
const ON_FLUSH = Symbol('onFlush');

module.exports = class TapGroup {

	constructor({isRunning = false, onFlush = noop} = {}) {
		Object.assign(
			this,
			{
				[TAPS]: new Set(),
				[FINISHED]: new Set(),
				[IS_RUNNING]: isRunning,
				[ON_FLUSH]: onFlush,
			}
		);
	}

	get taps() {
		return new Set(this[TAPS]);
	}

	get isRunning() {
		return this[IS_RUNNING];
	}

	get receivesNoMoreData() {
		const {
			[FINISHED]: {size: finishedTapCount},
			[TAPS]: {size: tapCount},
		} = this;
		return 0 < tapCount && finishedTapCount === tapCount;
	}

	put({onData = noop} = {}) {
		if (this.receivesNoMoreData) {
			throw new Error('This tap group is closed.');
		}
		const tap = new Tap({
			isRunning: this.isRunning,
			onFlush: (tap) => {
				this[FINISHED].add(tap);
				if (this.receivesNoMoreData) {
					this[ON_FLUSH](this);
				}
			},
			onData,
		});
		this[TAPS].add(tap);
		return tap;
	}

	[TURN](state) {
		if (this[IS_RUNNING] === state) {
			return;
		}
		this[IS_RUNNING] = state;
		if (state) {
			for (const tap of this[TAPS]) {
				tap.turnOn();
			}
		} else {
			for (const tap of this[TAPS]) {
				tap.turnOff();
			}
		}
	}

	turnOn() {
		this[TURN](true);
	}

	turnOff() {
		this[TURN](false);
	}

};

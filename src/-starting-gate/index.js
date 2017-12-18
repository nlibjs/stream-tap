const TapGroup = require('../-tap-group');

const DATA = Symbol('data');

module.exports = class StartingGate extends TapGroup {

	constructor() {
		const data = [];
		const {turnOn} = Object.assign(
			super({
				isRunning: false,
				onData(chunk) {
					data.push(chunk);
				},
				onFlush() {
					turnOn.call(this);
				},
			}),
			{
				[DATA]: data,
			}
		);
		this.turnOn = undefined;
		this.turnOff = undefined;
	}

	get data() {
		return this[DATA].slice();
	}

	clear() {
		this[DATA].splice(0, this[DATA].length);
	}

};

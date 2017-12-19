const TapGroup = require('../-tap-group');
const noop = () => {};

module.exports = class StartingGate extends TapGroup {

	constructor({onFlush = noop} = {}) {
		const {turnOn} = super({
			isRunning: false,
			onFlush() {
				onFlush();
				turnOn.call(this);
			},
		});
		this.turnOn = undefined;
		this.turnOff = undefined;
	}

};

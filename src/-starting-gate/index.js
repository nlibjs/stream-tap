const TapGroup = require('../-tap-group');

module.exports = class StartingGate extends TapGroup {

	constructor() {
		const {turnOn} = super({
			isRunning: false,
			onFlush() {
				turnOn.call(this);
			},
		});
		this.turnOn = undefined;
		this.turnOff = undefined;
	}

};

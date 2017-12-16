const TapGroup = require('../-tap-group');
module.exports = class StartingGate extends TapGroup {

	constructor() {
		super({
			isRunning: false,
			onFlush(tapGroup) {
				tapGroup.turnOn();
			},
		});
	}

};

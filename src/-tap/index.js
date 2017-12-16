const {Transform} = require('stream');

const STATE = Symbol('state');
const STATE_OPEN = 0;
const STATE_CLOSE = 1;

module.exports = class Tap extends Transform {

	constructor(taps) {
		Object.assign(
			super(),
			{
				taps,
				buffer: [],
				[STATE]: STATE_CLOSE,
			}
		)
		.on('pipe', ({_readableState: {objectMode}}) => {
			this._readableState.objectMode = objectMode;
			this._writableState.objectMode = objectMode;
		});
	}


	get isOpened() {
		return this[STATE] === STATE_OPEN;
	}

	get isClosed() {
		return this[STATE] === STATE_CLOSE;
	}

	_transform(chunk, encoding, callback) {
		if (this.isClosed) {
			this.buffer.push(chunk);
		} else {
			this.push(chunk);
		}
		callback();
	}

	_flush(onEnd) {
		if (this.isClosed) {
			this.onEnd = onEnd;
			this.taps.onReady(this);
		} else {
			onEnd();
		}
	}

	open() {
		this[STATE] = STATE_OPEN;
		while (0 < this.buffer.length) {
			this.push(this.buffer.shift());
		}
		if (this.onEnd) {
			this.onEnd();
			delete this.onEnd;
		}
	}

	close() {
		this[STATE] = STATE_CLOSE;
	}

};

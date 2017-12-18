const assert = require('assert');
const test = require('@nlib/test');
const {PassThrough} = require('stream');
const {Tap} = require('../..');

test('Tap', (test) => {

	test('isRunning: false', () => {
		assert.equal(new Tap({isRunning: false}).isRunning, false);
	});

	test('isRunning: true', () => {
		assert.equal(new Tap({isRunning: true}).isRunning, true);
	});

	test('manual flush', (test) => {
		const source = new PassThrough();
		const passed = [];
		let called = false;
		let ended = false;
		const tap = new Tap({
			isRunning: true,
			onFlush() {
				called = true;
			},
		});
		source
		.pipe(tap)
		.on('data', (chunk) => {
			passed.push(chunk);
		})
		.once('end', () => {
			ended = true;
		});
		const data = new Array(5).fill()
		.map((x, index) => Buffer.from(`${Date.now()}-${index}`));
		test('0', () => {
			source.write(data[0]);
			assert.deepEqual(passed, data.slice(0, 1));
		});
		test('1', () => {
			source.write(data[1]);
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('turnOff', () => {
			tap.turnOff();
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('2', () => {
			source.write(data[2]);
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('3', () => {
			source.write(data[3]);
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('onFlush is not called', () => {
			assert.equal(called, false);
		});
		test('receivesNoMoreData: false', () => {
			assert.equal(tap.receivesNoMoreData, false);
		});
		test('end', () => {
			source.end(data[4]);
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('receivesNoMoreData: true', () => {
			assert.equal(tap.receivesNoMoreData, true);
		});
		test('onFlush is called', () => {
			assert.equal(called, true);
		});
		test('end is not emitted', () => {
			assert.equal(ended, false);
		});
		test('fail to write', () => {
			assert.throws(() => {
				source.write('data');
			});
		});
		test('turnOn', () => {
			tap.turnOn();
			assert.deepEqual(passed, data);
		});
		test('end is emitted', () => {
			assert.equal(ended, true);
		});
	});

	test('auto flush', (test) => {
		const source = new PassThrough();
		const passed = [];
		let called = false;
		let ended = false;
		const tap = new Tap({
			isRunning: true,
			onFlush() {
				called = true;
			},
		});
		source
		.pipe(tap)
		.on('data', (chunk) => {
			passed.push(chunk);
		})
		.once('end', () => {
			ended = true;
		});
		const data = new Array(5).fill()
		.map((x, index) => Buffer.from(`${Date.now()}-${index}`));
		test('0', () => {
			source.write(data[0]);
			assert.deepEqual(passed, data.slice(0, 1));
		});
		test('1', () => {
			source.write(data[1]);
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('turnOff', () => {
			tap.turnOff();
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('2', () => {
			source.write(data[2]);
			assert.deepEqual(passed, data.slice(0, 2));
		});
		test('turnOn', () => {
			tap.turnOn();
			assert.deepEqual(passed, data.slice(0, 3));
		});
		test('3', () => {
			source.write(data[3]);
			assert.deepEqual(passed, data.slice(0, 4));
		});
		test('onFlush is not called', () => {
			assert.equal(called, false);
		});
		test('receivesNoMoreData: false', () => {
			assert.equal(tap.receivesNoMoreData, false);
		});
		test('end is not emitted', () => {
			assert.equal(ended, false);
		});
		test('end', () => {
			source.end(data[4]);
			assert.deepEqual(passed, data);
		});
		test('end is emitted', () => {
			assert.equal(ended, true);
		});
		test('receivesNoMoreData: true', () => {
			assert.equal(tap.receivesNoMoreData, true);
		});
		test('onFlush is called', () => {
			assert.equal(called, true);
		});
		test('fail to write', () => {
			assert.throws(() => {
				source.write('data');
			});
		});
	});

	test('work without onFlush', () => {
		const source = new PassThrough();
		const passed = [];
		const tap = new Tap();
		source
		.pipe(tap)
		.on('data', (chunk) => {
			passed.push(chunk);
		});
		const data = Buffer.from(`${Date.now()}`);
		source.end(data);
		assert.deepEqual(passed, []);
		tap.turnOn();
		assert.deepEqual(passed, [data]);
	});

});

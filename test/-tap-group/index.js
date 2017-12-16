const assert = require('assert');
const test = require('@nlib/test');
const {PassThrough} = require('stream');
const {TapGroup} = require('../..');

test('TapGroup', (test) => {

	test('isRunning: false', () => {
		assert.equal(new TapGroup({isRunning: false}).isRunning, false);
	});

	test('isRunning: true', () => {
		assert.equal(new TapGroup({isRunning: true}).isRunning, true);
	});

	test('manual flush', (test) => {
		const source1 = new PassThrough();
		const source2 = new PassThrough();
		const passed1 = [];
		const passed2 = [];
		let called = false;
		const tapGroup = new TapGroup({
			isRunning: true,
			onFlush() {
				called = true;
			},
		});
		source1
		.pipe(tapGroup.put())
		.on('data', (chunk) => {
			passed1.push(chunk);
		});
		source2
		.pipe(tapGroup.put())
		.on('data', (chunk) => {
			passed2.push(chunk);
		});
		const data = new Array(5).fill().map((x, index) => {
			return Buffer.from(`${Date.now()}-${index}`);
		});
		test('0', () => {
			source1.write(data[0]);
			source2.write(data[0]);
			assert.deepEqual(passed1, data.slice(0, 1));
			assert.deepEqual(passed2, data.slice(0, 1));
		});
		test('1', () => {
			source1.write(data[1]);
			source2.write(data[1]);
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('turnOff', () => {
			tapGroup.turnOff();
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('2', () => {
			source1.write(data[2]);
			source2.write(data[2]);
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('3', () => {
			source1.write(data[3]);
			source2.write(data[3]);
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('onFlush is not called', () => {
			assert.equal(called, false);
		});
		test('receivesNoMoreData: false', () => {
			assert.equal(tapGroup.receivesNoMoreData, false);
		});
		test('end', () => {
			source1.end(data[4]);
			source2.end(data[4]);
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('receivesNoMoreData: true', () => {
			assert.equal(tapGroup.receivesNoMoreData, true);
		});
		test('onFlush is called', () => {
			assert.equal(called, true);
		});
		test('fail to write', () => {
			assert.throws(() => {
				source1.end('data');
			});
			assert.throws(() => {
				source2.end('data');
			});
		});
		test('fail to put a tap', () => {
			assert.throws(() => {
				tapGroup.put();
			});
		});
		test('turnOn', () => {
			tapGroup.turnOn();
			assert.deepEqual(passed1, data);
			assert.deepEqual(passed2, data);
		});
	});

	test('auto flush', (test) => {
		const source1 = new PassThrough();
		const source2 = new PassThrough();
		const passed1 = [];
		const passed2 = [];
		let called = false;
		const tapGroup = new TapGroup({
			isRunning: true,
			onFlush() {
				called = true;
			},
		});
		source1
		.pipe(tapGroup.put())
		.on('data', (chunk) => {
			passed1.push(chunk);
		});
		source2
		.pipe(tapGroup.put())
		.on('data', (chunk) => {
			passed2.push(chunk);
		});
		const data = new Array(5).fill().map((x, index) => {
			return Buffer.from(`${Date.now()}-${index}`);
		});
		test('0', () => {
			source1.write(data[0]);
			source2.write(data[0]);
			assert.deepEqual(passed1, data.slice(0, 1));
			assert.deepEqual(passed2, data.slice(0, 1));
		});
		test('1', () => {
			source1.write(data[1]);
			source2.write(data[1]);
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('turnOff', () => {
			tapGroup.turnOff();
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('2', () => {
			source1.write(data[2]);
			source2.write(data[2]);
			assert.deepEqual(passed1, data.slice(0, 2));
			assert.deepEqual(passed2, data.slice(0, 2));
		});
		test('turnOn', () => {
			tapGroup.turnOn();
			assert.deepEqual(passed1, data.slice(0, 3));
			assert.deepEqual(passed2, data.slice(0, 3));
		});
		test('3', () => {
			source1.write(data[3]);
			source2.write(data[3]);
			assert.deepEqual(passed1, data.slice(0, 4));
			assert.deepEqual(passed2, data.slice(0, 4));
		});
		test('onFlush is not called', () => {
			assert.equal(called, false);
		});
		test('receivesNoMoreData: false', () => {
			assert.equal(tapGroup.receivesNoMoreData, false);
		});
		test('end', () => {
			source1.end(data[4]);
			source2.end(data[4]);
			assert.deepEqual(passed1, data);
			assert.deepEqual(passed2, data);
		});
		test('receivesNoMoreData: true', () => {
			assert.equal(tapGroup.receivesNoMoreData, true);
		});
		test('onFlush is called', () => {
			assert.equal(called, true);
		});
		test('fail to write', () => {
			assert.throws(() => {
				source1.end('data');
			});
			assert.throws(() => {
				source2.end('data');
			});
		});
		test('fail to put a tap', () => {
			assert.throws(() => {
				tapGroup.put();
			});
		});
	});

	test('work without onFlush', () => {
		const source1 = new PassThrough();
		const source2 = new PassThrough();
		const passed1 = [];
		const passed2 = [];
		const tapGroup = new TapGroup();
		source1
		.pipe(tapGroup.put())
		.on('data', (chunk) => {
			passed1.push(chunk);
		});
		source2
		.pipe(tapGroup.put())
		.on('data', (chunk) => {
			passed2.push(chunk);
		});
		const data = Buffer.from(`${Date.now()}`);
		source1.end(data);
		source2.end(data);
		assert.deepEqual(passed1, []);
		assert.deepEqual(passed2, []);
		tapGroup.turnOn();
		assert.deepEqual(passed1, [data]);
		assert.deepEqual(passed2, [data]);
	});

});

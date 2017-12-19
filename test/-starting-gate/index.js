const assert = require('assert');
const test = require('@nlib/test');
const {PassThrough} = require('stream');
const {StartingGate} = require('../..');

test('StartingGate', (test) => {

	const source1 = new PassThrough();
	const source2 = new PassThrough();
	const passed1 = [];
	const passed2 = [];
	const gate = new StartingGate();
	source1
	.pipe(gate.put())
	.on('data', (chunk) => {
		passed1.push(chunk);
	});
	source2
	.pipe(gate.put())
	.on('data', (chunk) => {
		passed2.push(chunk);
	});
	const data = new Array(3).fill()
	.map((x, index) => Buffer.from(`${Date.now()}-${index}`));
	test('fail to turn on', () => {
		assert.throws(() => {
			gate.turnOn();
		});
	});
	test('fail to turn off', () => {
		assert.throws(() => {
			gate.turnOff();
		});
	});
	test('0', () => {
		source1.write(data[0]);
		source2.write(data[0]);
		assert.deepEqual(passed1, []);
		assert.deepEqual(passed2, []);
	});
	test('1', () => {
		source1.write(data[1]);
		source2.write(data[1]);
		assert.deepEqual(passed1, []);
		assert.deepEqual(passed2, []);
	});
	test('receivesNoMoreData: false', () => {
		assert.equal(gate.receivesNoMoreData, false);
	});
	test('end', () => {
		source1.end(data[2]);
		source2.end(data[2]);
	});
	test('receivesNoMoreData: true', () => {
		assert.equal(gate.receivesNoMoreData, true);
	});
	test('received data', () => {
		assert.deepEqual(passed1, data);
		assert.deepEqual(passed2, data);
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
			gate.put();
		});
	});

});

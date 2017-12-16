const assert = require('assert');
const test = require('@nlib/test');
const {PassThrough} = require('stream');
const {Taps} = require('..');

test('stream-tap', (test) => {

	test('copy', () => {
		return new Promise((resolve, reject) => {
			const foo = new Taps('foo')
			.once('ready', () => {
				foo.open();
			});
			const input1 = new PassThrough();
			const input2 = new PassThrough();
			setImmediate(() => {
				input2.write('input2-1');
				input1.write('input1-1');
				input1.end('input1-2');
				input2.end('input2-2');
			});
			const chunks = [];
			const receiver = new PassThrough()
			.on('data', (chunk) => {
				chunks.push(chunk);
			})
			.once('error', reject)
			.once('end', () => {
				resolve(Buffer.concat(chunks));
			});
			input1.pipe(foo.tap()).pipe(receiver);
			input2.pipe(foo.tap()).pipe(receiver);
		})
		.then((buffer) => {
			assert.equal(`${buffer}`, 'input1-1input1-2input2-1input2-2');
		});
	});

	test('matrix', () => {
		return new Promise((resolve, reject) => {
			const tapH = new Taps('tapH');
			const tapV = new Taps('tapV');
			const m11 = new PassThrough();
			const m21 = new PassThrough();
			const m31 = new PassThrough();
			const m12 = new PassThrough();
			const m22 = new PassThrough();
			const m32 = new PassThrough();
			const m13 = new PassThrough();
			const m23 = new PassThrough();
			const m33 = new PassThrough();
			m11.pipe(tapV.tap()).pipe(m12);
			m11.pipe(tapH.tap()).pipe(m21);
			m12.pipe(m13);
			m12.pipe(m22);
			m13.pipe(tapH.tap()).pipe(m23);
			m21.pipe(m22);
			m21.pipe(m31);
			m22.pipe(m23);
			m22.pipe(m32);
			m23.pipe(m33);
			m31.pipe(tapV.tap()).pipe(m32);
			m32.pipe(m33);
			const chunks = [];
			m33
			.on('data', (chunk) => {
				chunks.push(chunk);
			})
			.once('error', reject);
			setImmediate(() => {
				tapV.open();
				m11.write('1');
				setImmediate(() => {
					console.log(chunks);
					resolve();
				});
			});
		});
	});

});

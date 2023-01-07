import assert from "assert";
import {sleep, timeout, setImmediateCustom, clearImmediateCustom, allLimit, promisify} from './';

describe("Functions", function () {
    it("Sleep", async function () {
        await sleep(100, 'test').then((data) => {
            assert.strictEqual(data, 'test');
        })
    });

    it("Timeout", async () => {
        await timeout(sleep(500, 123), 700)
            .then((data) => {
                assert.strictEqual(data, 123);
            })
            .catch((err) => {
                throw err;
            })

        await timeout(sleep(500, 123), 200)
            .then((data) => {
                assert.strictEqual(data, 'boooooom!!');
            })
            .catch((err) => {
                assert.strictEqual(err, 'Timeout expired');
            })
    });

    it("Immediate", () => {
        function test(param: string) {
            assert.strictEqual(param, 'test');
        }
        function test2(param: string) {
            assert.strictEqual(param, 'test');
        }
        const immediate = setImmediateCustom(test, 'test');
        const immediateCancel = setImmediateCustom(test2, 'booom');

        clearImmediateCustom(immediateCancel);

        assert.strictEqual(immediate.destroyed, false);
        assert.strictEqual(immediateCancel.destroyed, true);
    });

    it("Promisify", async () => {
        const funcParam = 'my-file.txt';
        const result = 'file content';
        const error = 'Unknown error';

        function test(param: number, cb: (err: unknown, result: unknown) => void) {
            assert.strictEqual(param, funcParam);
            cb(null, result);
        }
        function testErr(param: number, cb: (err: unknown, result: unknown) => void) {
            assert.strictEqual(param, funcParam);
            cb(error, null);
        }

        const testPromise = promisify(test);
        await testPromise(funcParam)
            .then((data) => {
                assert.strictEqual(data, result);
            })
            .catch((err) => {
                assert.strictEqual(err, 'boooom!!');
            });

        const testErrPromise = promisify(testErr);
        await testErrPromise(funcParam)
            .then((data) => {
                assert.strictEqual(data, 'boooom!!');
            })
            .catch((err) => {
                assert.strictEqual(err, error);
            });
    });

    it("AllLimit", async () => {

        const f1 = () => Promise.resolve(1);
        const f2 = () => new Promise((resolve) => {
            setTimeout(() => resolve(2), 1000)
        });
        const f3 = () => 3;
        const f4 = () => Promise.resolve(4);
        const f5 = () => Promise.resolve(5);
        const f6 = () => Promise.resolve(6);
        const f7 = () => Promise.resolve(7);
        const reject = () => Promise.reject('error');

        await allLimit([f1,f2,f3,f4,f5,f6,f7], 2)
            .then((data) => {
                assert.deepEqual(data, [1,2,3,4,5,6,7]);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!!');
            })

        await allLimit([f1,reject,f2,f3,f4,f5,f6,f7], 2)
            .then((data) => {
                assert.strictEqual(data, 'booom!!');
            })
            .catch((err) => {
                assert.strictEqual(err, 'error');
            })
    });
});
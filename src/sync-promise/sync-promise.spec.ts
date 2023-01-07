import assert from "assert";
import {SyncPromise} from "./";

const resolvedPromise = (value: any, timeout: number) => {
    return new SyncPromise(((resolve) => {
        setTimeout(() => resolve(value), timeout)
    }))
}

const rejectedPromise = (value: any, timeout: number) => {
    return new SyncPromise(((resolve, reject) => {
        setTimeout(() => reject(value), timeout)
    }))
}

describe("SyncPromise", function () {
    it("Constructor", function () {
        const testValue = 123;

        const syncPromiseResolved = new SyncPromise((resolve => resolve(testValue)));
        syncPromiseResolved
            .then((data) => {
                assert.strictEqual(data, testValue);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        const syncPromiseRejected = new SyncPromise(((resolve, reject) => reject(testValue)));
        syncPromiseRejected
            .then((data) => {
                assert.strictEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, testValue);
            })

        const syncPromiseThrow = new SyncPromise((() => { throw testValue }));
        syncPromiseThrow
            .then((data) => {
                assert.strictEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, testValue);
            })

    });

    it("Static resolve/reject", function () {
        const testValue = 123;

        const syncPromiseResolved = SyncPromise.resolve(testValue);
        syncPromiseResolved
            .then((data) => {
                assert.strictEqual(data, testValue);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        const syncPromiseRejected = SyncPromise.reject(testValue);
        syncPromiseRejected
            .then((data) => {
                assert.strictEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, testValue);
            })

        const syncPromiseResolvedOfResolved = SyncPromise.resolve(SyncPromise.resolve(SyncPromise.resolve(testValue)));
        syncPromiseResolvedOfResolved
            .then((data) => {
                assert.strictEqual(data, testValue);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        const syncPromiseResolvedOfRejected = SyncPromise.resolve(SyncPromise.resolve(SyncPromise.reject(testValue)));
        syncPromiseResolvedOfRejected
            .then((data) => {
                assert.strictEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, testValue);
            })

        const syncPromiseRejectedOfResolved = SyncPromise.reject(SyncPromise.resolve(SyncPromise.resolve(testValue)));
        syncPromiseRejectedOfResolved
            .then((data) => {
                assert.strictEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, testValue);
            })

        const syncPromiseRejectedOfRejected = SyncPromise.reject(SyncPromise.resolve(SyncPromise.reject(testValue)));
        syncPromiseRejectedOfRejected
            .then((data) => {
                assert.strictEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, testValue);
            })

    });

    it("finally", function () {
        const testValue = 123;

        const syncPromiseResolved = SyncPromise.resolve(testValue);
        syncPromiseResolved
            .then((data) => {
                assert.strictEqual(data, testValue);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })
            .finally(() => 'test')
            .then((data) => {
                assert.strictEqual(data, 'test');
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })
    });

    it('All', async function() {

        const values = [123, 456];

        await SyncPromise.all([resolvedPromise(values[0], 500), resolvedPromise(values[1], 200)])
            .then((data) => {
                assert.deepEqual(data, values);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        await SyncPromise.all([rejectedPromise(values[0], 500), resolvedPromise(values[1], 200)])
            .then((data) => {
                assert.deepEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, values[0]);
            })
    })

    it('Race', async function() {

        const values = [123, 456];

        await SyncPromise.race([rejectedPromise(values[0], 500), resolvedPromise(values[1], 200)])
            .then((data) => {
                assert.deepEqual(data, values[1]);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        await SyncPromise.race([resolvedPromise(values[0], 500), rejectedPromise(values[1], 200)])
            .then((data) => {
                assert.deepEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.strictEqual(err, values[1]);
            })
    })

    it('Any', async function() {

        const values = [123, 456];

        await SyncPromise.any([resolvedPromise(values[0], 500), resolvedPromise(values[1], 200)])
            .then((data) => {
                assert.strictEqual(data, values[1]);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        await SyncPromise.any([rejectedPromise(values[0], 200), resolvedPromise(values[1], 500)])
            .then((data) => {
                assert.strictEqual(data, values[1]);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        await SyncPromise.any([rejectedPromise(values[0], 200), rejectedPromise(values[1], 500)])
            .then((data) => {
                assert.strictEqual(data, 'booom!');
            })
            .catch((err) => {
                assert.deepEqual(err, values);
            })
    })

    it('AllSettled', async function() {

        const values = [123, 456];

        const okValue = (val: any) => ({ status: 'fulfilled', value: val });
        const errValue = (val: any) => ({ status: 'rejected', reason: val });

        await SyncPromise.allSettled([resolvedPromise(values[0], 500), resolvedPromise(values[1], 200)])
            .then((data) => {
                assert.deepEqual(data, [okValue(values[0]), okValue(values[1])]);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        await SyncPromise.allSettled([rejectedPromise(values[0], 500), resolvedPromise(values[1], 200)])
            .then((data) => {
                assert.deepEqual(data, [errValue(values[0]), okValue(values[1])]);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })

        await SyncPromise.allSettled([rejectedPromise(values[0], 500), rejectedPromise(values[1], 200)])
            .then((data) => {
                assert.deepEqual(data, [errValue(values[0]), errValue(values[1])]);
            })
            .catch((err) => {
                assert.strictEqual(err, 'booom!');
            })
    })
});
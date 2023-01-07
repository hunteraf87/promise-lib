import {State} from "./interface";

export default class SyncPromise<T> {
    #value: unknown;
    #state: State = State.pending;
    #fulfilledHandlers: Array<(value: any) => void> = [];
    #rejectedHandlers: Array<(value: any) => void> = [];

    constructor(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void) {

        const clear = () => {
            this.#fulfilledHandlers = [];
            this.#rejectedHandlers = [];
        }

        const resolve = (value: T) => {

            if (this.#state !== State.pending) {
                return;
            }

            if (value instanceof SyncPromise) {
                value.then(resolve, reject);
                return;
            }

            this.#state = State.fulfilled;
            this.#value = value;

            for (const handler of this.#fulfilledHandlers) {
                handler(this.#value);
            }

            clear();
        }

        const reject = (reason?: any) => {

            if (this.#state !== State.pending) {
                return;
            }

            if (reason instanceof SyncPromise) {
                reason
                    .then((data) => reject(data))
                    .catch((err) => reject(err))
                return;
            }

            this.#state = State.rejected;
            this.#value = reason;

            for (const handler of this.#rejectedHandlers) {
                handler(this.#value);
            }
        }

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    static resolve<T>(value: T): SyncPromise<T> {
        return new SyncPromise<T>((resolve) => resolve(value));
    }

    static reject<T>(err: T): SyncPromise<T> {
        return new SyncPromise<T>((resolve, reject) => reject(err));
    }

    catch<TResult = never>(
        onrejected?: (((reason: any) => TResult) | undefined | null)
    ){
        return new SyncPromise(((resolve, reject) => {

            const rejected = (val: any) => {
                try {
                    resolve(onrejected ? onrejected(val) : val);
                } catch (error) {
                    reject(error);
                }
            }

            if (this.#state === State.rejected) {
                rejected(this.#value);
                return;
            }
            if (this.#state === State.fulfilled) {
                resolve(this.#value);
                return;
            }

            this.#fulfilledHandlers.push(resolve);

            this.#rejectedHandlers.push(rejected);
        }))
    }

    finally(onfinally?: (() => void) | undefined | null) {
        return new SyncPromise(((resolve, reject) => {
            const fulfilled = () => {
                try {
                    resolve(onfinally ? onfinally() : undefined);
                } catch (error) {
                    reject(error);
                }
            }

            this.#fulfilledHandlers.push(fulfilled);
        }))
    }

    then<TResult>(
        onfulfilled?: (((value: any) => TResult) | undefined | null),
        onrejected?: (((err: any) => TResult) | undefined | null)
    ) {
        return new SyncPromise(((resolve, reject) => {

            const fulfilled = (val: any) => {
                try {
                    resolve(onfulfilled ? onfulfilled(val) : val);
                } catch (error) {
                    reject(error);
                }
            }

            const rejected = (val: any) => {
                try {
                    reject(onrejected ? onrejected(val) : val);
                } catch (error) {
                    reject(error);
                }
            }

            if (this.#state === State.fulfilled) {
                fulfilled(this.#value);
                return;
            }
            if (this.#state === State.rejected) {
                rejected(this.#value);
                return;
            }

            this.#fulfilledHandlers.push(fulfilled);

            this.#rejectedHandlers.push(rejected);
        }))
    }

    static all<T>(iterable: Iterable<SyncPromise<T>>) {
        return new SyncPromise((resolve, reject) => {

            const promises = Array.from(iterable);

            const results = new Array(promises.length);
            let done = 0;

            for (let i = 0; i < promises.length; i++) {
                promises[i]
                    .then((data) => {
                        done++;
                        results[i] = data;
                        if (done === promises.length) {
                            resolve(results);
                        }
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }
        })
    }

    static race<T>(iterable: Iterable<SyncPromise<T>>) {
        return new SyncPromise((resolve, reject) => {

            for (const promise of iterable) {
                promise
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((err) => {
                        reject(err)
                    })
            }
        })
    }

    static any<T>(iterable: Iterable<SyncPromise<T>>) {
        return new SyncPromise((resolve, reject) => {

            const promises = Array.from(iterable);

            const results = new Array(promises.length);
            let done = 0;

            for (let i = 0; i < promises.length; i++) {
                promises[i]
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((err) => {
                        done++;
                        results[i] = err;
                        if (done === promises.length) {
                            reject(results);
                        }
                    })
            }
        })
    }

    static allSettled<T>(iterable: Iterable<SyncPromise<T>>) {
        return new SyncPromise((resolve) => {

            const promises = Array.from(iterable);

            const results = new Array(promises.length);
            let done = 0;

            for (let i = 0; i < promises.length; i++) {
                promises[i]
                    .then((data) => {
                        done++;
                        results[i] = { status: 'fulfilled', value: data };
                        if (done === promises.length) {
                            resolve(results);
                        }
                    })
                    .catch((err) => {
                        done++;
                        results[i] = { status: 'rejected', reason: err };
                        if (done === promises.length) {
                            resolve(results);
                        }
                    })
            }
        })
    }
}
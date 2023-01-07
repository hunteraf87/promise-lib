type InnerFunc<T> = () => T | Promise<T>;

export default function allLimit<T>(
    iterable: Iterable<InnerFunc<T>>,
    limit = Infinity
): Promise<T[]> {

    const functions = Array.from(iterable);
    const results = new Array(functions.length);
    let pending = 0,
        done = 0,
        curIdx = 0,
        rejected = false;

    const iter = iterable[Symbol.iterator]();

    const exec = (func, idx, resolve, reject) => {
        Promise.resolve(func())
            .then((data) => {
                done++;
                pending--;
                results[idx] = data;
                if (done === functions.length) {
                    resolve(results);
                }
                if (pending < limit) {
                    const next = iter.next();
                    if (!next.done && !rejected) {
                        pending++;
                        exec(next.value, curIdx, resolve, reject);
                        curIdx++;
                    }
                }
            })
            .catch((err) => {
                rejected = true;
                reject(err)
            })
    }

    return new Promise(((resolve, reject) => {

        if (!functions.length) {
            resolve([]);
        }

        for (let i = 0; i < limit; i++) {
            const next = iter.next();
            if (!next.done) {
                pending++;
                exec(next.value, curIdx, resolve, reject);
                curIdx++;
            }
        }

    }))
}
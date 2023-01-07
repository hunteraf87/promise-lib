type PromisifiableFunction = (...args: any[]) => void;
type PromisifyFunction<T> = (...args: any[]) => Promise<T>;

export function promisify<T>(func: PromisifiableFunction): PromisifyFunction<T> {
    return function (...args: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            function callback(err: unknown, result: T) {
                if (err !== undefined && err !== null) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }

            args.push(callback);
            func.call(undefined, ...args);
        });
    };
}






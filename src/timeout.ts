export default function timeout(promise: Promise<unknown>, timeout: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject('Timeout expired'), timeout);
        promise
            .then((data) => resolve(data))
            .catch((err) => reject(err));
    });
}
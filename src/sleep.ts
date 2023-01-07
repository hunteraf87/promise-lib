export default function sleep(timeout: number, resolveValue?: unknown): Promise<unknown> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(resolveValue), timeout);
    });
}
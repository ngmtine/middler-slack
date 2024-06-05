export const waitUntil = async (ms: number, intervalFunc: () => void) => {
    return await new Promise(() => {
        intervalFunc();
    });
};

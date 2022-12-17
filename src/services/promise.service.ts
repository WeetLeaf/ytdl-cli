
export const countSuccess = <T>(
  promises: PromiseSettledResult<T>[]
): number => {
  return promises.reduce((acc, promise) => {
    if (promise.status === "fulfilled") return acc + 1;
    return acc;
  }, 0);
};

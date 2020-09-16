type AsyncFilterPredicate<T> = (el: T, index: number, array: T[]) => Promise<boolean>;

export async function asyncFilter<T>(arr: T[], predicate: AsyncFilterPredicate<T>): Promise<T[]> {
  return Promise.all(arr.map((element, index) => predicate(element, index, arr))).then(result => {
    return arr.filter((_, index) => result[index]);
  });
}

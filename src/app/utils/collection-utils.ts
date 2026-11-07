export class CollectionUtils {

  static randomPick<T>(array: T[], length: number) {
    if (array == null) { return []; }
    if (array.length <= length) { return array; }

    const minIndex = array.length - length;
    for (let i = array.length - 1; i > minIndex  ; i--) {
      const r = Math.floor(Math.random() * i);
      const t = array[i];
      array[i] = array[r];
      array[r] = t;
    }

    return array.slice(minIndex, array.length);
  }

  static shuffle<T>(array: readonly T[]): T[] {
    const copy = array.slice();
    let currentIndex = copy.length;

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      const temporary = copy[currentIndex];
      copy[currentIndex] = copy[randomIndex];
      copy[randomIndex] = temporary;
    }

    return copy;
  }

}

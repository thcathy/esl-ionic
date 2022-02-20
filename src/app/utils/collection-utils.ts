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

  static shuffle(array: string[]): string[] {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

}

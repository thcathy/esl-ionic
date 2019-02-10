export class CollectionUtils {

  static randomPick<T>(array: T[], length: number) {
    if (array == null) return [];
    if (array.length <= length) return array;

    const minIndex = array.length - length;
    for (var i = array.length-1; i > minIndex  ; i--)
    {
      var r = Math.floor(Math.random()*i);
      var t = array[i];
      array[i] = array[r];
      array[r] = t;
    }

    return array.slice(minIndex, array.length);
  }

}

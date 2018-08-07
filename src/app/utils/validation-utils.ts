export class ValidationUtils {

  static alphabetOnly(input: string): string {
    return input.replace(/[^A-Za-z]+/g, '');
  }

  static isBlankString(value: string): boolean {
    return !value || value == undefined || value == "" || value.length == 0;
  }

  static wordEqual(input1: string, input2: string) {
    return input1.split(" ").join().split("-").join().toLowerCase()
      == input2.split(" ").join().split("-").join().toLowerCase();
  }

}

export class ValidationUtils {

  static noAlphabet(input: string) : boolean {
    return this.alphabetOnly(input) === '';
  }

  static alphabetOnly(input: string): string {
    return input.replace(/[^A-Za-z]+/g, '');
  }

  static alphabetOnlyToLowerCase(input: string): string {
    return this.alphabetOnly(input).toLowerCase();
  }

  static isBlankString(value: string): boolean {
    return !value || value == undefined || value === '' || value === ' ' || value.length == 0;
  }

  static wordEqual(input1: string, input2: string) {
    return input1.split(" ").join().split("-").join()
      == input2.split(" ").join().split("-").join();
  }

  static punctuationOnly(input: string): string {
    return input.replace(/[^\,\.{3,}…\.\?\!\:\;\-—\(\)\[\]\/\’‘"“”']+/g, '');
  }

}

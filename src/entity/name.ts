

export class Name {
  constructor(
    public lastName: string,
    public firstName: string
  ) { }

  public toString() {
    return JSON.stringify(this);
  }
}

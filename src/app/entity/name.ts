

export class Name {
  constructor(
    public lastName: string,
    public firstName: string
  ) { }

  public fullName() {
    if (this.lastName != null)
      return this.firstName + ' ' + this.lastName;
    else
      return this.firstName;
  }

  public toString() {
    return JSON.stringify(this);
  }
}

import {Observable} from "rxjs";

export class Service {
  handleError(error: any) {
    console.error(error.message);
    return Observable.throw(error._body);
  }

}

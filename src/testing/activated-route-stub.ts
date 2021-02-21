import {convertToParamMap, ParamMap, Params} from '@angular/router';
import {Subject} from 'rxjs';

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setParamMap()` method to add the next `paramMap` value.
 */
export class ActivatedRouteStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `paramMap` observable
  private subject = new Subject<ParamMap>();
  private testParams: ParamMap;

  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }

  /** The mock paramMap observable */
  readonly paramMap = this.subject.asObservable();
  readonly queryParamMap = this.subject.asObservable();

  /** Set the paramMap observables's next value */
  setParamMap(params?: Params) {
    this.setTestParams(params);
  }

  setQueryParamMap(params?: Params) {
    this.setTestParams(params);
  }

  setTestParams(params?: Params) {
    const map = convertToParamMap(params);
    this.testParams = map;
    this.subject.next(map);
  }

  get snapshot() {
    return { paramMap: this.testParams, queryParamMap: this.testParams };
  }
}

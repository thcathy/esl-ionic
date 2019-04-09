import { MemberNamePipe } from './member-name.pipe';
import {Member} from '../../entity/member';
import {Name} from '../../entity/name';

describe('MemberNamePipe', () => {
  it('show last name if exist', () => {
    const pipe = new MemberNamePipe();
    const member = <Member>{
      name: <Name>{ lastName: 'Wong', firstName: 'Timmy' }
    };
    expect(pipe.transform(member)).toBe('Timmy Wong');
  });

  it('show first name only if last name not exist', () => {
    const pipe = new MemberNamePipe();
    const member = <Member>{
      name: <Name>{ firstName: 'Timmy' }
    };
    expect(pipe.transform(member)).toBe('Timmy');
  });

  it('show email if name not exist', () => {
    const pipe = new MemberNamePipe();
    const member = <Member>{
      emailAddress: 'thcathy@gmail.com'
    };
    expect(pipe.transform(member)).toBe('thcathy@gmail.com');

    const member2 = <Member>{
      emailAddress: 'thcathy@gmail.com',
      name: <Name>{ firstName: null, lastName: null}
    };
    expect(pipe.transform(member2)).toBe('thcathy@gmail.com');
  });
});

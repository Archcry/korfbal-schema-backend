import { match } from 'sinon';

export default {
  string: {
    contains: (partOfString: string) => {
      assertType(partOfString, 'string', 'partOfString');
      return match((value: string) => {
        return value.includes(partOfString);
      });
    }
  }
};

const assertType = (value: string, type: string, name: string) => {
  const actual = typeof value;
  if (actual !== type) {
      throw new TypeError(`Expected type of ${name} to be ${type} but was ${actual}`);
  }
};

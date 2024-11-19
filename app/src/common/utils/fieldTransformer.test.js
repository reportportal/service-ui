import { separateFromIntoNameAndEmail, combineNameAndEmailToFrom } from './fieldTransformer';

describe('separateFromIntoNameAndEmail', () => {
  it('should split "from" into "fromName" and "fromEmail" when valid format is provided', () => {
    const input = { from: 'John Doe <john.doe@example.com>' };
    const result = separateFromIntoNameAndEmail(input);
    expect(result).toEqual({
      fromName: 'John Doe',
      fromEmail: 'john.doe@example.com',
    });
  });

  it('should set "fromName" and empty "fromEmail" when "from" does not include <email>', () => {
    const input = { from: 'John Doe' };
    const result = separateFromIntoNameAndEmail(input);
    expect(result).toEqual({
      fromName: 'John Doe',
      fromEmail: '',
    });
  });

  it('should set "fromName" and "fromEmail" to empty strings when "from" is not provided', () => {
    const input = {};
    const result = separateFromIntoNameAndEmail(input);
    expect(result).toEqual({
      fromName: '',
      fromEmail: '',
    });
  });

  it('should leave unrelated fields in the object unchanged', () => {
    const input = { from: 'John Doe <john.doe@example.com>', otherField: 'value' };
    const result = separateFromIntoNameAndEmail(input);
    expect(result).toEqual({
      fromName: 'John Doe',
      fromEmail: 'john.doe@example.com',
      otherField: 'value',
    });
  });
});

describe('combineNameAndEmailToFrom', () => {
  it('should combine "fromName" and "fromEmail" into "from"', () => {
    const input = { fromName: 'John Doe', fromEmail: 'john.doe@example.com' };
    const result = combineNameAndEmailToFrom(input);
    expect(result).toEqual({
      from: 'John Doe <john.doe@example.com>',
    });
  });

  it('should leave unrelated fields in the object unchanged', () => {
    const input = { fromName: 'John Doe', fromEmail: 'john.doe@example.com', otherField: 'value' };
    const result = combineNameAndEmailToFrom(input);
    expect(result).toEqual({
      from: 'John Doe <john.doe@example.com>',
      otherField: 'value',
    });
  });

  it('should not modify the object if "fromName" or "fromEmail" is missing', () => {
    const input1 = { fromName: 'John Doe' };
    const input2 = { fromEmail: 'john.doe@example.com' };
    const input3 = {};

    const result1 = combineNameAndEmailToFrom(input1);
    const result2 = combineNameAndEmailToFrom(input2);
    const result3 = combineNameAndEmailToFrom(input3);

    expect(result1).toEqual({ fromName: 'John Doe' });
    expect(result2).toEqual({ fromEmail: 'john.doe@example.com' });
    expect(result3).toEqual({});
  });
});

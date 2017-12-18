import { runAction } from 'cerebral/test';
import changeValue from './changeValue';

it('should change right field', () => runAction(changeValue, {
  state: {
    testForm: {
      testField: {
        value: '',
      },
    },
  },
  props: {
    formPath: 'testForm',
    fieldName: 'testField',
    value: 'testValue',
  } })
    .then(({ state }) => {
      expect(state.testForm.testField.value).toBe('testValue');
    }),
);

import { runAction } from 'cerebral/test';
import setFocus from './setFocus';

test('should change the value to false', () => runAction(setFocus, {
  state: {
    testForm: {
      testField: {
        isFocus: true,
      },
    },
  },
  props: {
    formPath: 'testForm',
    fieldName: 'testField',
  } })
  .then(({ state }) => {
    expect(state.testForm.testField.isFocus).toBe(true);
  }),
);

test('should change the value to false, if value undefined', () => runAction(setFocus, {
  state: {
    testForm: {
      testField: {
      },
    },
  },
  props: {
    formPath: 'testForm',
    fieldName: 'testField',
  } })
  .then(({ state }) => {
    expect(state.testForm.testField.isFocus).toBe(true);
  }),
);

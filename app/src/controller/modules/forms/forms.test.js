import forms from './forms';

test('should provide a set of signals', () => {
  // TODO use public api
  expect(forms.moduleDescription.signals.changeValue).toBeDefined();
  expect(forms.moduleDescription.signals.setFocus).toBeDefined();
  expect(forms.moduleDescription.signals.setBlur).toBeDefined();
});

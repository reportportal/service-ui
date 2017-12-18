import forms from './forms';

it('should provide a set of signals', () => {
  expect(forms.signals.changeValue).toBeDefined();
  expect(forms.signals.setFocus).toBeDefined();
  expect(forms.signals.setBlur).toBeDefined();
});

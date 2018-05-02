import { shallow } from 'enzyme';
import { Input } from './input';

it('should respond to the change event', () => {
  const value = '2';
  const formPath = 'test path';
  const fieldName = 'field name';
  const onChange = jest.fn();
  const wrapper = shallow(
    <Input formPath={formPath} fieldName={fieldName} onChange={onChange} />,
  );

  wrapper.find('input').simulate('change', {
    target: { value },
  });

  expect(onChange).toBeCalledWith({ target: { value } });
});

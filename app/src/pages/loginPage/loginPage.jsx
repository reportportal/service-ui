import Input from 'components/inputs/input/Input';
import { signal } from 'cerebral/tags';

// eslint-disable-next-line react/prop-types
const LoginPage = ({ submitForm, updateTwitter }) => (
  <div>
    <div style={{ width: '300px', height: '30px', border: '1px solid black' }} >
      <Input formPath={'user.loginForm'} fieldName={'login'} />
    </div>
    <div style={{ width: '300px', height: '30px', border: '1px solid black' }}>
      <Input formPath={'user.loginForm'} fieldName={'password'} />
    </div>
    <button onClick={submitForm}>submit</button>
    <br />
    <button onClick={updateTwitter}>updateTwitter</button>
  </div>

  );

export default Utils.connectToState({
  submitForm: signal`user.loginForm.submitForm`,
  updateTwitter: signal`other.twitter.updateInfo`,
}, LoginPage);

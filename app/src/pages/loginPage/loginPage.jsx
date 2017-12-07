import Input from 'components/inputs/input/Input';

const LoginPage = () => (
  <div>
    <div style={{ width: '300px', height: '30px', border: '1px solid black' }} >
      <Input formPath={'user.loginForm'} fieldName={'login'} />
    </div>
    <div style={{ width: '300px', height: '30px', border: '1px solid black' }}>
      <Input formPath={'user.loginForm'} fieldName={'password'} />
    </div>
  </div>
  );

export default LoginPage;

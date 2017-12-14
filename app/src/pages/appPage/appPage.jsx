
import { signal } from 'cerebral/tags';

// eslint-disable-next-line react/prop-types
const AppPage = ({ logOut, sendNotification }) => (
  <div>
    <button onClick={logOut}>LogOut</button>
    <button onClick={() => {
      sendNotification({ message: 'testMessage', type: 'test' });
    }}
    >send notification</button>
  </div>
);

export default Utils.connectToState({
  logOut: signal`user.logout`,
  sendNotification: signal`app.notification.showMessage`,
}, AppPage);

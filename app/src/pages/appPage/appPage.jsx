import AssignedProjects from 'pages/profilePage/assignedProjectsBlock/assignedProjectsBlock';
import { signal } from 'cerebral/tags';

// eslint-disable-next-line react/prop-types
const AppPage = ({ logOut, sendNotification }) => (
  <div>
    <button onClick={logOut}>LogOut</button>
    <button onClick={() => {
      sendNotification({ message: `testMessage ${(Math.random() * (20 - 0)) + 0}`, type: 'info' });
    }}
    >send notification</button>
    <div style={{ width: '50%', height: 'auto' }}>
      <AssignedProjects projects={[]} />
    </div>
  </div>
);

export default Utils.connectToState({
  logOut: signal`user.logout`,
  sendNotification: signal`app.notification.showMessage`,
}, AppPage);

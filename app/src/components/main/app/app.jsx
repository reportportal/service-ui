import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames/bind';
import { Switch, Route } from 'react-router-dom';
import LocalizationContainer from '../localizationContainer/localizationContainer';
// import styles from './app.scss';

// import Sidebar from '../sidebar/sidebar';
// import Header from '../header/header';
// import Notification from '../notification/notification';
//
// import LoginPage from '../../../pages/loginPage/loginPage';
// import RegistrationPage from '../../../pages/registrationPage/registrationPage';
// import AppPage from '../../../pages/appPage/appPage';


// const cx = classNames.bind(styles);

const AdminLayout = () => (
  <div>
    <h1>admin header</h1>
    <h1>admin sidebar</h1>
    <Switch>
      <Route exec path="/administrate" render={() => (<h1>admin projects page</h1>)} />
      <Route path="/administrate/projects" render={() => (<h1>admin projects page</h1>)} />
      <Route path="/administrate/users" render={() => (<h1>admin Users page</h1>)} />
      <Route path="/administrate/settings" render={() => (<h1>admin settings page</h1>)} />
    </Switch>
  </div>
);

const PageLayout = ({ match }) => {
  console.dir(match);
  return (
    <div className="page-content">
      <p>Page name: <b>{match.params.projectId}</b></p>
      <Switch>
        <Route path="/:projectId" render={() => (<h1>Dashboard page</h1>)} />
        <Route path="/:projectId/dashboard" render={() => (<h1>Dashboard page</h1>)} />
        <Route path="/:projectId/dashboard" render={() => (<h1>Dashboard page</h1>)} />
      </Switch>
    </div>
  );
};
PageLayout.propTypes = {
  match: PropTypes.object.isRequired,
};

const AppLayout = () => (
  <div className="app-layout">
    <h1>App header</h1>
    <h1>App sidebar</h1>
    <div className="page-container">
      <Switch>
        <Route path="/user-profile" render={() => (<h1>profile page</h1>)} />
        <Route path="/api" render={() => (<h1>api page</h1>)} />
        <Route path="/:projectId" component={PageLayout} />
      </Switch>
    </div>
  </div>
);

const App = () => (
  <LocalizationContainer>
    <Switch>
      <Route exact path="/" render={() => (<h1>login page</h1>)} />
      <Route path="/login" render={() => (<h1>login page</h1>)} />
      <Route path="/administrate" component={AdminLayout} />
      <AppLayout />
    </Switch>
  </LocalizationContainer>
  );

export default App;

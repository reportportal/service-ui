import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter, fetch } from 'common/utils';
import { loginAction } from 'controllers/auth';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { URLS } from 'common/urls';
import { RegistrationPage } from './registrationPage';

@connect(null, {
  loginAction,
  showNotification,
})
@connectRouter(({ uuid }) => ({ uuid }))
export class RegistrationPageContainer extends PureComponent {
  static propTypes = {
    uuid: PropTypes.string,
    loginAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
  };
  static defaultProps = {
    uuid: undefined,
  };

  state = {
    isTokenActive: false,
    email: '',
    isLoadingFinished: false,
  };

  componentDidMount() {
    const uuid = this.props.uuid;
    if (!uuid) {
      return;
    }
    fetch(URLS.userRegistration(), { params: { uuid } }).then((data) =>
      this.setState({
        isTokenActive: data.isActive,
        email: data.email,
        isLoadingFinished: true,
      }),
    );
  }

  registrationHandler = ({ name, login, password, email }) => {
    const uuid = this.props.uuid;
    const data = {
      full_name: name,
      login,
      password,
      email,
    };
    return fetch(URLS.userRegistration(), { method: 'post', data, params: { uuid } })
      .then(() => this.props.loginAction({ login, password }))
      .catch((err) => {
        let message;
        const responseData = err.response && err.response.data && err.response.data;

        // TODO remove condition after merging PR #773 (message will be always in err.message)
        if (data && responseData.message) {
          message = responseData.message;
        } else {
          message = err.message;
        }
        this.props.showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message,
        });
        throw message;
      });
  };

  render() {
    const uuid = this.props.uuid;
    return !uuid || this.state.isLoadingFinished ? (
      <RegistrationPage
        tokenProvided={Boolean(uuid)}
        tokenActive={this.state.isTokenActive}
        email={this.state.email}
        onRegistrationSubmit={this.registrationHandler}
      />
    ) : null;
  }
}

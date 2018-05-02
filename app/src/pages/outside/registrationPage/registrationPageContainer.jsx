import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { loginAction } from 'controllers/auth';
import { fetch } from 'common/utils';
import { RegistrationPage } from './registrationPage';

const REGISTRATION_URL = '/api/v1/user/registration';

@connect(null, {
  loginAction,
})
@withRouter
export class RegistrationPageContainer extends PureComponent {
  static propTypes = {
    location: PropTypes.shape({
      hash: PropTypes.string,
      pathname: PropTypes.string,
      query: PropTypes.object,
      search: PropTypes.string,
    }).isRequired,
    loginAction: PropTypes.func.isRequired,
  };

  state = {
    isTokenActive: false,
    email: '',
    isLoadingFinished: false,
  };

  componentDidMount() {
    const uuid = this.props.location.query.uuid;
    if (!uuid) {
      return;
    }
    fetch(REGISTRATION_URL, { params: { uuid } })
      .then(data => this.setState({
        isTokenActive: data.isActive,
        email: data.email,
        isLoadingFinished: true,
      }));
  }

  registrationHandler = ({ name, login, password, email }) => {
    const uuid = this.props.location.query.uuid;
    const data = {
      full_name: name,
      login,
      password,
      email,
    };
    fetch(REGISTRATION_URL, { method: 'post', data, params: { uuid } })
      .then(() => this.props.loginAction({ login, password }));
  };

  render() {
    const uuid = this.props.location.query.uuid;
    return (
      !uuid || this.state.isLoadingFinished
        ? <RegistrationPage
          tokenProvided={Boolean(uuid)}
          tokenActive={this.state.isTokenActive}
          email={this.state.email}
          onRegistrationSubmit={this.registrationHandler}
        />
        : null
    );
  }
}

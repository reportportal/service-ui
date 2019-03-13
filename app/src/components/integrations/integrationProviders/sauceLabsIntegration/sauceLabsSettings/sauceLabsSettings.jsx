import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { SAUCE_LABS_TEST_COMMAND } from 'controllers/log/sauceLabs';
import { projectIdSelector } from 'controllers/pages';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ConnectionSection, IntegrationForm } from '../../../elements';
import { SauceLabsFormFields } from '../sauceLabsFormFields';
import styles from './sauceLabsSettings.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  failedConnectMessage: {
    id: 'SauceLabsSettings.failedConnectMessage',
    defaultMessage: 'Failed connect to Sauce Labs. Please check your credentials!',
  },
});

@connect((state) => ({
  projectId: projectIdSelector(state),
}))
@injectIntl
export class SauceLabsSettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  state = {
    connected: false,
    loading: false,
    updated: false,
  };

  componentDidMount() {
    this.testIntegrationConnection();
  }

  componentDidUpdate() {
    if (this.state.updated && !this.state.loading) {
      this.testIntegrationConnection();
    }
  }

  testIntegrationConnection = () => {
    const {
      data: { id },
      projectId,
    } = this.props;

    this.setState({
      loading: true,
    });

    fetch(URLS.projectIntegrationByIdCommand(projectId, id, SAUCE_LABS_TEST_COMMAND), {
      method: 'put',
      data: {},
    })
      .then((connected) => {
        this.setState({
          connected,
          loading: false,
          updated: false,
        });
      })
      .catch(() => {
        this.setState({
          connected: false,
          loading: false,
          updated: false,
        });
      });
  };

  updateIntegrationHandler = (data, onConfirm) => {
    this.props.onUpdate(data, () => {
      onConfirm();
      this.setState({
        updated: true,
      });
    });
  };

  render() {
    const {
      intl: { formatMessage },
      data,
      goToPreviousPage,
    } = this.props;
    const { loading, connected } = this.state;

    return (
      <div className={cx('sauce-labs-settings')}>
        {loading ? (
          <SpinningPreloader />
        ) : (
          <Fragment>
            <ConnectionSection
              disabled={data.blocked}
              failedConnectionMessage={
                connected ? null : formatMessage(messages.failedConnectMessage)
              }
              integrationId={data.id}
              onRemoveConfirmation={goToPreviousPage}
            />
            <IntegrationForm
              data={data}
              onSubmit={this.updateIntegrationHandler}
              formFieldsComponent={SauceLabsFormFields}
            />
          </Fragment>
        )}
      </div>
    );
  }
}

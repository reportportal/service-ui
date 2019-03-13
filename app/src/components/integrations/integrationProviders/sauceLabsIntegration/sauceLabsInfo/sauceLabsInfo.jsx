import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages } from 'react-intl';
import { SAUCE_LABS } from 'common/constants/integrationNames';
import { integrationNamesTitles } from 'common/constants/integrationNamesTitles';
import { showModalAction } from 'controllers/modal';
import { InfoSection } from '../../../containers/integrationInfoContainer/infoSection';
import { InstancesSection } from '../../../containers/integrationInfoContainer/instancesSection';
import { INTEGRATIONS_IMAGES_MAP } from '../../../constants';
import styles from './sauceLabsInfo.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  description: {
    id: 'SauceLabsInfo.description',
    defaultMessage:
      'Configure an integration with Sauce Labs and watch video of test executions right in the ReportPortal application. For that carry out three easy steps: 1. Configure an  integration with Sauce Labs 2. Add attributes to test items "SLID: N (where N - # of job in Sauce Labs) and SLDC: M (where M is US or EU) 3. Watch video on the log level.',
  },
});

@connect(null, { showModalAction })
export class SauceLabsInfo extends Component {
  static propTypes = {
    onItemClick: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    pluginData: PropTypes.object.isRequired,
    projectIntegrations: PropTypes.array.isRequired,
    globalIntegrations: PropTypes.array.isRequired,
    showModalAction: PropTypes.func.isRequired,
  };

  createNewIntegration = () => {
    this.props.showModalAction({
      id: 'addProjectIntegrationModal',
      data: {
        type: SAUCE_LABS,
      },
    });
  };

  render() {
    const {
      pluginData,
      projectIntegrations,
      globalIntegrations,
      onItemClick,
      onConfirm,
    } = this.props;

    return (
      <div className={cx('sauce-labs-info')}>
        <InfoSection
          image={INTEGRATIONS_IMAGES_MAP[SAUCE_LABS]}
          description={messages.description}
          version={pluginData.details.version}
          title={integrationNamesTitles[SAUCE_LABS]}
        />
        <InstancesSection
          globalIntegrations={globalIntegrations}
          projectIntegrations={projectIntegrations}
          onItemClick={onItemClick}
          onCreateNew={this.createNewIntegration}
          onConfirm={onConfirm}
          type={SAUCE_LABS}
        />
      </div>
    );
  }
}

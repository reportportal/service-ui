import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP, INTEGRATIONS_IMAGES_MAP } from '../../constants';
import styles from './integrationSettingsContainer.scss';

const cx = classNames.bind(styles);

export const IntegrationSettingsContainer = ({ data, goToPreviousPage }) => {
  const integrationName = data.integrationType.name;
  const title = name || 'Integration settings';
  const image = INTEGRATIONS_IMAGES_MAP[integrationName];
  const IntegrationSettingsComponent = INTEGRATIONS_SETTINGS_COMPONENTS_MAP[integrationName];

  return (
    <div className={cx('integration-settings-container')}>
      <div className={cx('settings-header')}>
        <div className={cx('logo-block')}>
          <img className={cx('logo')} src={image} alt={title} />
        </div>
        <h2 className={cx('title')}>{title}</h2>
      </div>
      <IntegrationSettingsComponent data={data} goToPreviousPage={goToPreviousPage} />
    </div>
  );
};

IntegrationSettingsContainer.propTypes = {
  data: PropTypes.object,
  goToPreviousPage: PropTypes.func.isRequired,
};

IntegrationSettingsContainer.defaultProps = {
  data: {},
};

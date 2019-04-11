import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import SauceLabsIcon from 'common/img/plugins/sauce-labs.png';
import SauceLabsActiveIcon from 'common/img/plugins/sauce-labs-active.png';
import { SAUCE_LABS_INTEGRATION_TITLE } from 'components/integrations/integrationProviders/sauceLabsIntegration/constants';
import styles from './sauceLabsIntegrationButton.scss';

const cx = classNames.bind(styles);

export const SauceLabsIntegrationButton = ({ active, onClick }) => (
  <button className={cx('sauce-labs-integration-button', { active })} onClick={onClick}>
    <img
      className={cx('sauce-labs-integration-button--icon')}
      src={active ? SauceLabsActiveIcon : SauceLabsIcon}
      alt={SAUCE_LABS_INTEGRATION_TITLE}
      title={SAUCE_LABS_INTEGRATION_TITLE}
    />
    <div className={cx('sauce-labs-integration-button--label')}>{SAUCE_LABS_INTEGRATION_TITLE}</div>
  </button>
);

SauceLabsIntegrationButton.propTypes = {
  onClick: PropTypes.func,
  active: PropTypes.bool,
};

SauceLabsIntegrationButton.defaultProps = {
  onClick: () => {},
  active: false,
};

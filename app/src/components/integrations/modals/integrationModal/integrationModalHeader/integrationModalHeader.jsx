import React from 'react';
import Parser from 'html-react-parser';
import CloseIcon from 'common/img/cross-icon-inline.svg';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { INTEGRATIONS_IMAGES_MAP } from 'components/integrations/constants';
import styles from './integrationModalHeader.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  integrationName: {
    id: 'IntegrationModalHeader.integrationName',
    defaultMessage: '{integration} settings',
  },
});

export const IntegrationModalHeader = injectIntl(({ intl, integrationType, onClose }) => (
  <div className={cx('integration-modal-header')}>
    <div className={cx('close-modal-icon')} onClick={onClose}>
      {Parser(CloseIcon)}
    </div>
    <div className={cx('integration-block')}>
      <img
        className={cx('integration-image')}
        src={INTEGRATIONS_IMAGES_MAP[integrationType.name]}
        alt={integrationType.name}
      />
      <div className={cx('integration-info')}>
        <span className={cx('integration-name')}>
          {intl.formatMessage(messages.integrationName, {
            integration: integrationType.name,
          })}
        </span>
      </div>
    </div>
  </div>
));
IntegrationModalHeader.propTypes = {
  integrationType: PropTypes.object,
  onClose: PropTypes.func,
};
IntegrationModalHeader.defaultProps = {
  integrationType: {},
  onClose: () => {},
};

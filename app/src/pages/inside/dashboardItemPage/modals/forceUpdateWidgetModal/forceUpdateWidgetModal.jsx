/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './forceUpdateWidgetModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  forceUpdateWidgetHeader: {
    id: 'ForceUpdateWidgetModal.forceUpdateWidgetHeader',
    defaultMessage: 'Update widget data',
  },
  forceUpdateWidgetText: {
    id: 'ForceUpdateWidgetModal.deleteWidgetText',
    defaultMessage:
      'Are you sure you want to update data in this widget? It could take <b>up to 15 minutes</b> depend on a database size on the project.',
  },
});

@withModal('forceUpdateWidgetModal')
@injectIntl
export class ForceUpdateWidgetModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
    }),
  };

  static defaultProps = {
    data: {
      widget: {},
      onConfirm: () => {},
    },
  };

  render() {
    const { intl } = this.props;
    const { onConfirm } = this.props.data;
    const confirmAndClose = (closeModal) => {
      onConfirm();
      closeModal();
    };
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.UPDATE),
      onClick: confirmAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.forceUpdateWidgetHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('message')}>
          {Parser(intl.formatMessage(messages.forceUpdateWidgetText))}
        </p>
      </ModalLayout>
    );
  }
}

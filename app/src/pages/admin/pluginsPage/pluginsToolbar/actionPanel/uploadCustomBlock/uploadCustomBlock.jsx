import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { AttributeListField } from 'components/main/attributeList';
import { ModalField } from 'components/main/modal';
import styles from './uploadCustomBlock.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  initializationParamsLabel: {
    id: 'UploadCustomBlock.initializationParamsLabel',
    defaultMessage: 'Initialization parameters',
  },
});

@injectIntl
export class UploadCustomBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.array,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    value: [],
    onChange: () => {},
  };

  render() {
    const {
      intl: { formatMessage },
      value,
      onChange,
    } = this.props;

    return (
      <div className={cx('upload-custom-block')}>
        <ModalField label={formatMessage(messages.initializationParamsLabel)}>
          <AttributeListField value={value} onChange={onChange} />
        </ModalField>
      </div>
    );
  }
}

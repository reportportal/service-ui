import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { FIELD_LABEL_WIDTH } from '../../constants';
import styles from './customColumnItem.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  label: {
    id: 'CustomColumnItem.label',
    defaultMessage: 'Custom column',
  },
  namePlaceholder: {
    id: 'CustomColumnItem.namePlaceholder',
    defaultMessage: 'Column name',
  },
  prefixPlaceholder: {
    id: 'CustomColumnItem.prefixPlaceholder',
    defaultMessage: 'Tag prefix',
  },
});

@injectIntl
export class CustomColumnItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    name: PropTypes.string,
    prefix: PropTypes.string,
    index: PropTypes.number,
    last: PropTypes.bool,
    onRemove: PropTypes.func,
    onChange: PropTypes.func,
    noRemove: PropTypes.bool,
  };
  static defaultProps = {
    name: '',
    prefix: '',
    index: 0,
    last: false,
    onRemove: () => {},
    onChange: () => {},
    noRemove: false,
  };
  onRemove = () => {
    const { index, onRemove, noRemove } = this.props;
    !noRemove && onRemove(index);
  };
  onChangeName = (e) => {
    const { index, onChange, prefix } = this.props;
    onChange({ name: e.target.value, value: prefix }, index);
  };
  onChangePrefix = (e) => {
    const { index, onChange, name } = this.props;
    onChange({ name, value: e.target.value }, index);
  };
  render() {
    const { intl, name, prefix, index, last, noRemove } = this.props;
    return (
      <ModalField
        className={cx({ 'last-custom-column-field': last })}
        label={`${intl.formatMessage(messages.label)} ${index + 1}`}
        labelWidth={FIELD_LABEL_WIDTH}
      >
        <div className={cx('custom-column-item')}>
          <Input
            className={cx('name-input')}
            value={name}
            placeholder={intl.formatMessage(messages.namePlaceholder)}
            onChange={this.onChangeName}
          />
          <Input
            className={cx('prefix-input')}
            value={prefix}
            placeholder={intl.formatMessage(messages.prefixPlaceholder)}
            onChange={this.onChangePrefix}
          />
          <div className={cx('remove-icon', { 'no-remove': noRemove })} onClick={this.onRemove}>
            {!noRemove && Parser(CrossIcon)}
          </div>
        </div>
      </ModalField>
    );
  }
}

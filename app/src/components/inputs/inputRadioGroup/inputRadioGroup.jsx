import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { InputRadio } from 'components/inputs/inputRadio';
import styles from './inputRadioGroup.scss';

const cx = classNames.bind(styles);

@injectIntl
export class InputRadioGroup extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        ownValue: PropTypes.string.isRequired,
        label: PropTypes.shape({
          id: PropTypes.string.isRequired,
          defaultMessage: PropTypes.string.isRequired,
        }),
      }),
    ),
    inline: PropTypes.bool,
  };
  static defaultProps = {
    options: [],
    inline: false,
  };
  renderRadioInputs = () => {
    const {
      options,
      value,
      intl: { formatMessage },
    } = this.props;
    return options.map((item, index) => {
      const { label, ownValue, ...rest } = item;
      const onChange = () => this.props.onChange(ownValue);
      return (
        <div
          className={cx([
            'radio-group-item',
            {
              'radio-group-item-first': index === 0,
            },
          ])}
          key={label.id}
        >
          <InputRadio value={value} ownValue={ownValue} onChange={onChange} {...rest}>
            {formatMessage(label)}
          </InputRadio>
        </div>
      );
    });
  };
  render() {
    const { inline } = this.props;
    return (
      <div
        className={cx(['radio-group'], {
          'radio-group-inline': inline,
        })}
      >
        {this.renderRadioInputs()}
      </div>
    );
  }
}

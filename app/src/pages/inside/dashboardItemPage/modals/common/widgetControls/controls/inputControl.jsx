import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ModalField } from 'components/main/modal';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FIELD_LABEL_WIDTH } from './constants';
import styles from './inputControl.scss';

const cx = classNames.bind(styles);

export const InputControl = ({ fieldLabel, inputWidth, tip, inputBadge, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH} tip={tip}>
    <div style={{ width: inputWidth || 'unset' }}>
      <FieldErrorHint {...rest}>
        <Fragment>
          <Input {...rest} />
          {inputBadge && <span className={cx('input-badge')}>{inputBadge}</span>}
        </Fragment>
      </FieldErrorHint>
    </div>
  </ModalField>
);
InputControl.propTypes = {
  fieldLabel: PropTypes.string,
  tip: PropTypes.string,
  inputWidth: PropTypes.number,
  inputBadge: PropTypes.string,
};
InputControl.defaultProps = {
  fieldLabel: '',
  tip: '',
  inputWidth: null,
  inputBadge: '',
};

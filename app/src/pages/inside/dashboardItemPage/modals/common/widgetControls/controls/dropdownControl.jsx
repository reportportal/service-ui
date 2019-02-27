import PropTypes from 'prop-types';
import { ModalField } from 'components/main/modal';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FIELD_LABEL_WIDTH } from './constants';

export const DropdownControl = ({ fieldLabel, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH}>
    <FieldErrorHint hintType={'top'} {...rest}>
      <InputDropdown independentGroupSelection />
    </FieldErrorHint>
  </ModalField>
);
DropdownControl.propTypes = {
  fieldLabel: PropTypes.string,
};
DropdownControl.defaultProps = {
  fieldLabel: '',
};

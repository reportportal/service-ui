import PropTypes from 'prop-types';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { ModalField } from 'components/main/modal';
import { FIELD_LABEL_WIDTH } from './constants';

export const CheckboxControl = ({ fieldLabel, text, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH}>
    <InputCheckbox {...rest}>{text}</InputCheckbox>
  </ModalField>
);
CheckboxControl.propTypes = {
  fieldLabel: PropTypes.string,
  text: PropTypes.string,
};
CheckboxControl.defaultProps = {
  fieldLabel: '',
  text: 'null',
};

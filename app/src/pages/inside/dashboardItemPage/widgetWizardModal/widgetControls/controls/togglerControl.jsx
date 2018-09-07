import PropTypes from 'prop-types';
import { ModalField } from 'components/main/modal';
import { ToggleButton } from 'components/buttons/toggleButton';
import { FIELD_LABEL_WIDTH } from './constants';

export const TogglerControl = ({ fieldLabel, ...rest }) => (
  <ModalField label={fieldLabel} labelWidth={FIELD_LABEL_WIDTH}>
    <ToggleButton {...rest} />
  </ModalField>
);
TogglerControl.propTypes = {
  fieldLabel: PropTypes.string,
};
TogglerControl.defaultProps = {
  fieldLabel: '',
};

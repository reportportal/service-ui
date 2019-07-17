import PropTypes from 'prop-types';
import { IntegrationSettings } from 'components/integrations/elements';
import { SamlFormFields } from '../samlFormFields';

export const SamlSettings = ({ data, goToPreviousPage, onUpdate, isGlobal }) => (
  <IntegrationSettings
    data={data}
    onUpdate={onUpdate}
    goToPreviousPage={goToPreviousPage}
    isGlobal={isGlobal}
    formFieldsComponent={SamlFormFields}
  />
);

SamlSettings.propTypes = {
  data: PropTypes.object.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isGlobal: PropTypes.bool,
};
SamlSettings.defaultProps = {
  isGlobal: false,
};

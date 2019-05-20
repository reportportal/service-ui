import PropTypes from 'prop-types';
import { IntegrationSettings } from 'components/integrations/elements';
import { SauceLabsFormFields } from '../sauceLabsFormFields';

export const SauceLabsSettings = ({ data, goToPreviousPage, onUpdate }) => (
  <IntegrationSettings
    data={data}
    onUpdate={onUpdate}
    goToPreviousPage={goToPreviousPage}
    formFieldsComponent={SauceLabsFormFields}
  />
);

SauceLabsSettings.propTypes = {
  data: PropTypes.object.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

import PropTypes from 'prop-types';
import { IntegrationSettings } from 'components/integrations/elements';
import { SauceLabsFormFields } from '../sauceLabsFormFields';

export const SauceLabsSettings = ({ data, goToPreviousPage, onUpdate, isGlobal }) => (
  <IntegrationSettings
    data={data}
    onUpdate={onUpdate}
    goToPreviousPage={goToPreviousPage}
    isGlobal={isGlobal}
    formFieldsComponent={SauceLabsFormFields}
  />
);

SauceLabsSettings.propTypes = {
  data: PropTypes.object.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isGlobal: PropTypes.bool,
};
SauceLabsSettings.defaultProps = {
  isGlobal: false,
};

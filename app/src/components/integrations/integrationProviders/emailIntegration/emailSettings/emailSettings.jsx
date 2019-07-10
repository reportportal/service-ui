import PropTypes from 'prop-types';
import { IntegrationSettings } from 'components/integrations/elements';
import { EmailFormFields } from '../emailFormFields';

export const EmailSettings = ({ data, goToPreviousPage, onUpdate, isGlobal }) => (
  <IntegrationSettings
    data={data}
    onUpdate={onUpdate}
    goToPreviousPage={goToPreviousPage}
    isGlobal={isGlobal}
    formFieldsComponent={EmailFormFields}
  />
);

EmailSettings.propTypes = {
  data: PropTypes.object.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isGlobal: PropTypes.bool,
};
EmailSettings.defaultProps = {
  isGlobal: false,
};

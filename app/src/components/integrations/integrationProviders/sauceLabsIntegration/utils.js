import {
  SAUCE_LABS_DATA_CENTER_ATTRIBUTE_KEY,
  SAUCE_LABS_ID_ATTRIBUTE_KEY,
  DEFAULT_DATA_CENTER,
} from './constants';

const getIntegrationDataCenter = (
  integrations = [{ integrationParameters: { dataCenter: DEFAULT_DATA_CENTER } }],
) => (integrations[0] && integrations[0].integrationParameters.dataCenter) || DEFAULT_DATA_CENTER;

export const getSauceLabsConfig = (attributes = [], integrations) => {
  const slidItem =
    attributes && attributes.find((item) => item.key === SAUCE_LABS_ID_ATTRIBUTE_KEY);
  if (slidItem) {
    const sldcItem = attributes.find((item) => item.key === SAUCE_LABS_DATA_CENTER_ATTRIBUTE_KEY);
    const dataCenter = sldcItem ? sldcItem.value : getIntegrationDataCenter(integrations);

    return {
      jobId: slidItem.value,
      dataCenter,
    };
  }
  return null;
};

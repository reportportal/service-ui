import { SAUCE_LABS_DATA_CENTER_ATTRIBUTE_KEY, SAUCE_LABS_ID_ATTRIBUTE_KEY } from './constants';

export const getSauceLabsConfig = (attributes = []) => {
  const slidItem =
    attributes && attributes.find((item) => item.key === SAUCE_LABS_ID_ATTRIBUTE_KEY);
  if (slidItem) {
    const sldcItem = attributes.find((item) => item.key === SAUCE_LABS_DATA_CENTER_ATTRIBUTE_KEY);
    return {
      jobId: slidItem.value,
      dataCenter: sldcItem ? sldcItem.value : '',
    };
  }
  return null;
};

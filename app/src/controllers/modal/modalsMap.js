const modalsMap = {
};

export const addModal = (modalName, component) => {
  modalsMap[modalName] = component;
};
export const getModal = modalName => modalsMap[modalName];

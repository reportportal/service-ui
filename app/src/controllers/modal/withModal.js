import { addModal } from './modalsMap';

export const withModal = name => (component) => {
  addModal(name, component);
  return component;
};

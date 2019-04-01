import { SHOW_MODAL, HIDE_MODAL, CONFIRM_MODAL } from './constants';

export const showModalAction = ({ id, data }) => ({
  type: SHOW_MODAL,
  payload: {
    activeModal: { id, data },
  },
});
export const hideModalAction = () => ({
  type: HIDE_MODAL,
});

export const confirmModalAction = () => ({
  type: CONFIRM_MODAL,
});

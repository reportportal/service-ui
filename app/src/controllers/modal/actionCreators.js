import { SHOW_MODAL, HIDE_MODAL } from './constants';


export const showModalAction = ({ modalType }) => ({
  type: SHOW_MODAL,
  payload: {
    activeModal: modalType,
  },
});
export const hideModalAction = () => ({
  type: HIDE_MODAL,
  payload: {
    activeModal: null,
  },
});


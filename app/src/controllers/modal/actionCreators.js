import { SHOW_MODAL, HIDE_MODAL } from './constants';


export const showModalAction = ({ modalId, modalData }) => ({
  type: SHOW_MODAL,
  payload: {
    activeModal: { id: modalId, data: modalData },
  },
});
export const hideModalAction = () => ({
  type: HIDE_MODAL,
  payload: {
    activeModal: null,
  },
});


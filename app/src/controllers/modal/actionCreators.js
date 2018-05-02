import { SHOW_MODAL, HIDE_MODAL } from './constants';


export const showModalAction = ({ id, data }) => ({
  type: SHOW_MODAL,
  payload: {
    activeModal: { id, data },
  },
});
export const hideModalAction = () => ({
  type: HIDE_MODAL,
  payload: {
    activeModal: null,
  },
});


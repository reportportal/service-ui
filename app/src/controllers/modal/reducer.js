import { SHOW_MODAL, HIDE_MODAL } from './constants';

export const modalReducer = (state = { activeModal: null }, { type, payload }) => {
  switch (type) {
    case SHOW_MODAL:
      return Object.assign({}, state, { activeModal: payload.activeModal });
    case HIDE_MODAL:
      return Object.assign({}, state, { activeModal: null });
    default:
      return state;
  }
};

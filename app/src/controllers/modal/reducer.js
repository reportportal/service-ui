import { SHOW_MODAL, HIDE_MODAL, INITIAL_STATE } from './constants';

export const modalReducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case SHOW_MODAL:
      return { ...state, activeModal: payload.activeModal };
    case HIDE_MODAL:
      return { ...state, activeModal: null };
    default:
      return state;
  }
};

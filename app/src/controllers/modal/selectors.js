const modalSelector = (state) => state.modal || {};
export const activeModalSelector = (state) => modalSelector(state).activeModal;

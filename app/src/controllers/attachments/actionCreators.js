import { GET_ATTACHMENT_IMAGE, GET_ATTACHMENT_HAR, GET_ATTACHMENT_BINARY } from './constants';

export const openImageModal = (payload) => ({
  type: GET_ATTACHMENT_IMAGE,
  payload,
});

export const openHarModal = (payload) => ({
  type: GET_ATTACHMENT_HAR,
  payload,
});

export const openBinaryModal = (payload) => ({
  type: GET_ATTACHMENT_BINARY,
  payload,
});

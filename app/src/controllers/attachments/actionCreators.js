import { GET_ATTACHMENT_IMAGE, GET_ATTACHMENT_HAR, GET_ATTACHMENT_BINARY } from './constants';

export const openImageModalAction = (payload) => ({
  type: GET_ATTACHMENT_IMAGE,
  payload,
});

export const openHarModalAction = (payload) => ({
  type: GET_ATTACHMENT_HAR,
  payload,
});

export const openBinaryModalAction = (payload) => ({
  type: GET_ATTACHMENT_BINARY,
  payload,
});

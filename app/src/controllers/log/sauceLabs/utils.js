import CryptoJS from 'crypto-js';

export const generateAuthToken = (username, accessToken, jobId) => {
  const hash = CryptoJS.algo.HMAC.create(CryptoJS.algo.MD5, `${username}:${accessToken}`);
  hash.update(jobId);
  return hash.finalize().toString(CryptoJS.enc.Hex);
};

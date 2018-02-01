export const email = (emailValue) => {
  return /^[a-z0-9._-]+@[a-z0-9_-]+?\.[a-z0-9]{2,}$/i.exec(emailValue);
};

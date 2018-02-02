export const email = emailValue => !!/^[a-z0-9.+_-]+@[a-z0-9_.-]+?\.[a-z0-9]{2,}$/i.exec(emailValue);
export const password = passwordValue => !!/^(.){4,25}$/.exec(passwordValue);

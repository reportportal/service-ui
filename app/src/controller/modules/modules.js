import StorageModule from '@cerebral/storage';
import user from './user/user';
import app from './app/app';
import forms from './forms/forms';
import router, { route } from './router/router';
import other from './other/other';

export default {
  user,
  app,
  forms,
  route,
  router,
  other,
  storage: StorageModule({
    target: localStorage,
    json: true,
  }),
};

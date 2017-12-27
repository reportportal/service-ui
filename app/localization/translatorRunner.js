import manageTranslations from 'react-intl-translations-manager';

manageTranslations({
  messagesDirectory: 'localization/messages',
  translationsDirectory: 'localization/translated/',
  languages: ['ru'], // any language you need
});

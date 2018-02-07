import manageTranslations from 'react-intl-translations-manager';

manageTranslations({
  messagesDirectory: 'localization/messages',
  translationsDirectory: 'localization/translated/',
  languages: ['ru', 'be'], // any language you need
});

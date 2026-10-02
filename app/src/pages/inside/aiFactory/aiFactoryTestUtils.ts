/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

interface TestMessageDescriptor {
  defaultMessage: string;
}

const formatTestMessage = (
  message: TestMessageDescriptor,
  values: Record<string, string | number> = {},
) => {
  let formattedMessage = message.defaultMessage;

  Object.entries(values).forEach(([key, value]) => {
    formattedMessage = formattedMessage.replace(`{${key}}`, String(value));
  });

  return formattedMessage;
};

export const reactIntlTestMock = {
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({ formatMessage: formatTestMessage }),
};

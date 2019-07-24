import { COMMAND_FIELD, PARAMETERS_FIELD, RESPONSE_FIELD } from './constants';
import { messages } from './messages';

export const buildAssetLink = (prefix, asset, token) => `${prefix}${asset}?auth=${token}`;

export const getCommandBlockConfig = (command) => {
  const { method, path, request, result, HTTPStatus } = command;

  const response = (
    <div>
      <div>HTTP status: {HTTPStatus}</div>
      {JSON.stringify(result)}
    </div>
  );

  return [
    {
      id: COMMAND_FIELD,
      title: messages.commandTitle,
      content: `${method} ${path}`,
    },
    {
      id: PARAMETERS_FIELD,
      title: messages.parametersTitle,
      content: `${JSON.stringify(request)}`,
    },
    {
      id: RESPONSE_FIELD,
      title: messages.responseTitle,
      content: response,
    },
  ];
};

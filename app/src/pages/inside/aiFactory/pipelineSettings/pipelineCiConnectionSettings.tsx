/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, FieldText, SystemMessage } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  updatePipelineCiConnectionAction,
  type PipelineCiConnection,
  type PipelineCiTarget,
  type ReducedPipeline,
} from 'controllers/aiFactory/pipelines';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';

import {
  getCiDraftErrors,
  getCiFormKind,
  readCiCheck,
  readCiSettings,
  requiresReplacementCredential,
  toCiDraft,
  toCiPayload,
  type PipelineCiCheck,
  type PipelineCiDraft,
  type PipelineCiFormKind,
  type PipelineCiSettings,
} from './pipelineCiConnectionForm';
import { PipelineCiConnectionStatus } from './pipelineCiConnectionStatus';
import { messages } from './messages';
import styles from './pipelineCiConnectionSettings.scss';

const cx = classNames.bind(styles);

type CiOperation = 'save' | 'test' | 'remove';

interface PipelineCiConnectionSettingsProps extends PipelineCiTarget {
  pipeline: ReducedPipeline;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}

interface PipelineCiConnectionOverviewProps {
  connection?: PipelineCiConnection;
}

interface CiFieldsProps {
  disabled: boolean;
  draft: PipelineCiDraft;
  credentialControls: ReactNode;
  showCredentialInput: boolean;
  kind: PipelineCiFormKind;
  onChange: (draft: PipelineCiDraft) => void;
}

interface CiRowProps {
  label: string;
  fieldId?: string;
  children: ReactNode;
}

const fieldMessages = {
  repository: { label: messages.ciRepository, error: messages.ciRepositoryHint },
  generation: { label: messages.ciGenerationJob, error: messages.ciJobNameRequired },
  fix: { label: messages.ciFixJob, error: messages.ciJobNameRequired },
  automation: { label: messages.ciAutomationJob, error: messages.ciJobNameRequired },
  jobs: { label: messages.ciJobs, error: messages.ciJobsHint, help: messages.ciJobsHint },
  environments: {
    label: messages.ciEnvironments,
    error: messages.ciOrderedListError,
    help: messages.ciOrderedListHint,
  },
  models: {
    label: messages.ciModels,
    error: messages.ciOrderedListError,
    help: messages.ciOrderedListHint,
  },
};

const fieldsByKind: Record<PipelineCiFormKind, Array<keyof typeof fieldMessages>> = {
  generation: ['generation', 'fix', 'models'],
  automation: ['automation'],
  other: ['jobs'],
};

const descriptionByKind = {
  generation: messages.ciGenerationDescription,
  automation: messages.ciAutomationDescription,
  other: messages.ciDescription,
};

const reasonMessages = {
  NO_CREDENTIAL: messages.ciNoCredential,
  REPOSITORY_OR_CREDENTIAL_INVALID: messages.ciInvalidRepositoryOrCredential,
  UNREACHABLE: messages.ciUnreachable,
  UNEXPECTED_RESPONSE: messages.ciUnexpectedResponse,
};

const operationMessages = {
  save: 'ciSaveFailed',
  remove: 'ciRemoveCredentialFailed',
  test: 'ciTestFailed',
} as const;

export const PipelineCiConnectionOverview = ({ connection }: PipelineCiConnectionOverviewProps) => {
  const { formatMessage } = useIntl();
  return (
    <section className={cx('ci-settings')}>
      <div className={cx('ci-settings__heading')}>
        <h2 className={cx('ci-settings__title')}>{formatMessage(messages.ciTitle)}</h2>
        <PipelineCiConnectionStatus state={connection?.state} emphasis />
      </div>
      <p className={cx('ci-settings__note')}>{formatMessage(messages.ciOnlyForManagers)}</p>
    </section>
  );
};

const CiRow = ({ label, fieldId, children }: CiRowProps) => {
  const className = cx('ci-settings__label');
  return (
    <div className={cx('ci-settings__row')}>
      {fieldId ? (
        <label className={className} htmlFor={fieldId}>
          {label}
        </label>
      ) : (
        <span className={className}>{label}</span>
      )}
      <div className={cx('ci-settings__control')}>{children}</div>
    </div>
  );
};

const CiFields = ({
  disabled,
  draft,
  credentialControls,
  showCredentialInput,
  kind,
  onChange,
}: CiFieldsProps) => {
  const { formatMessage } = useIntl();
  const [touched, setTouched] = useState<Partial<Record<keyof typeof fieldMessages, boolean>>>({});
  const errors = getCiDraftErrors(draft, kind);

  const field = (name: keyof typeof fieldMessages) => {
    const copy = fieldMessages[name];
    const error = errors[name] && touched[name] ? formatMessage(copy.error) : undefined;
    const fieldId = `pipeline-ci-${name}`;
    const hint =
      name === 'environments' && kind === 'automation'
        ? messages.ciAutomationEnvironmentsHint
        : 'help' in copy && copy.help;
    return (
      <CiRow key={name} label={formatMessage(copy.label)} fieldId={fieldId}>
        <FieldText
          className={cx('ci-settings__input')}
          id={fieldId}
          name={name}
          data-automation-id={`pipelineCiField-${name}`}
          title={name === 'repository' ? draft.repository || undefined : undefined}
          helpText={hint ? formatMessage(hint) : undefined}
          classNameHelpText={cx('ci-settings__note')}
          error={error}
          touched={Boolean(error)}
          aria-required
          defaultWidth={false}
          value={draft[name]}
          disabled={disabled}
          onBlur={() => setTouched({ ...touched, [name]: true })}
          onChange={(event) => onChange({ ...draft, [name]: event.target.value })}
        />
      </CiRow>
    );
  };

  return (
    <div className={cx('ci-settings__fields')}>
      <CiRow label={formatMessage(messages.ciProvider)} fieldId="pipeline-ci-provider">
        <FieldText
          className={cx('ci-settings__input')}
          id="pipeline-ci-provider"
          value="GitLab"
          defaultWidth={false}
          disabled
        />
      </CiRow>
      {field('repository')}
      <CiRow label={formatMessage(messages.ciBranch)} fieldId="pipeline-ci-branch">
        <FieldText
          className={cx('ci-settings__input')}
          id="pipeline-ci-branch"
          name="branch"
          data-automation-id="pipelineCiField-branch"
          value={draft.branch}
          placeholder="main"
          defaultWidth={false}
          disabled={disabled}
          onChange={(event) => onChange({ ...draft, branch: event.target.value })}
        />
      </CiRow>
      <CiRow
        label={formatMessage(messages.ciCredential)}
        fieldId={showCredentialInput ? 'pipeline-ci-credential' : undefined}
      >
        {credentialControls}
      </CiRow>
      {fieldsByKind[kind].map((name) => field(name))}
      {field('environments')}
    </div>
  );
};

const CiVerdict = ({ check, isTestResult }: { check: PipelineCiCheck; isTestResult: boolean }) => {
  const { formatMessage } = useIntl();
  const date = check.checkedAt ? new Date(check.checkedAt) : undefined;
  const hasDate = date && Number.isFinite(date.getTime());
  if (!isTestResult && !check.reasonCode && !hasDate) return null;

  return (
    <div className={cx('ci-settings__note')} aria-live="polite">
      {isTestResult && (
        <div className={cx('ci-settings__heading')}>
          {formatMessage(messages.ciTestResult)}
          <PipelineCiConnectionStatus state={check.state} />
        </div>
      )}
      {check.reasonCode && <div>{formatMessage(reasonMessages[check.reasonCode])}</div>}
      {hasDate && (
        <time dateTime={check.checkedAt}>{formatMessage(messages.ciCheckedAt, { date })}</time>
      )}
    </div>
  );
};

const loadCiSettings = async (endpoint: string, signal: AbortSignal) =>
  readCiSettings(await fetch(endpoint, { signal }));

export const PipelineCiConnectionSettings = ({
  projectKey,
  pipelineId,
  pipeline,
  disabled,
  onBusyChange,
}: PipelineCiConnectionSettingsProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const endpoint = URLS.pipelineCiConnection(projectKey, pipelineId);
  const kind = getCiFormKind(pipeline);
  const [attempt, setAttempt] = useState(0);
  const [settings, setSettings] = useState<PipelineCiSettings | null>();
  const [draft, setDraft] = useState<PipelineCiDraft>();
  const [verdict, setVerdict] = useState<PipelineCiCheck>();
  const [feedback, setFeedback] = useState<{
    mode: 'info' | 'error';
    message: keyof typeof messages;
  }>();
  const [isBusy, setIsBusy] = useState(false);
  const [isReplacingCredential, setIsReplacingCredential] = useState(false);
  const running = useRef<AbortController>();

  useEffect(() => {
    const controller = new AbortController();
    loadCiSettings(endpoint, controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return;
        setSettings(loaded);
        setDraft(toCiDraft(loaded));
      })
      .catch(() => {
        if (!controller.signal.aborted) setSettings(null);
      });

    return () => controller.abort();
  }, [attempt, endpoint]);

  useEffect(
    () => () => {
      running.current?.abort();
      if (running.current) onBusyChange(false);
    },
    [onBusyChange],
  );

  const hasChanges =
    draft && settings && JSON.stringify(draft) !== JSON.stringify(toCiDraft(settings));
  const credentialInherited =
    Boolean(settings?.credentialSaved) && Object.keys(settings?.jobs ?? {}).length === 0;
  const isLocked = disabled || isBusy;
  const replacementRequired = Boolean(
    draft && settings && requiresReplacementCredential(draft, settings),
  );
  const showCredentialInput =
    !settings?.credentialSaved ||
    replacementRequired ||
    isReplacingCredential ||
    Boolean(draft?.credential);
  const canSave = Boolean(
    draft &&
    hasChanges &&
    (!replacementRequired || draft.credential.trim()) &&
    !Object.values(getCiDraftErrors(draft, kind)).some(Boolean) &&
    !isLocked,
  );

  const applyResponse = (next: PipelineCiSettings) => {
    setSettings(next);
    setDraft(toCiDraft(next));
    setIsReplacingCredential(false);
    dispatch(
      updatePipelineCiConnectionAction({
        projectKey,
        pipelineId,
        connection: { state: next.state, canStartJobs: next.canStartJobs },
      }),
    );
  };

  const test = async (signal: AbortSignal) => {
    const check = readCiCheck(await fetch(`${endpoint}/test`, { method: 'POST', signal }));
    if (signal.aborted) return;
    setVerdict(check);
    const next = await loadCiSettings(endpoint, signal);
    if (!signal.aborted) applyResponse(next);
  };

  const run = async (operation: CiOperation) => {
    if (!settings || !draft || isLocked || running.current) return;
    const controller = new AbortController();
    const { signal } = controller;
    running.current = controller;
    setIsBusy(true);
    onBusyChange(true);
    setFeedback(undefined);
    setVerdict(undefined);

    try {
      if (operation === 'test') {
        await test(signal);
      } else {
        const response =
          operation === 'save'
            ? await fetch(endpoint, {
                method: 'PUT',
                data: toCiPayload(draft, settings, kind),
                signal,
              })
            : await fetch(`${endpoint}/credential`, { method: 'DELETE', signal });
        if (signal.aborted) return;
        const next = readCiSettings(response);
        applyResponse(next);
        const removeMessage = next.credentialSaved
          ? 'ciCredentialStillSaved'
          : 'ciCredentialRemoved';
        setFeedback({
          mode: 'info',
          message: operation === 'save' ? 'ciSaved' : removeMessage,
        });
      }
    } catch {
      if (!signal.aborted) {
        setFeedback({ mode: 'error', message: operationMessages[operation] });
      }
    } finally {
      running.current = undefined;
      if (!signal.aborted) {
        setIsBusy(false);
        onBusyChange(false);
      }
    }
  };

  return (
    <section className={cx('ci-settings', 'ci-settings__card')} aria-busy={isBusy}>
      <div className={cx('ci-settings__heading')}>
        <h2 className={cx('ci-settings__title')}>{formatMessage(messages.ciTitle)}</h2>
        {(settings || pipeline.ciConnection) && (
          <PipelineCiConnectionStatus
            state={settings?.state ?? pipeline.ciConnection?.state}
            emphasis
          />
        )}
        <p className={cx('ci-settings__note', 'ci-settings__permission')}>
          {formatMessage(messages.ciOnlyForManagers)}
        </p>
      </div>
      <AiDetailsSectionState
        className={cx('ci-settings')}
        isLoading={settings === undefined}
        isError={settings === null}
        loadingLabel={formatMessage(messages.ciLoad)}
        errorMessage={formatMessage(messages.ciLoadFailed)}
        retryLabel={formatMessage(messages.liveRetry)}
        retryAutomationId="retryPipelineCiConnection"
        onRetry={() => {
          setSettings(undefined);
          setAttempt((previous) => previous + 1);
        }}
      >
        {draft && settings && (
          <form
            className={cx('ci-settings')}
            onSubmit={(event) => {
              event.preventDefault();
              if (canSave) void run('save');
            }}
          >
            <p className={cx('ci-settings__description')}>
              {formatMessage(descriptionByKind[kind])}
            </p>
            <CiFields
              disabled={isLocked}
              draft={draft}
              showCredentialInput={showCredentialInput}
              kind={kind}
              onChange={setDraft}
              credentialControls={
                <>
                  {settings.credentialSaved && (
                    <div className={cx('ci-settings__credential-status')}>
                      <span>
                        <span className={cx('ci-settings__mask')} aria-hidden="true">
                          ••••••••••••
                        </span>{' '}
                        <span aria-label={formatMessage(messages.ciCredentialSaved)}>
                          {formatMessage(messages.ciSavedLabel)}
                        </span>
                      </span>
                      {!credentialInherited && (
                        <Button
                          type="button"
                          variant="text"
                          adjustWidthOn="content"
                          data-automation-id="removePipelineCiCredential"
                          aria-label={formatMessage(messages.ciRemoveCredential)}
                          disabled={isLocked || Boolean(hasChanges)}
                          onClick={() => void run('remove')}
                        >
                          {formatMessage(messages.ciRemove)}
                        </Button>
                      )}
                      {!showCredentialInput && (
                        <Button
                          type="button"
                          variant="text"
                          adjustWidthOn="content"
                          data-automation-id="replacePipelineCiCredential"
                          disabled={isLocked}
                          onClick={() => setIsReplacingCredential(true)}
                        >
                          {formatMessage(messages.ciReplace)}
                        </Button>
                      )}
                      {showCredentialInput && !replacementRequired && (
                        <Button
                          type="button"
                          variant="text"
                          adjustWidthOn="content"
                          disabled={isLocked}
                          onClick={() => {
                            setDraft({ ...draft, credential: '' });
                            setIsReplacingCredential(false);
                          }}
                        >
                          {formatMessage(messages.ciCancelReplacement)}
                        </Button>
                      )}
                      {!credentialInherited && (
                        <span className={cx('ci-settings__note')}>
                          {formatMessage(messages.ciCredentialHidden)}
                        </span>
                      )}
                    </div>
                  )}
                  {showCredentialInput && (
                    <FieldText
                      className={cx('ci-settings__input')}
                      id="pipeline-ci-credential"
                      name="credential"
                      data-automation-id="pipelineCiField-credential"
                      type="password"
                      autoComplete="new-password"
                      aria-required={replacementRequired}
                      placeholder={formatMessage(
                        settings.credentialSaved
                          ? messages.ciCredentialReplace
                          : messages.ciCredentialHint,
                      )}
                      helpText={
                        replacementRequired
                          ? formatMessage(messages.ciCredentialForNewRepository)
                          : undefined
                      }
                      defaultWidth={false}
                      value={draft.credential}
                      disabled={isLocked}
                      onChange={(event) => setDraft({ ...draft, credential: event.target.value })}
                    />
                  )}
                  {credentialInherited && (
                    <p className={cx('ci-settings__note')}>
                      {formatMessage(messages.ciInheritedCredential)}
                    </p>
                  )}
                </>
              }
            />
            <div className={cx('ci-settings__actions')}>
              <Button
                type="button"
                variant="ghost"
                adjustWidthOn="content"
                data-automation-id="testPipelineCiConnection"
                disabled={isLocked || Boolean(hasChanges)}
                onClick={() => void run('test')}
              >
                {formatMessage(messages.ciTest)}
              </Button>
              <Button
                type="submit"
                adjustWidthOn="content"
                data-automation-id="savePipelineCiConnection"
                disabled={!canSave}
              >
                {formatMessage(messages.ciSave)}
              </Button>
              <p className={cx('ci-settings__note', 'ci-settings__actions-note')}>
                {formatMessage(hasChanges ? messages.ciSaveBeforeTest : messages.ciTestHint)}
              </p>
            </div>
            <CiVerdict check={verdict ?? settings} isTestResult={Boolean(verdict)} />
            {feedback && (
              <SystemMessage mode={feedback.mode}>
                {formatMessage(messages[feedback.message])}
              </SystemMessage>
            )}
          </form>
        )}
      </AiDetailsSectionState>
    </section>
  );
};

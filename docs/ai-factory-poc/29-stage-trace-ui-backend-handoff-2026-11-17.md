# Stage Trace UI — backend / pipeline handoff

Дата: 2026-11-17. Story: US-AI-FCTRY-021 / EPMRPP-123551.

Статус: frontend реализован и локально проверен в пределах подтверждённого контракта. Чтение trace API проверено на стенде; реальный поток producer → REPORTED trace → UI ещё не подтверждён. Полная история fix rounds требует дополнительного контракта.

## Область работы

Frontend-изменения подготовлены в `feature/pipeline-stage-trace-ui`, база `bootcamp-prototype` / `a59035d1ee24b6150dfe52a178225bb99204ffe9`. После локальной проверки пользователь запросил commit, push и PR в `bootcamp-prototype`; фактический статус публикации и CI отслеживается в GitHub PR. Деплой не входит в эту работу.

Проверенный контракт бэка: `service-api`, `feature/pipelines`, SHA `ab4a85f83f653d8599ecd3ff2e3fbb59a5737f7c`; присланный `pipeline-stage-trace.md`; US-021 v0.2 в requirements repo на `901a39c1be98c13d25359bf93406146ff3241da1`.

## Что реализовано на frontend

| Изменение | Поведение / назначение |
|---|---|
| Open trace у live agent-стадии | Использует реальный `stageKey`; до перехода читает только attempts metadata. Не подменяет stageKey numeric ID или названием стадии. |
| Отдельная страница trace | Прямой URL, breadcrumbs, возврат к исходной итерации/стадии, ручной Refresh. Feature OFF не вызывает trace API; Viewer может читать. |
| Attempts | Текущая попытка по умолчанию; явный `?attempt=N`; переключение и refresh не оставляют данные другой попытки, итерации или проекта. |
| Timeline | Тип, title, offset, duration, target, полный text/data. События изначально свёрнуты; text/JSON монтируются при раскрытии. Более 100 событий виртуализируются. Число событий GET не ограничено лимитом одной записи PUT. |
| GRADERS | Понятные producer-поля `caseId`, `total`, `before`, `after`, `criteria: [{name, score, max}]` отображаются без пересчёта, включая нули. Неизвестные поля и исходный JSON доступны полностью. Структурная таблица ограничена 100 критериями и 512 символами имени; это ограничение отображения, не обрезание payload — превышение остаётся доступным в raw JSON. |
| Snapshot | Метрики, модель, окружение и CI RUN-ссылки выбранной попытки. Для прошлой попытки берётся её snapshot из `stages[].attempts`; текущие значения туда не переносятся. Общий контекст итерации показан отдельно. |
| Состояния | Раздельные loading, `NOT_REPORTED` с reason при наличии, пустой `REPORTED`, 403, 404, невалидный ответ и request failure. |
| Native fix trace | Из известной result iteration в Library доступен переход на её стадию `fix`. Из human generation Review — явный выбор известных текущих раундов, непосредственно связанных с исходной итерацией. Automation Review открывает собственную agent-стадию. |
| Защита от неверного контекста | Из generation Review допускается round с `previousIterationId` исходной итерации, result из того же pipeline и согласованным `rerunOf`, если он задан. Неподтверждённая связь и result, совпадающий с source, не предлагаются. Последующие потомки и неизвестная история не восстанавливаются догадками. |

Маршрут UI:

```text
#organizations/{organizationSlug}/projects/{projectSlug}/pipelines/{pipelineId}/iterations/{iterationId}/stages/{stageKey}/trace?attempt=N
```

Контракт допускает несколько способов заполнить `data`; перечисленные GRADERS-поля — поддерживаемая UI проекция, которую ещё нужно подтвердить реальным producer payload. Она не превращает свободный JSON в обязательную backend-схему.

## Контракт чтения

```text
GET /api/v1/project/{projectKey}/pipeline/iteration/{iterationId}/stage/{stageKey}/trace/attempts
GET /api/v1/project/{projectKey}/pipeline/iteration/{iterationId}/stage/{stageKey}/trace?attempt=N
```

Trace загружается отдельно от результата стадии. UI не вызывает PUT trace, retry, Push to agent или result callback при открытии страницы.

- API-идентичность: реальный projectKey, iteration ID, stageKey, attempt. Display number и numeric stage ID их не заменяют.
- `NOT_REPORTED` — штатное состояние, не ошибка выполнения стадии. 403/404 и сетевой сбой обрабатываются отдельно.
- `seq` допускает пропуски; `0` — корректное значение. Нулевые offsets/duration и отсутствующие необязательные поля должны сохраняться.
- Текст события отображается полностью, включая whitespace. Ограничение 2000 событий относится к одному PUT; оно не применяется к GET всей попытки.
- Snapshot выбранной прошлой попытки берётся из `stages[].attempts`. Текущие метрики не должны подменять исторические.
- В проверенном response DTO CI-ссылки представлены `links` / `type: RUN`, а не `execution.runUrl`.

## Вопросы, требующие ответа бэка / Product / pipeline team

### 1. История fix rounds

Для полной таблицы раундов нужен подтверждённый источник native history: как минимум `id`, `testCaseId`, `roundNumber`, `resultIterationId` и связь с исходной pipeline iteration.

В проверенном `TestCaseReviewController` есть GET конкретного round по ID, но нет GET списка истории. Rich/mock-модель UI не является контрактом native history. Нельзя восстановить полную историю из порядковых номеров либо из раундов, наблюдавшихся только в текущей браузерной сессии.

Реализованный UI открывает trace только однозначно известного native round. Из generation Review список ограничен текущими Review-round ссылками кейсов этой итерации с доказанной непосредственной связью с source iteration; текущий round другого источника не предлагается. Это частичная поддержка входа из fix rounds; она не закрывает AC всей таблицы истории. После согласования history API потребуется отдельное подключение полной истории на FE.

Отдельный вопрос для failed fix: если job успел создать result iteration и failed Fix stage, как round получает её `resultIterationId`? Без этой связи trace может физически существовать, но переход из строки раунда построить нельзя. Просьба подтвердить выдачу связи и для таких неуспешных раундов; если iteration не создавалась, отсутствие ссылки корректно.

### 2. Общая кнопка generation Review

Generation Review поддерживается ReportPortal; trace исправления принадлежит `resultIterationId` раунда, стадии `fix`. Automation Review принадлежит своей agent-стадии.

Нужно подтвердить поведение общей кнопки generation Review при отсутствии раундов и нескольких раундах. Сейчас реализован явный выбор доступного известного раунда и объяснение ограничения истории. Нет resultIterationId — нет ссылки на trace. Previous iteration не является заменой result iteration.

### 3. Структура GRADERS

Сейчас `data` — свободный JSON object. Для гарантированного отображения шести критериев нужны примеры и согласованная структура: case ID, total, before/after, criterion name/ID, score/max. Нельзя заявить соответствие таблице Grade, пока producer не гарантирует эти значения.

Отсутствующие оценки UI не вычисляет, не перегенерирует и не заменяет mock-значениями.

### 4. Метаданные snapshot

История attempts уже содержит timing, links, attributes и sections. Нужно подтвердить используемые producer ключи model/environment/input/output tokens/cost и поведение при смене модели между попытками. При отсутствии исторического поля UI должен показывать отсутствие данных, а не переносить значение текущей стадии.

### 5. Большие trace

GET возвращает целый trace; серверной пагинации в проверенном контракте нет. Lazy rendering уменьшает DOM, но не сетевой payload и память JSON. Нужно согласовать ожидаемые размеры trace и при необходимости GET pagination/отдельное чтение text, сохранив доступ к полному тексту.

### 6. Legacy inline transcript

Нужно согласовать переход producer с `sections.transcript` на отдельный trace: прекращение дублирования новых текстов в panel, сохранность старых итераций. UI не может достоверно преобразовать исторические строки transcript в type/seq/attempt без контракта миграции.

## Отдельные зависимости среды и API

### CI fix review — Vadzim / pipeline team

В `rp-tests/main` на commit `60ba205602ebb6cc1600d383245557d6dd87dd17` подтверждены trigger-rule `FIX_ROUND_ID`, job `fix_test_case_round`, fix/re-grade вызовы и переключатель `RP_INSECURE_TLS`. Default RP host остаётся `https://tms.beta.reportportal.io`, project — `reportportal.epm-rpp`.

Для bootcamp необходимо подготовить правильные tms host/project, сертификат/CA либо согласованный временный CI TLS switch и доступ runner к действующему RP credential нужного проекта. Job использует `RP_LIBRARY_API_KEY` либо настроенный fallback Vault. Значения секретов и доступ Vault в этой работе не проверяются и не меняются.

RP API credential и GitLab trigger token имеют разные назначения. Локальный `.env` UI не настраивает credential удалённого runner.

### Producer Stage Trace — Vadzim / pipeline team

Нужно отдельно подтвердить реальную отправку trace существующей попытки после её окончания, в том числе при failed stage; redaction credentials до отправки; независимость stage result от сбоя PUT trace; multipart без обрезания текста; отсутствие дублей при повторном seq.

Присутствие backend endpoints не доказывает, что producer их уже вызывает. Прямых trace-вызовов в проверенном `.gitlab-ci.yml` не найдено; подключённый rp-cli и реальное исполнение требуют отдельной проверки.

### GET test case / AI metrics — backend team

По сообщению разработчика бэка требуется проверить отсутствие AI metrics в GET test case. Current UI уже читает native `metrics.overallScore`, `obsolete`, `model`, `costUsd`; в detail после завершения fix есть refresh case GET.

Если восстановится существующий формат, отдельная переделка summary UI не требуется. Изменение схемы или новые per-criterion поля требуют отдельного согласования и проверки. Ошибка backend metrics не должна маскироваться демонстрационными значениями фронта.

## Проверки и ограничения

### Локальная проверка реализации

| Проверка | Результат |
|---|---|
| Jest: pipelines controller, trace transport, iteration detail, trace page, native fix links | **PASS: 25 suites / 332 tests** |
| Полный TypeScript check приложения | **PASS** |
| Production webpack build, Node 20.19.1 | **PASS** |
| ESLint изменённых JS/TS и тестов | **0 errors, 1 warning**: `react-hooks/incompatible-library` у TanStack `useVirtualizer`; React Compiler пропускает мемоизацию этого компонента |
| Stylelint нового SCSS; `git diff --check` | **PASS** |
| Независимые code и security проверки с повторной проверкой исправлений | **PASS**, блокирующих замечаний не осталось |
| Chrome, локальный fixture реальных Timeline/Graders/Snapshot компонентов и SCSS | **PASS в проверенном объёме**: раскрытие GRADERS, before/after и нулевой criterion, переключение на прошлую модель с duration/cost/tokens = 0, вывод HTML как текста, прокрутка виртуального списка до события 2101 |

Автотесты покрывают отмену и устаревшие ответы, смену project/attempt, feature OFF, Viewer/read-only, ошибки и `NOT_REPORTED`, identity, sparse seq, whitespace и текст до 10 млн символов, более 2000 событий, точный исторический snapshot, fix-round source/result guards и fallback полного JSON. Браузерный fixture не содержит авторизации, API, полного application shell или удалённого producer; он не является live E2E и не доказывает производительность на максимальном payload.

### Read-only проверка реального стенда — 2026-11-17

После обновления пользователем локального RP-токена выполнены только GET. HTTPS использовался с отключённой проверкой сертификата по ранее данному разрешению для этого стенда; это ограничение проверки среды, не изменение frontend TLS или runner config. Секреты в документ не включены.

- `/api/info`: **200**, API Service `feature-pipelines-2926`, reported branch `HEAD-2b836dcdaec4361240f06f9520b5697e7f81eb97`. Это идентификатор, заявленный стендом; он отличается от source SHA контракта выше.
- `GET /api/v1/project/superadmin_personal/pipeline`: **200**.
- Detail итераций **16** (pipeline 6), **4** (pipeline 3), **19** (pipeline 1): **200**; реальные `stageKey` присутствуют.
- Для восьми стадий из этих итераций оба trace GET дали **200**: `review`, `test-case-upload`, `upload`; `implement-test-case`; `prepare-test-case`, `prepare-test-case-2`, `develop-test-case`, `code-review`.
- Все восемь проверенных стадий имеют current attempt **1**, `traceStatus/status: NOT_REPORTED`, `eventCount: 0`, без reason. В том числе `code-review` со статусом **FAILED**. Это подтверждает штатное чтение отсутствующего trace, но не отправку событий агентом и не отсутствие trace во всём проекте.
- В этих трёх detail нет исторических attempts. Реальная проверка прошлой попытки остаётся **NOT VERIFIED**.
- Запрос с `epm-rpp` вместо project key возвращает **404 / errorCode 4040**: `Project 'epm-rpp' not found. Did you use correct project key?`. Дополнительный `GET /api/v1/project/list` дал **200** и подтвердил разделение: UI slug `epm-rpp` → API key `my-organization.epm-rpp`; UI slug `superadmin-personal` → API key `superadmin_personal`. Это не ошибка trace endpoint: в API нельзя подставлять slug вместо разрешённого project key.
- С правильным API key `my-organization.epm-rpp` detail итерации **34**, pipeline **8**, дал **200**. Для `create-test-case`, `test-case-review`, `test-case-fix` оба trace GET также дали **200**, current attempt **1**, `NOT_REPORTED`, 0 events, без reason и исторических snapshots. Итого проверены **11 стадий в четырёх итерациях двух проектов**; ни одна из них пока не подходит для live проверки отображения событий.

**NOT VERIFIED:** реальный `REPORTED` payload, полный путь от CI producer до UI, исторический snapshot на стенде, trace failed fix с resultIterationId, полная native fix-round history, production deployment frontend и Viewer через реальную учётную запись. Наличие endpoints и локальные fixtures эти пункты не закрывают. Ошибка отсутствия AI metrics в GET test case в этой работе не исправлялась и повторно не воспроизводилась.

## Что нужно для завершения совместной проверки

1. **Backend / Product:** подтвердить history API и связь failed round → result iteration; согласовать поведение generation Review и форму GRADERS. Вернуть безопасные примеры ответов текущей и прошлой попыток, включая шесть критериев и snapshot с разными моделями.
2. **Vadzim / pipeline team:** настроить tms host/project, TLS и RP credential runner; выполнить disposable сценарий, который отправит реальный trace. Нужны projectKey, pipelineId, iterationId, stageKey, attempt и ссылка на job без секретов. Включить успешную и failed stage; подтвердить redaction до PUT.
3. **Совместно с FE:** открыть локальную сборку/сборку ветки с AI Factory flag; Pipeline → Iteration → agent stage → Open trace. Проверить Network: attempts, отдельный trace GET, `attempt=N`, отсутствие PUT/retry при чтении. Проверить current/history snapshot, полный PROMPT/TOOL_CALL, GRADERS и 403/404/NOT_REPORTED, затем Back к исходной стадии.
4. **Fix-flow:** для human generation Review выбрать конкретный известный round; убедиться, что URL указывает на `resultIterationId`, stage `fix`, правильный pipeline, а Back возвращает source. Для полной истории после публикации API потребуется FE подключение списка. Для Library проверить ссылку из известного результата и failed round со связью resultIterationId.
5. **Backend:** проверить GET test case AI metrics и сообщить фактическую схему исправленного ответа; **FE** повторно проверит existing summary/refresh на этом ответе.

До выполнения пунктов 1–4 нельзя объявлять US-021 целиком принятой или реальный E2E завершённым. Реализованные frontend части доступны для review; полный history consumer зависит от ещё не подтверждённого источника данных.

## Источники

- [Story](https://git.epam.com/EPM-RPP/reportportal-requirements/-/blob/901a39c1be98c13d25359bf93406146ff3241da1/domains/projects/df_bootcamp_2026/stories/US-AI-FCTRY-021-open-stage-trace.md).
- [PipelineController](https://github.com/reportportal/service-api/blob/ab4a85f83f653d8599ecd3ff2e3fbb59a5737f7c/src/main/java/com/epam/reportportal/base/core/aifactory/controller/PipelineController.java).
- [PipelineStageAttemptRS](https://github.com/reportportal/service-api/blob/ab4a85f83f653d8599ecd3ff2e3fbb59a5737f7c/src/main/java/com/epam/reportportal/base/core/aifactory/dto/PipelineStageAttemptRS.java).
- [CI config](https://git.epam.com/EPM-RPP/rp-tests/-/blob/60ba205602ebb6cc1600d383245557d6dd87dd17/.gitlab-ci.yml).

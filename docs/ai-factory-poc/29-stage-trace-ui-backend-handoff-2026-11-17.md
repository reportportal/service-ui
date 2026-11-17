# Stage Trace UI — backend / pipeline handoff

Дата: 2026-11-17. Story: US-AI-FCTRY-021 / EPMRPP-123551.

Статус: frontend реализован и локально проверен в пределах подтверждённого контракта. Чтение trace API проверено на стенде; реальный поток producer → REPORTED trace → UI ещё не подтверждён. Полная история fix rounds требует дополнительного контракта.

## Область работы

Frontend-изменения подготовлены в `feature/pipeline-stage-trace-ui`, база `bootcamp-prototype` / `a59035d1ee24b6150dfe52a178225bb99204ffe9`. После локальной проверки пользователь запросил commit, push и PR в `bootcamp-prototype`; фактический статус публикации и CI отслеживается в GitHub PR. Деплой не входит в эту работу.

Проверенный контракт бэка: `service-api`, SHA `ab4a85f83f653d8599ecd3ff2e3fbb59a5737f7c`; описание Stage Trace и US-021 v0.2.

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
| Native fix trace | Из известной result iteration в Library доступен переход на однозначно определённую fix-стадию из её detail. Используется фактический `stageKey` (например, `fix` или `test-case-fix`), а не фиксированное значение маршрута. Из human generation Review — явный выбор известных текущих раундов, непосредственно связанных с исходной итерацией. Automation Review открывает собственную agent-стадию. |
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

Generation Review поддерживается ReportPortal; trace исправления принадлежит `resultIterationId` раунда и фактической fix-стадии этой итерации. UI резолвит её ключ из detail и не строит ссылку при отсутствии или неоднозначности стадии. Automation Review принадлежит своей agent-стадии.

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

### CI fix review — pipeline team

Для совместной проверки необходимы корректная конфигурация целевой среды и доступность API для producer. Настройка CI выполняется отдельно; frontend не меняет конфигурацию runner.

### Producer Stage Trace — pipeline team

Нужно отдельно подтвердить реальную отправку trace существующей попытки после её окончания, в том числе при failed stage; удаление чувствительных данных до отправки; независимость stage result от сбоя PUT trace; multipart без обрезания текста; отсутствие дублей при повторном seq.

Присутствие backend endpoints не доказывает, что producer их уже вызывает. Реальное исполнение требует отдельной проверки.

### GET test case / AI metrics — backend team

По сообщению разработчика бэка требуется проверить отсутствие AI metrics в GET test case. Current UI уже читает native `metrics.overallScore`, `obsolete`, `model`, `costUsd`; в detail после завершения fix есть refresh case GET.

Если восстановится существующий формат, отдельная переделка summary UI не требуется. Изменение схемы или новые per-criterion поля требуют отдельного согласования и проверки. Ошибка backend metrics не должна маскироваться демонстрационными значениями фронта.

## Проверки и ограничения

### Локальная проверка реализации

Текущее исправление замечаний review остаётся **локальным и незакоммиченным**. Ключ fix-стадии определяется из result detail; переключение attempts использует UI-kit Dropdown; trace-действия находятся внутри панелей стадий. Некорректная optional history не ломает iteration detail; дубликаты snapshot исключаются без подмены текущими данными. Request scope меняется только после commit React, с отменой запросов и защитой от устаревших обработчиков и abandoned render.

| Проверка текущего локального исправления | Результат |
|---|---|
| Jest: 28 связанных suites | **PASS: 398 tests** |
| Полный `npm run lint`, включая TypeScript, ESLint и Stylelint | **PASS**; ESLint: **0 errors / 122 warnings**, Stylelint: **0 errors / 200 warnings** |
| `npm run deps:cycles` | **PASS**, циклов не найдено |
| `git diff --check` | **PASS** |
| Независимые code и security проверки | **PASS**, блокирующих замечаний не осталось |
| Runtime нового UI-kit Dropdown в Chrome | **NOT VERIFIED**: необязательная браузерная проверка не состоялась из-за недоступности браузерной среды |

Production webpack build и Chrome component fixture были проверены **ранее**, до текущего исправления review. Предыдущий fixture подтверждал раскрытие GRADERS, before/after и нулевой criterion, историческую модель с duration/cost/tokens = 0, вывод HTML как текста и прокрутку виртуального списка до события 2101. Это историческое свидетельство по компонентам, а не новая runtime-проверка изменённого Dropdown или полного приложения.

Автотесты покрывают отмену и устаревшие ответы, смену project/attempt, feature OFF, Viewer/read-only, ошибки и `NOT_REPORTED`, identity, sparse seq, whitespace и текст до 10 млн символов, более 2000 событий, точный исторический snapshot, fix-round source/result guards и fallback полного JSON. Текущие регрессии также проверяют фактический fix-stage key, устойчивость optional history, committed request scope, ошибки callback и переключение attempts.

Предыдущий браузерный fixture не содержит авторизации, API, полного application shell или удалённого producer; он не является live E2E и не доказывает производительность на максимальном payload. Результаты CI/Sonar относятся к предыдущему закоммиченному head и не подтверждают текущий локальный patch. Новый запуск CI/Sonar и деплой в рамках этих локальных проверок не заявляются.

### Read-only проверка реального стенда — 2026-11-17

Выполнены только GET-запросы к доступному тестовому API. Проверки конфигурации среды и producer не входили в этот read-only этап.

- Pipeline catalog, детали четырёх итераций двух проектов и оба trace GET для одиннадцати стадий вернули **200**. Реальные `stageKey` присутствуют, включая `create-test-case`, `test-case-review`, `test-case-fix`.
- Все одиннадцать проверенных стадий имеют current attempt **1**, `traceStatus/status: NOT_REPORTED`, `eventCount: 0`, без reason, в том числе стадия со статусом **FAILED**. Это подтверждает штатное чтение отсутствующего trace, но не отправку событий агентом и не отсутствие trace во всех проектах.
- В этих деталях нет исторических attempts. Реальная проверка прошлой попытки остаётся **NOT VERIFIED**.
- API требует разрешённый `projectKey`, который может отличаться от UI slug. Подстановка slug вместо ключа дала **404 / errorCode 4040**; запрос с фактическим ключом проекта вернул **200**. UI не должен заменять разрешённый API key значением slug.

**NOT VERIFIED:** реальный `REPORTED` payload, полный путь от CI producer до UI, исторический snapshot на стенде, trace failed fix с resultIterationId, полная native fix-round history, production deployment frontend и Viewer через реальную учётную запись. Наличие endpoints и локальные fixtures эти пункты не закрывают. Ошибка отсутствия AI metrics в GET test case в этой работе не исправлялась и повторно не воспроизводилась.

## Что нужно для завершения совместной проверки

1. **Backend / Product:** подтвердить history API и связь failed round → result iteration; согласовать поведение generation Review и форму GRADERS. Вернуть безопасные примеры ответов текущей и прошлой попыток, включая шесть критериев и snapshot с разными моделями.
2. **Pipeline team:** подготовить целевую среду и выполнить изолированный сценарий, который отправит реальный trace. Нужны projectKey, pipelineId, iterationId, stageKey, attempt и ссылка на job без секретов. Включить успешную и failed stage; подтвердить redaction до PUT.
3. **Совместно с FE:** открыть локальную сборку/сборку ветки с AI Factory flag; Pipeline → Iteration → agent stage → Open trace. Проверить Network: attempts, отдельный trace GET, `attempt=N`, отсутствие PUT/retry при чтении. Проверить current/history snapshot, полный PROMPT/TOOL_CALL, GRADERS и 403/404/NOT_REPORTED, затем Back к исходной стадии.
4. **Fix-flow:** для human generation Review выбрать конкретный известный round; убедиться, что URL указывает на `resultIterationId`, фактический `stageKey` fix-стадии из result detail, правильный pipeline, а Back возвращает source. Для полной истории после публикации API потребуется FE подключение списка. Для Library проверить ссылку из известного результата и failed round со связью resultIterationId.
5. **Backend:** проверить GET test case AI metrics и сообщить фактическую схему исправленного ответа; **FE** повторно проверит existing summary/refresh на этом ответе.

До выполнения пунктов 1–4 нельзя объявлять US-021 целиком принятой или реальный E2E завершённым. Реализованные frontend части доступны для review; полный history consumer зависит от ещё не подтверждённого источника данных.

## Источники

- US-AI-FCTRY-021, v0.2; описание Stage Trace, предоставленное командой бэка.
- [PipelineController](https://github.com/reportportal/service-api/blob/ab4a85f83f653d8599ecd3ff2e3fbb59a5737f7c/src/main/java/com/epam/reportportal/base/core/aifactory/controller/PipelineController.java).
- [PipelineStageAttemptRS](https://github.com/reportportal/service-api/blob/ab4a85f83f653d8599ecd3ff2e3fbb59a5737f7c/src/main/java/com/epam/reportportal/base/core/aifactory/dto/PipelineStageAttemptRS.java).

---
name: service-ui-deploy
description: Собирает feature Docker image reportportal/service-ui, обновляет docker.ui в reportportal/versions (tms) и запускает Jenkins DEPLOY-DOCKER-reportportal-job с проверкой обоих запусков каждые 30 секунд. Использовать для сборки и деплоя service-ui в TMS; не для локального dev server или production release.
---

# Service UI Deploy

Выполни одну цепочку: новый GitHub Actions build → точный Docker tag → обновление versions.yaml → один Jenkins deploy → итоговый результат. «Локальный» относится к установке skill; целевой стенд — удалённый `tms`.

## Область и параметры

Запрос выполнить этот деплой разрешает запуск workflow, commit изменения `docker.ui` в удалённой ветке `reportportal/versions:tms` и запуск Jenkins с параметрами ниже. Не запрашивай повторное подтверждение этих шагов. Запрос создать, изменить или объяснить skill сам по себе не запускает деплой.

Не коммить и не пушь локальный service-ui, не сливай PR и не меняй другие сервисы или стенды без запроса пользователя.

| Назначение | Значение по умолчанию |
| --- | --- |
| Репозиторий приложения | `reportportal/service-ui` |
| Ветка приложения | Явно указанная пользователем, иначе текущая ветка рабочего service-ui |
| Workflow | `Build feature Docker image`, файл `.github/workflows/build-feature-image.yaml` |
| Репозиторий версий | `reportportal/versions` |
| Ветка версий / файл / ключ | `tms` / `versions.yaml` / `docker.ui` |
| Jenkins Env | `tms` |
| Jenkins VersionsBranch | `tms` |
| Jenkins JobsBilling | `false` (флажок снят) |
| Jenkins GitHubBrach | `develop` — ветка `reportportal/reportportal`, не ветка service-ui |
| Интервал проверки обоих запусков | `30` секунд |

Ссылки:

- [Actions](https://github.com/reportportal/service-ui/actions/workflows/build-feature-image.yaml)
- [versions.yaml](https://github.com/reportportal/versions/blob/tms/versions.yaml)
- [Jenkins job](http://jenkins.epmrpp.reportportal.io/view/DevOps/job/DEPLOY-DOCKER-reportportal-job/)

Значения Jenkins взяты из пользовательского скриншота. Перед запуском сверь их с доступной формой/API, не подменяй текущими значениями формы. Если обязательные параметры изменились и значение нельзя вывести из запроса, уточни недостающий параметр.

## 1. Определи ветку и commit

Проверь `git status --short`, `git remote -v`, `git branch --show-current` в рабочем service-ui. Сохрани локальные изменения. Если ветка явно не задана, используй текущую; при detached HEAD без заданной ветки уточни ветку.

Разреши ветку на GitHub в SHA и зафиксируй его как ожидаемый SHA сборки. Проверь наличие workflow и `workflow_dispatch` на выбранной ветке. Сборка использует опубликованное состояние GitHub: при локальных непушенных коммитах/изменениях сообщи, что они не войдут в image. Не делай автоматический push. Если пользователь требует именно локальное неопубликованное состояние, останови запуск до решения расхождения.

Используй доступный GitHub connector; при отсутствии dispatch/status операции — авторизованный `gh`; при необходимости — существующую браузерную сессию. Для Jenkins используй авторизованный API или браузер. Не печатай токены/cookies и не сохраняй их в skill. При отсутствии доступа сообщи точный блокер, не заявляй, что этап выполнен.

## 2. Запусти и дождись Docker build

В Actions выбери слева **Build feature Docker image** → **Run workflow** → **Use workflow from** = выбранная ветка → **Run workflow**. Эквивалент через CLI (переменная `deploy_branch` содержит проверенную ветку):

```bash
gh workflow run build-feature-image.yaml --repo reportportal/service-ui --ref "$deploy_branch"
```

Перед dispatch сохрани время и ID существующих запусков этого workflow на ветке. Сохрани URL/ID созданного run из ответа. Если API не возвращает ID, найди новый `workflow_dispatch` run по workflow, ветке, ожидаемому SHA, инициатору и времени; исключи существовавшие ID. Не выбирай просто «последний» запуск. При нескольких неразличимых кандидатах выясни ID до продолжения.

```bash
gh run list --repo reportportal/service-ui --workflow build-feature-image.yaml \
  --branch "$deploy_branch" --event workflow_dispatch \
  --json databaseId,number,headBranch,headSha,event,createdAt,status,conclusion,url
```

Проверяй **этот ID** каждые 30 секунд до `status=completed`. Не переходи к versions или Jenkins, пока `conclusion` не станет `success`. При failure/cancelled/timed_out/skipped/иной финальной причине останови цепочку, сообщи результат и ссылку; при наличии доступа прочитай ошибку упавшего шага.

Для статуса используй:

```bash
gh run view "$deploy_run_id" --repo reportportal/service-ui \
  --json databaseId,number,headBranch,headSha,status,conclusion,url
```

Либо используй API/страницу этого run. Между проверками жди 30 секунд, не делай частый опрос. Продолжай до финального результата; периодически сообщай текущий этап и ссылку. Ошибка сети или истечение ожидания инструмента — не результат build: восстанавливай наблюдение за тем же ID. После неоднозначного ответа dispatch сначала найди существующий запуск, не создавай дубликат.

После успеха проверь `head_sha` и возьми **`run_number`** (`number` в `gh`), а не `run_id`/`databaseId`, job ID или `run_attempt`. Подтверди опубликованный tag по workflow/логам успешного Docker build. Проверенная формула workflow:

```text
tag = (branchName + "-" + run_number).replace("/", "-")
bootcamp-prototype + 4262 → bootcamp-prototype-4262
feature/example + 4262   → feature-example-4262
```

Это примеры, не значения для повторного использования. Если формула workflow выбранной ветки отличается, используй подтверждённый опубликованный tag. При несовпадении SHA или невозможности установить tag не продолжай цепочку.

## 3. Обнови только docker.ui

Прочитай свежий `reportportal/versions`, ветка `tms`, файл `versions.yaml` и его blob SHA. Сохрани старое `docker.ui`. Подготовь diff с заменой только значения этого ключа на подтверждённый tag; сохрани форматирование, комментарии и остальные строки.

Запиши изменение напрямую в ветку **tms** через GitHub update-file/Contents API с исходным blob SHA (защита от конкурентной записи). Текст commit, например: `Update TMS UI to <tag>`. Если API недоступен, используй GitHub web editor этой ветки, предварительно сверив свежий diff. Если branch protection запрещает запись, сообщи блокер: создание PR само по себе не разрешает запуск deploy.

При конфликте SHA перечитай файл и пересоздай минимальный diff. Если за это время изменилось само `docker.ui`, останови цепочку и сообщи о параллельном деплое. После записи перечитай файл и зафиксируй commit SHA/URL: в ветке `tms` должно быть ровно ожидаемое `docker.ui`. Если там уже установлен нужный tag, не создавай пустой commit.

## 4. Запусти и дождись Jenkins deploy

Ещё раз сверь `docker.ui` непосредственно перед запуском. Если оно изменилось, не запускай deploy для чужого image.

Открой **Build with Parameters** указанного Jenkins job и установи все четыре значения из таблицы: `Env=tms`, `VersionsBranch=tms`, `JobsBilling=false`, `GitHubBrach=develop` (либо явные пользовательские переопределения). Нажми **Build** один раз. Через API используй `buildWithParameters` с этими значениями и требуемой сервером CSRF/auth схемой.

Сохрани queue item URL/ID из ответа/страницы; дождись его `executable.url`/build number. Не вычисляй свой build как `lastBuild` или предыдущий номер + 1. При работе через UI установи build по queue item/ссылке запуска и проверь инициатора, время и параметры. Если кандидаты неразличимы, выясни точный build до сообщения результата. Если очередь отменена, сообщи об отмене. После неоднозначного сетевого ответа сначала проверь очередь/историю и параметры, не нажимай Build повторно.

Проверяй привязанный queue item, затем **конкретный Jenkins build**, каждые 30 секунд до завершения. Для API `building=true` или `result=null` означает ожидание; успех — только `building=false` и `result=SUCCESS`. `FAILURE`, `ABORTED`, `UNSTABLE`, `NOT_BUILT` и другие финальные результаты сообщи как есть, не называй успехом. При ошибке доступа/сети восстанавливай наблюдение за тем же ID; если доступ потерян окончательно, сохрани URL/ID и сообщи, что результат пока не проверен. Не запускай заменяющий build.

Сверь параметры выполненного build и, если доступны, checkout commit ветки versions и реально использованный UI tag в console/artifacts. Чтение ветки Jenkins выполняется позже запуска: если ревизию/image подтвердить нельзя, отдельно укажи это в результате. Не откатывай чужие изменения, не меняй versions повторно и не перезапускай job автоматически после неуспеха.

## Результат

Сообщи кратко:

- ветка service-ui и проверенный SHA;
- GitHub Actions URL, run number, финальный статус и image tag;
- изменение `docker.ui`: старое → новое и ссылка на commit versions (или уже совпадало);
- Jenkins URL, build number, параметры и финальный result;
- проверен ли фактически использованный image/versions commit.

Успех Jenkins означает успех job. Доступность приложения и соответствие image на работающем стенде указывай как проверенные только при наличии отдельного runtime evidence. При остановке назови завершённые этапы, блокирующую ошибку и конкретный следующий шаг. Не выдавай запущенную/стоящую в очереди job за завершённый деплой.

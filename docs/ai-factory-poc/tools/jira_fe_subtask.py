#!/usr/bin/env python3
"""Create (or find) the frontend sub-task of an AI Factory PoC story in Jira.

Usage:
  python3 docs/ai-factory-poc/tools/jira_fe_subtask.py EPMRPP-121704 "Pipelines list" [--desc FILE] [--yes]

Without --yes the script only prints what it would create (dry run).
Credentials are read from JIRA_ENV_FILE, or else from the first of service-ui/.env, ../prism-ui/.env.local that has a token:
  JIRA_URL, JIRA_API_TOKEN (Personal Access Token, sent as Bearer), optional JIRA_ASSIGNEE (Jira username),
  optional JIRA_SUBTASK_TYPE (default: auto-detected sub-task issue type).
Idempotent: if the parent already has a sub-task whose summary starts with "[FE]", it is reported and nothing is created.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DEFAULT_ENV_FILES = [
    os.path.join(REPO_ROOT, '.env'),                           # service-ui/.env
    os.path.join(REPO_ROOT, '..', 'prism-ui', '.env.local'),   # fallback
]
PREFIX = '[FE]'
LABELS = ['ai-factory-poc', 'frontend']


def load_env(path):
    env = {}
    if os.path.exists(path):
        with open(path, encoding='utf-8') as handle:
            for line in handle:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip().strip('"').strip("'")
    env.update({k: v for k, v in os.environ.items() if k.startswith('JIRA_')})
    return env


def request(env, method, path, body=None, allow_error=False):
    url = env['JIRA_URL'].rstrip('/') + path
    data = json.dumps(body).encode('utf-8') if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Authorization', 'Bearer ' + env['JIRA_API_TOKEN'])
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode('utf-8')
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as err:
        if allow_error:
            return None
        sys.exit('Jira %s %s -> HTTP %s: %s' % (method, path, err.code, err.read().decode('utf-8')[:500]))


def subtask_type(env, project_key):
    if env.get('JIRA_SUBTASK_TYPE'):
        return env['JIRA_SUBTASK_TYPE']
    # Jira 9+: /createmeta/{project}/issuetypes; older Jira: /createmeta?projectKeys=
    meta = request(env, 'GET', '/rest/api/2/issue/createmeta/%s/issuetypes?maxResults=100' % project_key, allow_error=True)
    types = (meta or {}).get('values') or (meta or {}).get('issueTypes') or []
    if not types:
        legacy = request(env, 'GET', '/rest/api/2/issue/createmeta?projectKeys=%s' % project_key, allow_error=True) or {}
        types = [t for p in legacy.get('projects', []) for t in p.get('issuetypes', [])]
    for issue_type in types:
        if issue_type.get('subtask'):
            return issue_type['name']
    return 'Sub-task'


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('parent', help='Story key, e.g. EPMRPP-121704')
    parser.add_argument('title', help='Short FE scope title, e.g. "Pipelines list"')
    parser.add_argument('--desc', help='File with the sub-task description (Jira wiki markup)')
    parser.add_argument('--yes', action='store_true', help='Actually create the issue (default: dry run)')
    args = parser.parse_args()

    env_files = [os.environ['JIRA_ENV_FILE']] if os.environ.get('JIRA_ENV_FILE') else DEFAULT_ENV_FILES
    env = {}
    for path in env_files:
        env = load_env(path)
        if env.get('JIRA_API_TOKEN'):
            break
    if not env.get('JIRA_URL') or not env.get('JIRA_API_TOKEN'):
        sys.exit('JIRA_URL / JIRA_API_TOKEN not found (env file or environment)')

    me = request(env, 'GET', '/rest/api/2/myself')
    parent = request(env, 'GET', '/rest/api/2/issue/%s?fields=summary,project,subtasks' % args.parent)
    fields = parent['fields']
    print('Authenticated as %s · parent %s "%s"' % (me.get('name'), args.parent, fields['summary']))

    for sub in fields.get('subtasks', []):
        summary = sub['fields']['summary']
        if summary.startswith(PREFIX):
            print('Exists: %s "%s" [%s]' % (sub['key'], summary, sub['fields']['status']['name']))
            return

    project_key = fields['project']['key']
    description = open(args.desc, encoding='utf-8').read() if args.desc else (
        'Frontend part of %s.\n\nPlan and status: service-ui `docs/ai-factory-poc/` (00-status.md, 04-implementation-plan.md).'
        % args.parent)
    payload = {'fields': {
        'project': {'key': project_key},
        'parent': {'key': args.parent},
        'issuetype': {'name': subtask_type(env, project_key)},
        'summary': '%s %s' % (PREFIX, args.title),
        'description': description,
        'labels': LABELS,
    }}
    assignee = env.get('JIRA_ASSIGNEE') or me.get('name')
    if assignee:
        payload['fields']['assignee'] = {'name': assignee}

    if not args.yes:
        print('DRY RUN — would create:\n' + json.dumps(payload, indent=2, ensure_ascii=False))
        print('Re-run with --yes to create it.')
        return

    created = request(env, 'POST', '/rest/api/2/issue', payload)
    print('Created %s → %s/browse/%s' % (created['key'], env['JIRA_URL'].rstrip('/'), created['key']))


if __name__ == '__main__':
    main()

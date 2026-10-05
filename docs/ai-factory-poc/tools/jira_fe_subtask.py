#!/usr/bin/env python3
"""Create (or find) the frontend sub-task of an AI Factory PoC story in Jira.

Usage:
  python3 docs/ai-factory-poc/tools/jira_fe_subtask.py EPMRPP-121704 "Pipelines list" \
    --estimate-hours 20 --estimate-comment "4 h research; 10 h implementation; 6 h validation" [--desc FILE] [--yes]

Without --yes the script only prints what it would create (dry run).
Credentials are read from JIRA_ENV_FILE, or else from the first of service-ui/.env, ../prism-ui/.env.local that has a token:
  JIRA_URL, JIRA_API_TOKEN (Personal Access Token, sent as Bearer), optional JIRA_ASSIGNEE (Jira username),
  optional JIRA_SUBTASK_TYPE (default: auto-detected sub-task issue type).
Idempotent: if the parent already has a sub-task with the same full "[FE]" summary, no duplicate issue or
estimate comment is created. With --yes, the existing issue's Original Estimate is synchronized.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DESC_DIR = os.path.join(REPO_ROOT, 'docs', 'ai-factory-poc')
DEFAULT_ENV_FILES = [
    os.path.join(REPO_ROOT, '.env'),                           # service-ui/.env
    os.path.join(REPO_ROOT, '..', 'prism-ui', '.env.local'),   # fallback
]
PREFIX = '[FE]'
LABELS = ['ai-factory-poc', 'frontend']
ESTIMATE_COMMENT_PREFIX = 'Frontend estimate:'


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


def load_credentials():
    env_files = [os.environ['JIRA_ENV_FILE']] if os.environ.get('JIRA_ENV_FILE') else DEFAULT_ENV_FILES
    env = {}
    for path in env_files:
        env = load_env(path)
        if env.get('JIRA_API_TOKEN'):
            break
    if not env.get('JIRA_URL') or not env.get('JIRA_API_TOKEN'):
        sys.exit('JIRA_URL / JIRA_API_TOKEN not found (env file or environment)')
    return env


def read_description(desc_arg, parent):
    """Reads --desc from disk, restricted to inside the repo (no arbitrary/absolute paths —
    this script can be invoked by an AI agent, whose arguments must not be trusted to read
    whatever file a crafted prompt points it at)."""
    if not desc_arg:
        return (
            'Frontend part of %s.\n\nPlan and status: service-ui `docs/ai-factory-poc/` (00-status.md, 04-implementation-plan.md).'
            % parent)
    # Only a bare file name inside DESC_DIR is accepted: directory parts of the argument are
    # dropped, and the opened path is taken from the directory listing, never from the argument.
    desc_name = os.path.basename(desc_arg)
    desc_path = next(
        (os.path.join(DESC_DIR, name) for name in os.listdir(DESC_DIR)
         if name == desc_name and os.path.isfile(os.path.join(DESC_DIR, name))),
        None)
    if desc_path is None:
        sys.exit('--desc must be an existing file name inside %s: %s' % (DESC_DIR, desc_arg))
    with open(desc_path, encoding='utf-8') as handle:
        return handle.read()


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


def positive_hours(value):
    try:
        hours = float(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError('must be a number') from error
    if hours <= 0 or not hours.is_integer():
        raise argparse.ArgumentTypeError('must be a positive whole number of hours')
    return int(hours)


def estimate_text(hours):
    return '%sh' % hours


def estimate_comment(hours, detail):
    return '%s %s\n\n%s' % (ESTIMATE_COMMENT_PREFIX, estimate_text(hours), detail.strip())


def ensure_estimate(env, issue_key, hours, detail):
    """Synchronize Original Estimate and add one idempotent breakdown comment."""
    issue = request(env, 'GET', '/rest/api/2/issue/%s?fields=timetracking,comment' % issue_key)
    expected_seconds = hours * 60 * 60
    actual_seconds = (issue.get('fields', {}).get('timetracking') or {}).get('originalEstimateSeconds')
    if actual_seconds != expected_seconds:
        request(env, 'PUT', '/rest/api/2/issue/%s' % issue_key, {
            'fields': {'timetracking': {'originalEstimate': estimate_text(hours)}}
        })
        print('Set Original Estimate on %s: %s' % (issue_key, estimate_text(hours)))
    else:
        print('Original Estimate already set on %s: %s' % (issue_key, estimate_text(hours)))

    body = estimate_comment(hours, detail)
    comments = ((issue.get('fields', {}).get('comment') or {}).get('comments') or [])
    if any(comment.get('body') == body for comment in comments):
        print('Estimate comment already exists on %s.' % issue_key)
        return
    request(env, 'POST', '/rest/api/2/issue/%s/comment' % issue_key, {'body': body})
    print('Added estimate breakdown comment to %s.' % issue_key)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('parent', help='Story key, e.g. EPMRPP-121704')
    parser.add_argument('title', help='Short FE scope title, e.g. "Pipelines list"')
    parser.add_argument('--desc', help='File with the sub-task description (Jira wiki markup)')
    parser.add_argument('--estimate-hours', required=True, type=positive_hours,
                        help='Required Original Estimate in whole hours, capped at 36')
    parser.add_argument('--estimate-comment', required=True,
                        help='Required Jira comment with the research / implementation / validation breakdown')
    parser.add_argument('--yes', action='store_true', help='Actually create the issue (default: dry run)')
    args = parser.parse_args()
    if args.estimate_hours > 36:
        parser.error('--estimate-hours must be no larger than 36')
    if not args.estimate_comment.strip():
        parser.error('--estimate-comment must not be empty')

    env = load_credentials()

    me = request(env, 'GET', '/rest/api/2/myself')
    parent = request(env, 'GET', '/rest/api/2/issue/%s?fields=summary,project,subtasks' % args.parent)
    fields = parent['fields']
    print('Authenticated as %s · parent %s "%s"' % (me.get('name'), args.parent, fields['summary']))

    target_summary = '%s %s' % (PREFIX, args.title)
    for sub in fields.get('subtasks', []):
        summary = sub['fields']['summary']
        if summary == target_summary:
            print('Exists: %s "%s" [%s]' % (sub['key'], summary, sub['fields']['status']['name']))
            if not args.yes:
                print('DRY RUN — would ensure Original Estimate %s and comment:\n%s' % (
                    estimate_text(args.estimate_hours), estimate_comment(args.estimate_hours, args.estimate_comment)))
                print('Re-run with --yes to apply it to the existing issue.')
                return
            ensure_estimate(env, sub['key'], args.estimate_hours, args.estimate_comment)
            return

    project_key = fields['project']['key']
    description = read_description(args.desc, args.parent)
    payload = {'fields': {
        'project': {'key': project_key},
        'parent': {'key': args.parent},
        'issuetype': {'name': subtask_type(env, project_key)},
        'summary': target_summary,
        'description': description,
        'labels': LABELS,
        'timetracking': {'originalEstimate': estimate_text(args.estimate_hours)},
    }}
    assignee = env.get('JIRA_ASSIGNEE') or me.get('name')
    if assignee:
        payload['fields']['assignee'] = {'name': assignee}

    if not args.yes:
        print('DRY RUN — would create:\n' + json.dumps(payload, indent=2, ensure_ascii=False))
        print('Then add estimate breakdown comment:\n' + estimate_comment(
            args.estimate_hours, args.estimate_comment))
        print('Re-run with --yes to create it.')
        return

    created = request(env, 'POST', '/rest/api/2/issue', payload)
    print('Created %s → %s/browse/%s' % (created['key'], env['JIRA_URL'].rstrip('/'), created['key']))
    ensure_estimate(env, created['key'], args.estimate_hours, args.estimate_comment)


if __name__ == '__main__':
    main()

import re
import time
import multiprocessing
import os

from git import Repo
from jira import JIRA

# You can use following environment variables:
# JIRA_SERVER - Jira server URL (required)
# JIRA_TOKEN - Jira token (required)
# LATEST_RELEASE_TAG - latest release tag (optional). Takes the latest tag if not specified from git.
# JIRA_FIX_VERSION - Jira fix version (optional). Takes the version from active branch name (release/<version>) if not specified.

repo = Repo()
jira_server = JIRA(
        server=os.environ.get('JIRA_SERVER'),
        token_auth=os.environ.get('JIRA_TOKEN'),
        )

project_name = 'EPMRPP'

# def update_issue_task(issue_id, jira_fix_version):
#     try:
#         issue = jira_server.issue(issue_id, fields='None')
#         issue.update(fields={'fixVersions': [{'name': jira_fix_version}]}, notify=False)
#         return issue_id
#     except:
#         print("Error: Can't update issue: " + issue_id)

def main():
    repo_name = repo.working_tree_dir.split("/")[-1]
    current_brunch = repo.active_branch
    
    # Get new version for Jira fix version
    jira_fix_version = os.environ.get('JIRA_FIX_VERSION')
    if not jira_fix_version:
        try:
            # Get version from branch name
            new_version_pattern = re.compile(r'/[0-9]+\.[0-9]?.+')
            new_version = new_version_pattern.search(
                current_brunch.name).group().split('/')[1]
            jira_fix_version = repo_name + '-' + new_version
        except:
            print("Error: Can't get new version. Check brunch name according to the pattern: <branch_name>/<version>.")

    # Get latest tag
    latest_tag = os.environ.get('LATEST_RELEASE_TAG')
    if not latest_tag:
        try:
            # Get latest tag from git
            sorted_tags = sorted(repo.tags, key=lambda t: t.commit.committed_datetime)
            latest_tag = sorted_tags[-1]
        except:
            print("Error: Can't get latest tag. Check if there are any tags in the repo.")

    # Get Jira issues ids from git commits
    git_commits = repo.git.log(str(latest_tag) + '..HEAD', '--pretty=%s').split('\n')

    jira_id_pattern = re.compile(r'EPMRPP-[0-9]+')
    jira_issues_ids = {
        jira_id_pattern.search(line).group()
        for line in git_commits
        if jira_id_pattern.match(line)
        }
    
    # Print info
    print("Repo name:", repo_name)
    print("Current brunch:", current_brunch)
    print("Jira fix version:", jira_fix_version)
    print("Latest tag:", latest_tag)
    print("Numbers of Jira issues:", len(jira_issues_ids))
    print(jira_issues_ids)

    # # Check if version exists and create it if not
    # if jira_server.get_project_version_by_name(project_name, jira_fix_version) is None:
    #     jira_server.create_version(name=jira_fix_version, project=project_name)

    # # Update Fix Version field for all Jira issues
    # start = time.time()

    # with multiprocessing.Pool() as p:
    #     results = [p.apply_async(update_issue_task, args=(jira_issue, jira_fix_version)) for jira_issue in jira_issues_ids]
    #     for r in results:
    #         r.wait()

    # end = time.time()
    # total_time = end - start
    # print("Time execution:" + str(total_time))
    # print("The following issues were updated:" + str([r.get() for r in results]))
    
if __name__ == "__main__":
    main()
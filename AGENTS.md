# KainCheck working directory

This repository is the canonical working directory for KainCheck. Make all future source changes, tests, documentation updates and generated project files here. Do not create or keep editing a second `mobile-app` checkout as the primary source.

- Read `project-files/development/workspace.json` when present for this computer's workspace and deployment staging paths.
- Keep academic documents, private verification records and other local deliverables under the ignored `project-files/` directory. Automated screenshots and reports belong in `project-files/verification/current/`.
- Use the Sites skill for hosted changes and preserve the existing `.openai/hosting.json` project ID and current audience unless the user requests otherwise. The older managed Site checkout is a deployment staging mirror only: open it through the source helper, sync the verified canonical source into it, and publish that matching source/build. Do not overwrite this repository with an older staging copy or merge the unrelated Site and GitHub histories.
- Preserve local uncommitted changes and keep provider secrets in server-side configuration.

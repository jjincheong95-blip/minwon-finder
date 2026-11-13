# Public publishing setup

This folder contains only the files intended to be visible on the public site. The API key is never placed in this folder or sent to visitors' browsers.

1. Create a **public** GitHub repository for this site and upload the project files, excluding `.env`, `돌의자리.html`, and `계곡-돌탑-풍경.jpg`.
2. In the repository, open **Settings → Secrets and variables → Actions → New repository secret**. Set the name to `DATA_GO_SERVICE_KEY` and paste the data.go.kr key as its value.
3. Open **Settings → Pages** and select **GitHub Actions** as the deployment source.
4. Ensure the default branch is named `main`. The workflow publishes on each push and refreshes the nationwide data daily.

GitHub Pages and standard GitHub Actions are free for a public repository. The published repository and site are public. The dataset refresh is subject to the API key's quota and data.go.kr service availability.


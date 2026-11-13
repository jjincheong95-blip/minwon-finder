# 민원한눈에 공개 배포 묶음

이 폴더만 공개 GitHub 저장소에 올리면 됩니다. 개인 자료, `.env`, 로컬 서버는 포함되어 있지 않습니다.

## 게시 순서

1. GitHub에서 새 저장소 `minwon-finder`를 **Public**으로 만듭니다.
2. 이 폴더 안의 `.github`, `scripts`, `public-site`, `README.md`를 저장소에 올립니다. 기본 브랜치 이름은 `main`으로 둡니다.
3. 첫 실행 전에 저장소의 **Settings → Secrets and variables → Actions → New repository secret**에서 `DATA_GO_SERVICE_KEY`라는 이름으로 공공데이터포털 인증키를 저장합니다.
4. **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
5. **Actions** 탭에서 `Update data and publish Pages`를 실행합니다. 완료된 페이지 주소는 **Settings → Pages**에서 확인할 수 있습니다.

이 공개 저장소의 GitHub Pages와 표준 GitHub Actions 실행은 무료입니다. 별도 결제 기능을 켜지 않아도 됩니다. 공개 저장소와 웹사이트는 누구나 볼 수 있고, 인증키는 GitHub Actions secret으로만 저장되어 방문자에게 전달되지 않습니다. 데이터는 매일 한국시간 오전 6시 17분에 갱신되며, 공공데이터포털의 API 제공 상태와 인증키 한도에 영향을 받습니다.


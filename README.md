## 專案需求

- 網路上的一些其他見解 (以 React 為例，可以參考就好)
  - 用 Redux 在 Micro Frontend 之間共享狀態
  - Container 必須使用 Web Components
  - 每個 Micro Frontend 可以是一個能直接被其他 App 引用的 React Component

### Child & Child

- 不能有任何耦合
  - 否則單一專案的更新，會導致另一個耦合專案進行更新
  - 直到有一天可能會沒有人知道 React 怎麼用，也不會改
- 不會共享 functions/objects/classes 等等
- 不會共享 state
- 允許在 Module Federation System 之間共享 Libraries

### Container & Child

- 盡可能不要有任何耦合
  - 就算需要某種最小程度的溝通方式，但 container 不會受到 child 的影響
  - 溝通方式會使用最基礎的模式 Ex. Callback、Event Structures 等等
- 透過 `mount` function 而不是 react component 這種框架限定的東西，我們不會限制任何框架的使用

### Styling

- 不同專案的 CSS 不能互相影響，需要為 Scoped 的方式

### Version Control

- Version Control 的方式不應該影響專案
- 可以自行選擇是否要使用 Separate Repo 或是 Monorepo

### Production & Deployment

- Container 可以決定要用某個版本的 Micro Frontend (或說 Child Version)
- 選擇一: 永遠使用最新版本的 Micro Frontend (Container 不用 Redeploy)
- 選擇二: 使用指定版本的 Micro Frontend (Container 修改時需要 Redeploy)
- Ex. Marketing Project 只有在某個特定時間點才會想要使用最新的版本

## 實作

### Config

- 在察看 network 的時候，載入 library 時可能會發現好像沒有載入重複資源 (還未設定 shared)
  - 以下 兩個檔案看起來是不同的 Library 沒有重複，但實際上這個檔案名稱是隨機的
    - vendors-node_modules_react-dom_index_js.js
    - vendors-node_modules_material-ui_core_esm_Box_Box_js-node_modules_material-ui_core_esm_Button-5a9980.js
  - 也就是我們在設置 shared 之前，裡面仍然同時有 React 和 ReactDOM，檢視檔案內容查詢 react 就能發現了
- shared
  - 有些情況我們想要指定 shared 的資源，例如指定特定版本或設定
  - 但很多時候我們希望 webpack 幫我們自己發現哪些能共用，可以改引用 packageJson.dependencies (不需要轉陣列)

### Deployment

- child app 的 remoteEntry.js URL 必須讓 container 在【build time】就知道! 畢竟在跑的時候需要知道資源在哪裡才能跑
- 要確保我們使用的部屬服務能獨立部屬各個 micro frontend
- 要小心 caching 的問題 (remoteEntry.js)
- 此專案部屬到 AWS S3
  - 使用者導覽到某個 URL 時，會從 AWS CloudFront (CDN) 請求資源
  - AWS CloudFront 會知道要從哪個 S3 bucket 取出檔案
    - container:index.js -> container:main.js -> marketing:remoteEntry.js -> marketing:main.js

### CICD (Github Actions)

- workflow (distinct for each sub project) - container
  - Triggered when code is pushed and commit contains changes to the container folder
  1. 切到 container 資料夾
  2. 下載依賴
  3. 透過 webpack 建立 production build
  4. 將 build result 上傳到 AWS S3

### AWS S3 Bucket

- 預設情況下，所有上傳的資料是私密的，但這裡因為放的是 host files，當然希望他公開
- 到 properties 中 enable static website hosting
  - index document - index.html (這裡會被後面 Cloudfront.. 做的設定覆蓋)
- 到 permissions 中把 Block public access 全部關掉 (跳出的提示可以忽略因為公開內部的資源是我們需要的)
- 到 permissions 中設定 Bucket Policy，點選 Edit 後點選 Generate Policy 開啟分業進行資料填寫生成 Policy
  - Type: S3 Bucket Policy
  - Effect: Allow
  - Principle: \*
  - Actions: GetObject
  - Amazon Resource Name: 到原頁面複製 Bucket ARN 貼過來 + "/\*"
    - `{Bucket ARN}/*`
  - Add Statement -> Generate Policy -> Copy
  - 貼進去原頁面的 Policy -> Save Changes
- 我們不會直接從 Bucket 中取用資源，而是會透過 Amazon CloudFront (CDN) 取用

### Cloudfront Distribution Setup

- Distribution - 一些我們想要公開外部的檔案
- 另開一頁處理 Cloudfront (保留原本 Bucket 的 Tab 等等會用到)
  - Create a CloudFront distribution
    - Origin Domain Name: 選擇剛剛建立的 S3 Bucket
    - Default cache behavior 的 Viewer protocol policy: Redirect HTTP to HTTPS
    - Create Distribution (前面沒提到的都保留預設值就好)
  - 點選剛剛的 Distribution 並在 General 中的 Settings 點選 Edit (Remapping error)
    - Default root object: `/container/latest/index.html`
  - 到 Error pages 中點選 Create custom error response
    - HTTP error code: 403: Forbidden
    - Customize error response: yes
      - Response page path: `/container/latest/index.html`
    - HTTP Response Code: 200: Ok
  - 回到 General 看到的 Distribution domain name 就是接下來要請求的路徑

### Github Actions & AWS

- AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY 用來存取我們的 AWS 帳號
  - 到 AWS Console 中透過 IAM 生成
    - Users -> Create user
      - 填寫名字
      - Next
      - Permissions options: Attach policies directly
        - 比較好的方式應該要限制這個使用者能夠存取的特定 Bucket
      - Permissions policies: AmazonS3FullAccess & CloudFrontFullAccess
      - Next
      - Create user
    - 點進去剛剛建立的 user 並到 Access key 欄位點選 Create access key
      - Use case: Command Line Interface (CLI)
      - Check confirmation
      - Next
      - Copy secret key
- AWS_DEFAULT_REGION
  - 去 S3 中找到 Bucket 並從最後面取得 Region (Ex. ap-southeast-2)
- 到 github 設定 action yml 中所需要的 secrets
  - Settings -> Secrets and variables -> Actions
  - Repository secrets -> New repository secret
  - 建立 AWS_S3_BUCKET_NAME / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY

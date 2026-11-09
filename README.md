# 어느 밤, 술집

홍상수 영화 같은 밤 술집을 걸어 다니는 3D 웹 공간입니다.
여덟 개의 테이블에 NPC 두 명씩 앉아 있고, 입구 쪽에는 손님들끼리 앉는 빈 테이블이 네 개 있습니다.

빌드 과정이 없는 HTML 파일 하나입니다. Three.js는 CDN에서 불러옵니다.

## 조작

| 동작 | PC | 모바일 |
|---|---|---|
| 걷기 | WASD / 방향키 (Shift: 빨리) | 왼쪽 스틱 |
| 둘러보기 | 마우스로 끌기 | 화면 끌기 |
| 앉기 | 빈 의자 앞에서 E | "앉기" 버튼 |
| 일어나기 | Esc / Q | "일어나기" 버튼 |
| 술 따르기 · 마시기 · 담배 · 고백 | 1 · 2 · 3 · 4 | 하단 버튼 |
| 말하기 | T 또는 Enter | "말하기" 버튼 |

## GitHub Pages로 올리기

1. GitHub에서 새 저장소를 만듭니다 (Public).
2. 이 폴더의 파일(`index.html`, `README.md`, `.nojekyll`)을 저장소 최상단에 올립니다.
   웹에서는 "Add file → Upload files"로 끌어다 놓으면 됩니다.
3. 저장소의 Settings → Pages → Build and deployment에서
   Source를 "Deploy from a branch", Branch를 `main` / `(root)`로 고르고 Save를 누릅니다.
4. 1~2분 뒤 `https://<아이디>.github.io/<저장소이름>/` 주소로 들어갈 수 있습니다.

## 같이하기 (Firebase)

같은 주소에 들어온 사람들은 Firebase Realtime Database로 서로의 위치, 자리, 행동, 말을 주고받습니다.

| 파일 | 하는 일 |
|---|---|
| `config.js` | Firebase 접속 정보 |
| `firebase-room.js` | 다른 사람들과 상태를 주고받는 연결 코드 |
| `database.rules.json` | 데이터베이스 보안 규칙 (Firebase 콘솔에 붙여넣기) |

### 처음 한 번 해야 할 것

1. Firebase 콘솔 → Realtime Database → **규칙** 탭에서 기존 내용을 지우고
   `database.rules.json` 내용을 붙여넣은 뒤 **게시**합니다.
2. Authentication → **설정** → **승인된 도메인**에 `<아이디>.github.io`를 추가합니다.

연결에 실패하면 게임은 혼자 모드로 그대로 돌아갑니다.
브라우저 개발자 도구 콘솔에 "같이하기 연결 실패"가 보이면 `config.js` 값을 확인하세요.

### 무료 요금제(Spark) 한도

동시 접속 100명, 월 다운로드 10GB까지 무료입니다.
걸을 때 위치는 0.2초에 한 번만 보내도록 줄여 두었기 때문에, 몇십 명이 가끔 노는 정도는 충분합니다.

## 대사

모든 NPC 대사는 이 공간을 위해 새로 쓴 것입니다.

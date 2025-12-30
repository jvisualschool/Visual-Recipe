# 👨‍💻 CHEF 비주얼 레시피 생성기 - 개발자 가이드

> 기술 스택, 아키텍처, API 문서, 배포 가이드

---

## 📋 목차
1. [기술 스택](#기술-스택)
2. [프로젝트 구조](#프로젝트-구조)
3. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
4. [API 문서](#api-문서)
5. [데이터베이스 스키마](#데이터베이스-스키마)
6. [배포 가이드](#배포-가이드)
7. [설정 파일](#설정-파일)
8. [비용 분석](#비용-분석)

---

## 🛠️ 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 18.x | UI 프레임워크 |
| **Vite** | 7.x | 빌드 도구 |
| **TailwindCSS** | 3.x | 스타일링 |
| **Zustand** | - | 상태 관리 |
| **React Router** | 6.x | 라우팅 |
| **FontAwesome** | 6.x | 아이콘 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| **PHP** | 8.3 | 서버 사이드 로직 |
| **MySQL/MariaDB** | - | 데이터베이스 |
| **Apache** | 2.4 | 웹 서버 |

### AI/API
| 서비스 | 모델 | 용도 |
|--------|------|------|
| **Google Gemini** | `gemini-2.0-flash-exp` | 텍스트 생성 (레시피) |
| **Google Gemini** | `gemini-3-pro-image-preview` | 이미지 생성 |

---

## 📁 프로젝트 구조

```
CHEF비주얼레시피생성기/
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/       # 재사용 컴포넌트
│   │   ├── pages/            # 페이지 컴포넌트
│   │   │   ├── Hero.jsx      # 메인 생성 페이지
│   │   │   ├── Gallery.jsx   # 갤러리 페이지
│   │   │   └── Creator.jsx   # 생성기 (대체 UI)
│   │   ├── lib/
│   │   │   ├── api.js        # API 클라이언트
│   │   │   ├── translations.js # 다국어 지원
│   │   │   └── utils.js
│   │   ├── store/
│   │   │   └── recipeStore.js # Zustand 스토어
│   │   └── index.css         # 전역 스타일
│   ├── public/
│   │   └── previews/         # 스타일/레이아웃 미리보기 이미지
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── api/
│   │   ├── config.php        # API 키 설정
│   │   ├── db.php            # DB 연결
│   │   ├── generate.php      # 레시피 생성 API
│   │   ├── recipes.php       # 레시피 CRUD API
│   │   ├── auth.php          # 인증/사용량 관리
│   │   └── stats.php         # 통계 API
│   └── db_schema.sql         # DB 스키마
│
├── docs/                     # 문서
│   ├── USER_GUIDE.md
│   └── DEVELOPER_GUIDE.md
│
├── style/                    # 스타일 미리보기 원본 이미지
├── layout/                   # 레이아웃 미리보기 원본 이미지
├── deploy.sh                 # 배포 스크립트
└── server_config.json        # 서버 설정
```

---

## 🖥️ 로컬 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- PHP 8.0+
- MySQL/MariaDB
- Google Cloud API 키 (Gemini API)

### Frontend 설정
```bash
cd frontend
npm install
npm run dev
```
- 개발 서버: `http://localhost:5173`

### Backend 설정
1. PHP 내장 서버 또는 XAMPP/MAMP 사용
2. `backend/api/config.php`에 API 키 설정
3. MySQL에 `db_schema.sql` 실행

### 환경 변수 설정 (config.php)
```php
define('GEMINI_API_KEY', 'YOUR_API_KEY');
define('MODEL_TEXT', 'gemini-2.0-flash-exp');
define('MODEL_IMAGE', 'gemini-3-pro-image-preview');
```

---

## 📡 API 문서

### 1. 레시피 생성
```
POST /api/generate.php
```

**Request Body:**
```json
{
  "dish": "김치찌개",
  "style": "minimal",
  "ratio": "vertical",
  "lang": "ko",
  "render_mode": "embedded",
  "created_by": "user@email.com"
}
```

**Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `dish` | string | ✅ | 요리 이름 |
| `style` | string | - | minimal, infographic, watercolor, graphic, sketch, girlish, botanical |
| `ratio` | string | - | vertical, horizontal, square |
| `lang` | string | - | ko, en, bilingual |
| `render_mode` | string | - | embedded, overlay |
| `created_by` | string | - | 생성자 이메일 |

**Response:**
```json
{
  "success": true,
  "id": 123,
  "data": {
    "title": "김치찌개 (Kimchi Stew)",
    "ingredients": { "ko": [...], "en": [...] },
    "steps": { "ko": [...], "en": [...] },
    "image_url": "/CHEF/uploads/recipe_xxx.png"
  }
}
```

### 2. 레시피 목록 조회
```
GET /api/recipes.php
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "김치찌개",
      "image_url": "/CHEF/uploads/...",
      "created_at": "2025-12-21 10:00:00"
    }
  ]
}
```

### 3. 레시피 삭제
```
DELETE /api/recipes.php?id=123
```

### 4. 사용량 확인
```
POST /api/auth.php
```
```json
{ "action": "check", "email": "user@email.com" }
```

---

## 🗄️ 데이터베이스 스키마

### recipes 테이블
```sql
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    ingredients_json TEXT,
    steps_json TEXT,
    image_url VARCHAR(500),
    image_embedded_url VARCHAR(500),
    style_type VARCHAR(50) DEFAULT 'minimal',
    view_type VARCHAR(50) DEFAULT 'standard',
    render_mode VARCHAR(50) DEFAULT 'embedded',
    text_positions_json TEXT,
    final_prompt TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### users 테이블
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    photo_url VARCHAR(500),
    daily_count INT DEFAULT 0,
    last_reset_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 배포 가이드

### 자동 배포 (deploy.sh)
```bash
./deploy.sh
```

**deploy.sh 기능:**
1. ✅ 프론트엔드 빌드 (`npm run build`)
2. ✅ 원격 서버 백업 (DB, 코드, 이미지)
3. ✅ 백업 자동 순환 (최근 4개 유지)
4. ✅ 파일 업로드 (SCP)
5. ✅ 권한 설정

### 수동 배포
```bash
# 1. 프론트엔드 빌드
cd frontend && npm run build

# 2. 빌드 파일 업로드
scp -r dist/* user@server:/path/to/CHEF/

# 3. 백엔드 업로드
scp -r backend/api/* user@server:/path/to/CHEF/api/

# 4. 권한 설정
ssh user@server "chmod -R 777 /path/to/CHEF/uploads"
```

### 서버 설정 (server_config.json)
```json
{
  "REMOTE_HOST": "15.164.161.165",
  "REMOTE_USER": "bitnami",
  "SSH_KEY": "/path/to/key.pem",
  "REMOTE_WEB_ROOT": "/opt/bitnami/apache/htdocs/CHEF",
  "DB_NAME": "bitnami_app",
  "DB_USER": "root",
  "DB_PASS": "YOUR_PASSWORD"
}
```

---

## ⚙️ 설정 파일

### vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/CHEF/',  // 서브 디렉토리 배포 시 필수
  build: {
    outDir: 'dist'
  }
});
```

### config.php
```php
// AI 모델 설정
define('MODEL_TEXT', 'gemini-2.0-flash-exp');    // 텍스트 생성
define('MODEL_IMAGE', 'gemini-3-pro-image-preview'); // 이미지 생성

// API 키
define('GEMINI_API_KEY', 'YOUR_KEY');
```

---

## 💰 비용 분석

### 레시피 1개 생성 비용
| 모드 | API 호출 | 예상 비용 |
|------|----------|----------|
| **Embedded** | 텍스트 1회 + 이미지 1회 | **~$0.03 (≈40원)** |
| **Overlay** | 텍스트 2회 + 이미지 2회 | **~$0.06 (≈80원)** |

### 가격표 (Gemini 2.0 Flash)
| 항목 | 가격 |
|------|------|
| 입력 토큰 | $0.10 / 백만 토큰 |
| 출력 토큰 | $0.40 / 백만 토큰 |
| 이미지 생성 | ~$0.02-0.04 / 이미지 |

---

## 🔧 트러블슈팅

### 이미지 업로드 권한 오류
```bash
chmod -R 777 /path/to/CHEF/uploads
```

### CORS 오류
`backend/api/` 파일들에 헤더 추가:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### API 할당량 초과
- Google Cloud Console에서 할당량 확인
- 무료 티어: 분당 60회 요청 제한

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-21 | 1.0.0 | 초기 릴리즈 |
| 2025-12-21 | 1.1.0 | 보태니컬 아트 스타일 추가 |
| 2025-12-21 | 1.2.0 | 50가지 요리 상식 추가 |
| 2025-12-21 | 1.3.0 | 스타일/레이아웃 미리보기 이미지 추가 |

---

*마지막 업데이트: 2025-12-21*

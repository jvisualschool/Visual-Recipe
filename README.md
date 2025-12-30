# 🍳 CHEF - AI Visual Recipe Generator

> AI 기반 비주얼 레시피 생성기 - 요리 이름 하나로 아름다운 레시피 인포그래픽을 자동 생성합니다

**Live Demo**: [https://jvibeschool.org/CHEF/](https://jvibeschool.org/CHEF/)

---

## 🌟 주요 장점

### 1️⃣ **초간단 레시피 생성**
- 요리 이름만 입력하면 끝!
- AI가 자동으로 재료와 조리법 분석
- 30초 만에 전문가급 레시피 인포그래픽 완성

### 2️⃣ **7가지 비주얼 스타일**
다양한 스타일로 나만의 레시피북 제작:
- 🎯 **미니멀**: 깔끔한 모던 디자인
- 📊 **인포그래픽**: 3D 일러스트 스타일
- 🎨 **수채화**: 감성적인 파스텔 톤
- ✏️ **그래픽**: 손그림 마커 스타일
- 📝 **스케치**: 연필 스케치 느낌
- 💕 **여중생**: 색연필 일러스트
- 🌿 **보태니컬**: 식물도감 스타일

### 3️⃣ **완벽한 다국어 지원**
- 한국어 / 영어 / 이중언어 선택 가능
- AI가 자동으로 재료와 조리법 번역
- 글로벌 레시피북 제작 가능

### 4️⃣ **프로페셔널 출력 품질**
- 4K 고해상도 이미지 생성
- PDF 출력 최적화
- 소셜 미디어 공유 완벽 지원

### 5️⃣ **스마트 갤러리**
- 생성된 모든 레시피 자동 저장
- 검색 및 필터링 기능
- 원클릭 다운로드

---

## 🛠️ 기술 스택

### Frontend
```
React 19 + Vite
├── Zustand (상태 관리)
├── TailwindCSS (스타일링)
├── Lucide React (아이콘)
└── html2canvas (이미지 캡처)
```

### Backend
```
PHP 8.3 + MySQL 8.0
├── Apache 2.4 (웹 서버)
├── MariaDB (데이터베이스)
└── RESTful API 아키텍처
```

### AI/ML
```
Google Gemini API
├── Gemini 2.0 Flash Exp (텍스트 분석)
├── Gemini 3 Pro Image Preview (이미지 생성)
└── Vision API (텍스트 위치 감지)
```

### 인증 & 결제
```
Google OAuth 2.0 (로그인)
└── 일일 생성 제한: 2회/일
```

---

## 🎯 동작 방식

### 전체 플로우
```
사용자 입력 → Chef AI → Artist AI → 데이터베이스 → 갤러리
```

### 상세 프로세스

#### 1. **사용자 인증**
```
Google 로그인 → 일일 사용량 확인 → 생성 권한 검증
```

#### 2. **Chef AI (텍스트 분석)**
```javascript
입력: "김치찌개"
↓
Gemini 2.0 Flash Exp 분석
↓
출력: {
  title_ko: "김치찌개",
  title_en: "Kimchi Stew",
  ingredients_ko: ["김치", "돼지고기", "두부", ...],
  ingredients_en: ["Kimchi", "Pork", "Tofu", ...],
  steps_ko: ["김치 볶기", "육수 넣기", ...],
  steps_en: ["Stir-fry kimchi", "Add broth", ...]
}
```

#### 3. **Artist AI (이미지 생성)**
```javascript
레시피 데이터 + 스타일 선택
↓
Gemini 3 Pro Image Preview
↓
프롬프트 최적화:
- 텍스트 크기: LARGE, BOLD (가독성 최적화)
- 비주얼 품질: 전문 푸드 포토그래피 스타일
- 색상: 생동감 있는 자연색
- 구성: 완성 요리 + 재료 + 조리 과정
↓
4K 고해상도 이미지 생성
```

#### 4. **데이터베이스 저장**
```sql
INSERT INTO recipes (
  title, 
  ingredients_json, 
  steps_json, 
  image_url,
  style_type,
  view_type,
  layout_type,
  language_code,
  render_mode,
  final_prompt
)
```

#### 5. **갤러리 표시**
```
최신 레시피 자동 로드 → 카드 형식 표시 → 클릭 시 상세 모달
```

---

## 📁 프로젝트 구조

```
CHEF/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx      # 레이아웃 + 네비게이션
│   │   │   └── OverlayEditor.jsx  # 드래그 편집기 (미사용)
│   │   ├── pages/
│   │   │   ├── Hero.jsx        # 메인 생성 페이지
│   │   │   └── Gallery.jsx     # 갤러리 페이지
│   │   ├── store/
│   │   │   └── recipeStore.js  # Zustand 전역 상태
│   │   ├── lib/
│   │   │   ├── api.js          # API 클라이언트
│   │   │   ├── translations.js # 다국어 번역
│   │   │   └── utils.js        # 유틸리티 함수
│   │   ├── App.jsx             # 라우터 설정
│   │   └── index.css           # 글로벌 스타일
│   ├── public/
│   │   ├── previews/           # 스타일/레이아웃 미리보기 이미지
│   │   └── chef.svg            # 로고
│   └── package.json
│
├── backend/                     # PHP 백엔드
│   ├── api/
│   │   ├── auth.php            # Google 로그인 + 사용량 제한
│   │   ├── generate.php        # 레시피 생성 (핵심)
│   │   ├── recipes.php         # 레시피 조회
│   │   ├── delete.php          # 레시피 삭제
│   │   ├── like.php            # 좋아요 기능
│   │   ├── stats.php           # 통계
│   │   ├── config.php          # 설정 (모델, API 키)
│   │   ├── secrets.php         # API 키 (gitignore)
│   │   └── db.php              # DB 연결
│   ├── uploads/                # 생성된 이미지 저장
│   └── db_schema.sql           # DB 스키마
│
├── deploy.sh                    # 배포 스크립트
├── server_config.json          # 서버 설정
└── README.md                   # 이 파일
```

---

## 🚀 로컬 개발 환경 설정

### 1. 사전 요구사항
- Node.js 18+
- PHP 8.3+
- MySQL 8.0+
- Google Gemini API 키

### 2. Frontend 설정
```bash
cd frontend
npm install
npm run dev
```
→ http://localhost:5173 에서 실행

### 3. Backend 설정

#### 3.1 API 키 설정
```bash
cd backend/api
cp secrets.php.example secrets.php
# secrets.php 파일에 Gemini API 키 입력
```

#### 3.2 데이터베이스 설정
```bash
mysql -u root -p
CREATE DATABASE bitnami_app;
USE bitnami_app;
SOURCE backend/db_schema.sql;
```

#### 3.3 Apache 설정
```apache
<VirtualHost *:80>
    DocumentRoot "/path/to/CHEF"
    <Directory "/path/to/CHEF">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 4. 환경 변수
`frontend/src/lib/api.js`에서 API URL 수정:
```javascript
const API_BASE = 'http://localhost/CHEF/backend/api';
```

---

## 🎨 사용 방법

### 기본 사용법
1. **로그인**: Google 계정으로 로그인
2. **요리 입력**: 원하는 요리 이름 입력 (예: "김치찌개")
3. **옵션 선택**:
   - 언어: 한국어 / 영어 / 이중언어
   - 비율: 세로 / 가로 / 정사각형
   - 스타일: 7가지 중 선택
   - 레이아웃: 4가지 구성 중 선택
   - 렌더 모드: Embedded (텍스트 포함) / Overlay (HTML 오버레이)
4. **생성**: "Generate Visual Recipe" 클릭
5. **다운로드**: 생성된 이미지 다운로드 또는 갤러리에서 확인

### 고급 기능
- **스타일 미리보기**: ? 아이콘 클릭하여 각 스타일 확인
- **레이아웃 미리보기**: ? 아이콘 클릭하여 구성 확인
- **갤러리 검색**: 생성된 레시피 검색 및 필터링
- **상세 모달**: 레시피 클릭 시 재료/조리법 상세 확인

---

## 🔐 보안 & 제한사항

### 사용량 제한
- **일반 사용자**: 하루 2회 생성 가능
- **관리자**: 무제한 생성 가능
- Google 로그인 필수

### API 키 보안
- `secrets.php` 파일은 gitignore 처리
- 서버 환경에서만 API 키 사용
- 프론트엔드에 API 키 노출 없음

### 데이터베이스
- 사용자 정보: 이메일, 이름, 프로필 사진
- 사용 기록: 날짜별 생성 횟수 추적
- 레시피 데이터: 제목, 재료, 조리법, 이미지 URL

---

## 📊 데이터베이스 스키마

### `users` 테이블
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### `user_usage` 테이블
```sql
CREATE TABLE user_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_date (email, created_at)
);
```

### `recipes` 테이블
```sql
CREATE TABLE recipes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  ingredients_json JSON NOT NULL,
  steps_json JSON NOT NULL,
  image_url TEXT NOT NULL,
  image_embedded_url TEXT,
  view_type ENUM('vertical', 'horizontal', 'square'),
  layout_type ENUM('standard', 'bento', 'radial', 'magazine'),
  style_type VARCHAR(50),
  language_code ENUM('ko', 'en', 'bilingual'),
  render_mode VARCHAR(20),
  text_positions_json JSON,
  final_prompt TEXT,
  likes INT DEFAULT 0,
  view_count INT DEFAULT 0,
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚢 배포

### 자동 배포 스크립트
```bash
./deploy.sh
```

배포 스크립트는 다음을 수행합니다:
1. Frontend 빌드 (`npm run build`)
2. 서버 백업 (DB, 코드, 이미지)
3. 파일 업로드 (SCP)
4. 권한 설정

### 수동 배포
```bash
# Frontend 빌드
cd frontend
npm run build

# 서버에 업로드
scp -r dist/* user@server:/path/to/CHEF/
scp -r backend/api/* user@server:/path/to/CHEF/api/
```

---

## 🎓 학습 포인트

이 프로젝트를 통해 배울 수 있는 것들:

### AI/ML
- ✅ Gemini API 활용법
- ✅ 프롬프트 엔지니어링 기법
- ✅ 텍스트 생성 AI 최적화
- ✅ 이미지 생성 AI 품질 개선

### Frontend
- ✅ React 19 최신 기능
- ✅ Zustand 상태 관리
- ✅ TailwindCSS 고급 스타일링
- ✅ 반응형 디자인

### Backend
- ✅ PHP RESTful API 설계
- ✅ MySQL 데이터베이스 설계
- ✅ Google OAuth 연동
- ✅ 사용량 제한 구현

### DevOps
- ✅ 배포 자동화
- ✅ 서버 백업 전략
- ✅ 보안 best practices

---

## 🐛 알려진 이슈

### 현재 제한사항
- Nano Banana PRO 모델의 한글 렌더링 품질 한계
  - **해결**: 텍스트 양 최소화 + 폰트 크기 최적화
- Overlay 모드의 텍스트 위치 정확도
  - **해결**: Vision API 개선 또는 고정 레이아웃 사용

### 향후 개선 예정
- [ ] Imagen 3 모델로 업그레이드 (한글 품질 향상)
- [ ] PDF 직접 다운로드 기능
- [ ] 레시피 공유 링크 생성
- [ ] 사용자별 레시피 북마크

---

## 📈 성능 최적화

### 이미지 생성 속도
- **Embedded 모드**: ~30-40초
- **Overlay 모드**: ~2-3분 (듀얼 이미지 생성)

### 최적화 기법
- ✅ 프롬프트 길이 최소화
- ✅ 재료/조리법 개수 제한 (5-6개)
- ✅ 각 단계 5-7단어 이내
- ✅ 이미지 캐싱 (uploads 폴더)

---

## 👨‍💻 개발자

- **AI Assistant**: Antigravity (Google DeepMind)
- **Project Lead**: JinHo Jung
- **Email**: jvisualschool@gmail.com

---

## 📄 라이선스

이 프로젝트는 교육 목적으로 개발되었습니다.

---

## 🙏 감사의 말

- **Google Gemini Team**: 강력한 AI API 제공
- **React Team**: 최고의 프론트엔드 프레임워크
- **Bitnami**: 간편한 LAMP 스택

---

## 📞 문의 및 지원

- **이슈 리포트**: GitHub Issues
- **이메일**: jvisualschool@gmail.com
- **데모 사이트**: https://jvibeschool.org/CHEF/

---

*Last Updated: 2025-12-30*
*Version: 2.0.0*

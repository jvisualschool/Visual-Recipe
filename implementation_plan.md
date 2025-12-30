# 비주얼 레시피 스타일 컨셉 실행 계획

이 계획은 나노바나나 PRO API(Gemini 3 Pro Image)를 활용하여 레시피 생성기 앱을 위한 3가지 핵심 시각적 스타일을 구축하는 과정을 담고 있습니다.

## 제안된 스타일 전략 (3단 구성 레이아웃)

모든 스타일은 **[상단: 재료 분해도] - [중앙: 조리 단계] - [하단: 최종 요리]**의 3단 구조를 기본으로 합니다.

### 1. 모던 인포그래픽 (Modern Infographic)
- **비주얼**: 깔끔한 3D 아이소메트릭 아이콘, 넘버링된 조리 장면, 정교한 3D 완성 샷.
- **목표**: 전문적이고 체계적인 정보 전달. 시스템적인 디자인을 선호하는 사용자 타겟.

### 2. 코지 워터컬러 (Cozy Watercolor)
- **비주얼**: 부드러운 수채화 질감, 손으로 그린듯한 스케치 아이콘, 정감 있는 손글씨 폰트.
- **목표**: 따뜻하고 감성적인 요리 경험 제공. 예술적인 느낌을 선호하는 사용자 타겟.

### 3. 팝아트 / 카와이 (Pop Art / Kawaii)
- **비주얼**: 굵은 외곽선, 톡톡 튀는 원색, 귀여운 캐릭터화된 재료들, 만화책 스타일 레이아웃.
- **목표**: 즐겁고 에너제틱한 경험. MZ 세대나 어린이 사용자를 타겟팅.


## 🏗️ 디자인 시스템 구현 명세 (Design System Specs)

### Step 1. 비율 (Canvas)
- **Vertical (9:16)**
- **Horizontal (16:9)**
- **Square (1:1)**

### Step 2. 스타일 (Style)
1. **Modern Minimalist**: Flat design, High contrast, Clean.
2. **Modern Infographic**: 3D Isometric, Exploded view, Vibrant.
3. **Cozy Watercolor**: Hand-drawn, Pastel, Textured paper.

### Step 3. 레이아웃 (Layout)
1. **Standard 3-Section**: Linear flow (Ingredients -> Steps -> Dish).
2. **Bento Grid**: Quadrant-based structured information.
3. **Radial Focus**: Circular composition around central dish.
4. **Magazine Hero**: Full-bleed background with overlay.

### Step 4. 텍스트 렌더링 (Text Render Mode)
1. **Embedded (Image)**: Text drawn by AI. Easy but raster quality.
2. **Overlay (CSS/PDF)**: Textless image generation + JSON data overlay. Best for print.

## ⚙️ 기술 아키텍처 (Technical Architecture)

사용자의 질문처럼 단순 검색(구글링)만으로는 **'3단 레이아웃'에 딱 맞는 정제된 데이터**를 얻기 어렵습니다. 따라서 **[텍스트 AI + 이미지 AI]**의 듀얼 파이프라인을 구축합니다.

### 1단계: 레시피 데이터 추출 (The Chef: Text AI)
- **입력**: [요리 이름] (예: 김밥)
- **역할**: 요리 방법을 검색하거나 지식 베이스에서 찾아 **구조화된 JSON**으로 변환합니다.
- **출력 (JSON)**:
  ```json
  {
    "dish_eng": "Gimbap",
    "ingredients": ["Seaweed", "Rice", "Carrot", "Spinach", "Ham"], // 시각화하기 좋은 핵심 재료 5-6개
    "steps": [ // 정확히 3단계로 요약
      "Spread rice evenly on seaweed sheet.",
      "Place ingredients in a neat row.",
      "Roll tightly using a bamboo mat."
    ]
  }
  ```

### 2단계: 프롬프트 조립 (The Builder: Logic)
- **역할**: 사용자가 선택한 [비율/스타일/레이아웃] 템플릿에 위 JSON 데이터를 끼워 넣습니다.
- **결과물**: "Modern Infographic of Gimbap... Top section: Seaweed, Rice... Middle: Step 1 Spreading rice..."

### 3단계: 이미지 생성 (The Artist: Nanobanana PRO)
- **역할**: 완성된 프롬프트를 받아 고해상도 이미지를 생성합니다.

## 💻 기술 스택 (Tech Stack: Bitnami AMP Compatible)

사용자의 서버 환경(Bitnami Apache/MySQL/PHP)에 최적화된 **Hybrid Stack**입니다.

### Frontend (User Interface)
- **Core**: **React + Vite** (빌드하면 정적 파일이 되므로 Apache 호환성 완벽).
- **Styling**: **Tailwind CSS**.
- **Rendering**: **Client-Side Rendering (CSR)**.

### Backend (API & Logic)
- **Language**: **PHP 7/8** (Bitnami 기본 환경 활용).
- **Role**:
  - AI API(Gemini)와의 통신 (API Key 보안).
  - MySQL 데이터베이스 CRUD.
  - JSON 데이터 가공.

### Database (MySQL)
- **Table**: `recipes`
  - `id` (INT, PK, Auto)
  - `title` (VARCHAR)
  - `ingredients_json` (JSON Type) : 재료 목록
  - `steps_json` (JSON Type) : 조리 과정
  - `image_url` (TEXT) : 생성된 이미지 경로
  - `view_type` (ENUM) : 'vertical', 'bento', 'radial', 'magazine'
  - `style_type` (ENUM) : 'minimal', 'infographic', 'watercolor'
  - `likes` (INT) : 좋아요 수
  - `tags` (VARCHAR) : #냉장고파먹기 #천원요리 #괴식 등
  - `created_at` (DATETIME)

## 🎉 재미있는 확장 기능 (Fun Features)
단순 검색을 넘어선 AI만의 창의력을 활용합니다.

### 1. 🧊 냉장고 파먹기 (Fridge Rescue)
- **입력**: "계란, 남은 치킨, 대파"
- **AI 역할**: "치킨 마요 덮밥" 같은 그럴싸한 메뉴를 제안하고 레시피 생성.

### 2. 💸 천원의 행복 (Budget Bites)
- **입력**: "예산 1,000 ~ 5,000원"
- **AI 역할**: 가격대가 낮은 식재료(콩나물, 두부 등) 위주의 고효율 레시피 생성.

### 3. 🧪 괴식 챌린지 (Weird Lab)
- **입력**: "초콜릿 + 라면", "아이스크림 + 찌개"
- **AI 역할**: 상상하기 힘든 조합을 가장 그럴싸하고 '맛있어 보이는' 비주얼로 시각화 (친구 공유용).

### 4. 🎰 랜덤 레시피 뽑기 (Gacha)
- **기능**: "기분 전환" 버튼을 누르면 AI가 오늘의 추천 메뉴를 무작위로 생성.

## ⚙️ 기술 아키텍처 (Revised)

## 🎨 UI/UX 통합 전략 (Unified Strategy)

사용자가 마음에 들어한 두 가지 컨셉(Dark Hero, Light Gallery)을 하나의 흐름으로 자연스럽게 연결합니다.

### 1. 하이브리드 페이지 구조 (One App, Two Vibes)
사이트를 분리하지 않고, **Landing(임팩트)**과 **App(정보)**의 역할을 명확히 나눕니다.

- **섹션 A: 인트로 (Hero Section)**
  - **스타일**: `mockup_hero_dark.html` 기반의 **Cinematic Dark**.
  - **역할**: 첫인상, 검색창(Call to Action). 스크롤 시 자연스럽게 갤러리로 전환.
  - **특징**: "Imagine. Taste. Create." 문구와 함께 웅장한 영상미 제공.

- **섹션 B: 갤러리 (Main Content)**
  - **스타일**: `mockup_gallery_light.html` 기반의 **Clean Bento Grid**.
  - **역할**: 실제 레시피 탐색, 필터링, 좋아요.
  - **기능**: **🌝 Light / 🌚 Dark 토글 버튼**을 제공하여 사용자가 취향껏(또는 시간에 따라) 전환 가능.

### 2. 페이지 라우팅 (Routing)
- `/` (Home): Hero(Dark) + 하단에 맛보기 Gallery(System Theme).
- `/gallery`: 전체 갤러리 (Bento Grid, Search).
- `/create`: 레시피 생성기 (Split UI).
- `/recipe/:id`: 상세 페이지.

## 💻 기술 스택 (Tech Stack: Bitnami AMP Compatible)

1. **[완료] 스타일별 예시 생성**: '제육볶음'과 '김치볶음밥'을 샘플로 하여 각 스타일의 퀄리티 검증.
2. **[완료] 프롬프트 템플릿 최적화**: 나노바나나 PRO API에서 일관된 화풍을 얻기 위한 전용 프롬프트 엔진 구축.
3. **[진행 중] 문서 한글화**: 모든 개발 가이드 및 결과를 한국어로 정리.

## 검증 계획

### 스타일 일관성 확인
- 다른 요리 이름(예: 비빔밥)을 입력했을 때 스타일별 고유한 화풍이 유지되는지 확인.
- 3단 레이아웃이 정보 누락 없이 출력되는지 검토.

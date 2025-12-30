# 📝 비주얼 레시피 생성기 프로젝트 대화 요약

## 1. 프로젝트 목표 (Project Goal)
- **User**: 김밥 등 요리 레시피를 3가지 스타일(미니멀/인포그래픽/워터컬러)의 고퀄리티 이미지로 생성하고 싶음.
- **Antigravity**: 단순 생성을 넘어, 사용자 취향에 맞게 **[비율] + [스타일] + [레이아웃] + [언어]**를 조합할 수 있는 전문적인 디자인 시스템 제안 및 확정.

## 2. 디자인 시스템 (Design System)
- **User**: 3단 레이아웃 외에 더 다양한 구조 요청. 비율도 가로/세로/정사각 필요.
- **Antigravity**: 
    - **비율**: 세로(모바일), 가로(PC), 정사각(인스타).
    - **레이아웃**: 표준 3단, 도시락 그리드(Bento), 래디얼(Radial), 매거진(Magazine).
    - **텍스트**: PDF 출력을 위해 **Overlay 방식**(이미지엔 그림만, 글씨는 웹폰트) 채택.

## 3. 기술 아키텍처 (Architecture)
- **User**: 요리 방법은 어떻게 찾아? 구글 검색?
- **Antigravity**: 검색보다 강력한 **Dual AI Pipeline** 구축.
    1. **Chef AI (Gemini 2.0 Flash)**: 텍스트로 완벽한 레시피 데이터(JSON) 정제.
    2. **Artist AI (Nanobanana PRO)**: 정제된 데이터를 시각화.

## 4. 기술 스택 및 인프라 (Tech Stack)
- **User**: 라이트/다크모드 지원, 서버는 Bitnami PHP/MySQL (AWS).
- **Antigravity**: 
    - **Frontend**: React (Vite) + Tailwind CSS (빠른 UI 개발, 정적 배포).
    - **Backend**: PHP 8 + MySQL (기존 서버 환경 100% 활용).
    - **Verify**: SSH 접속, SCP 전송, DB 생성 테스트 완료 (성공).

## 5. 진행 상황 (Status)
- UI 목업(Landing, Gallery, Creator) 3종 확정.
- DB 스키마(`recipes`) 설계 완료.
- 이제 **전체 개발 및 서버 배포** 단계 진입.

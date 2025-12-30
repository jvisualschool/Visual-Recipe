# Visual Chef Development Guide

## 1. Project Overview
**Visual Chef** is an AI-powered application that generates visual recipes based on user input. It uses a dual-AI pipeline (Chef AI for text, Artist AI for images) to create stunning, stylized recipe cards.

- **Frontend**: React (Vite), TailwindCSS, Zustand (State Management), React Router.
- **Backend**: Apache/PHP, MySQL (Bitnami Stack).
- **Deployment**: Bitnami AWS LightSail (`15.164.161.165`).

## 2. Key Features
- **Hero Generation**: Users input a dish name, select options (Language, Ratio, Style), and get a generated recipe image.
- **Recipe Carousel**: Displays the 10 most recent creations with a custom sliding UI.
- **Gallery**: A grid view of all generated recipes with filtering and detailed modals.
- **Localization**: Full support for Korean and English UI.
- **Dual AI Engine**: 
    - `Chef AI`: Extracts ingredients/steps as JSON.
    - `Artist AI`: Renders the final visual based on the JSON and selected style.

## 3. Project Structure
```
/frontend
  /src
    /components  # Layout, GalleryModal, etc.
    /lib         # API clients (recipeApi), Translations (translations.js)
    /pages       # Hero.jsx (Main), Gallery.jsx (List)
    /store       # Zustand store (recipeStore.js)
```

## 4. Deployment Workflow
To deploy updates to the production server:
```bash
# 1. Build and Deploy Frontend
cd frontend
npm run build
scp -o StrictHostKeyChecking=no -i ~/.ssh/jvibeschool_org.pem -r dist/* bitnami@15.164.161.165:/opt/bitnami/apache/htdocs/CHEF/
```
*Note: Ensure your SSH key is valid.*

## 5. Completed Work (Today)
- **Carousel Navigation**: Implemented 10-item rotation with non-overlapping buttons.
- **UI Refinement**: Unified color scheme to Dark Blue, removed option numbering.
- **Localization**: Completed Korean translations for all config options.
- **Footer**: Added standard footer with Privacy/Terms/Google API links.

## 6. Future Roadmap (Scheduled)
- **User Authentication**: Login/Signup for saving recipes.
- **Payments**: Integration with **Toss Payments** for premium features.
- **PDF Export**: High-resolution recipe card download.

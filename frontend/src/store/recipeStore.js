import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRecipeStore = create(
    persist(
        (set) => ({
            // User Selection State
            dishName: '',
            setDishName: (name) => set({ dishName: name }),

            // UI Language
            language: 'ko', // 'ko', 'en'
            toggleLanguage: () => set((state) => ({ language: state.language === 'ko' ? 'en' : 'ko' })),

            config: {
                ratio: 'vertical',
                style: 'minimal',
                layout: 'standard', // standard, bento, radial, magazine
                lang: 'bilingual', // ko, en, bilingual
                render_mode: 'embedded', // embedded (image), overlay (css)
                theme: 'pink-check', // pixel-gui, dark-brown, pink-check, colored-pencil, matcha-green, lemon-zest, midnight-blue
                key_type: 'paid', // 'free' or 'paid'
            },

            setConfig: (key, value) => set((state) => ({
                config: { ...state.config, [key]: value }
            })),

            setTheme: (themeName) => set((state) => {
                // Remove all theme classes first
                const themes = ['pixel-gui', 'dark-brown', 'pink-check', 'colored-pencil', 'matcha-green', 'lemon-zest', 'midnight-blue', 'christmas'];
                document.documentElement.classList.remove(...themes);
                document.documentElement.classList.add(themeName);

                return { config: { ...state.config, theme: themeName } };
            }),

            // User Authentication State
            user: null, // { email, name, picture, isAdmin, todayCount, dailyLimit, remaining }
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
            updateUsage: (todayCount, remaining) => set((state) => ({
                user: state.user ? { ...state.user, todayCount, remaining } : null
            })),

            // Generation State
            isGenerating: false,
            generatedRecipe: null,

            startGeneration: () => set({ isGenerating: true, generatedRecipe: null }),
            successGeneration: (data) => set({ isGenerating: false, generatedRecipe: data }),
            failGeneration: () => set({ isGenerating: false }),
        }),
        {
            name: 'recipe-store',
            partialize: (state) => ({ user: state.user, config: state.config })
        }
    )
);

export default useRecipeStore;

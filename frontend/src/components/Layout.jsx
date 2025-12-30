import React, { useEffect, useCallback, useState } from 'react';
import useRecipeStore from '../store/recipeStore';
import { Moon, Sun, Globe, LogOut, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { translations } from '../lib/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic, faImage } from '@fortawesome/free-solid-svg-icons';
import { authApi } from '../lib/api';

const Layout = ({ children }) => {
    const { config, setTheme, setConfig, language, toggleLanguage, user, setUser, logout } = useRecipeStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [showSplash, setShowSplash] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowSplash(false);
            }
        };

        if (showSplash) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showSplash]);

    const t = translations[language];

    // Themes definition
    const themes = [
        { id: 'pixel-gui', label: 'Pixel GUI', color: '#000080' },
        { id: 'dark-brown', label: 'Dark Brown', color: '#78350f' },
        { id: 'pink-check', label: 'Pink Check', color: '#fb7185' },
        { id: 'colored-pencil', label: 'Colored Pencil', color: '#6366f1' },
        { id: 'matcha-green', label: 'Matcha Green', color: '#10b981' },
        { id: 'lemon-zest', label: 'Lemon Zest', color: '#facc15' },
        { id: 'midnight-blue', label: 'Midnight Blue', color: '#1d4ed8' },
        { id: 'christmas', label: 'Christmas Special', color: '#ef4444' },
    ];

    // Google Login Handler
    const handleCredentialResponse = useCallback(async (response) => {
        try {
            // Decode JWT to get user info (client-side simple decode)
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);

            // Login with backend
            const res = await authApi.login({
                email: payload.email,
                name: payload.name,
                picture: payload.picture
            });

            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    }, [setUser]);

    // Initialize Google Button
    const initGoogleBtn = useCallback(() => {
        if (window.google) {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
                console.error("Google Client ID is missing in .env file");
                return;
            }

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById("googleBtn"),
                { theme: "outline", size: "medium", type: "icon", shape: "circle" }
            );
        }
    }, [handleCredentialResponse]);

    useEffect(() => {
        // Initialize theme class on mount
        document.documentElement.classList.add(config.theme);

        // Check user status periodically if logged in
        if (user) {
            authApi.status(user.email).then(res => {
                if (res.data.success) {
                    setUser({ ...user, ...res.data });
                }
            }).catch(() => {
                // If status check fails (e.g. invalid session), maybe logout or ignore
            });
        }

        // Wait for script load loop
        const timer = setInterval(() => {
            if (window.google && !user) {
                initGoogleBtn();
                clearInterval(timer);
            }
        }, 500);

        return () => clearInterval(timer);

    }, [config.theme, user?.email]); // Re-run if user email changes (login/logout)

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300 text-text-main font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-bg-main/80 border-b border-border-main">
                <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer bg-surface px-4 py-1.5 rounded-theme border border-border-main backdrop-blur-md hover:opacity-80 transition shadow-theme" onClick={() => navigate('/')}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                        <span className="text-primary font-bold tracking-wider text-xs uppercase">{language === 'ko' ? '나만의 레시피북' : 'My Recipe Book'}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Picker */}
                        <div className="hidden md:flex items-center gap-2 bg-surface px-3 py-1.5 rounded-theme border border-border-main shadow-theme">
                            {themes.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setTheme(theme.id)}
                                    title={theme.label}
                                    className={`w-4 h-4 rounded-full transition-all hover:scale-125 ${config.theme === theme.id ? 'ring-2 ring-offset-2 ring-primary scale-125' : 'opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: theme.color, '--tw-ring-offset-color': 'var(--theme-bg)' }}
                                />
                            ))}
                        </div>

                        <button
                            onClick={toggleLanguage}
                            className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1 bg-surface px-3 py-1.5 rounded-theme border border-border-main shadow-theme"
                        >
                            <Globe size={14} />
                            {language === 'ko' ? 'Eng' : '한글'}
                        </button>

                        {/* Login / Profile */}
                        {user ? (
                            <div className="flex items-center gap-3 bg-surface px-4 py-2 rounded-theme border border-border-main shadow-theme">
                                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-white/10" />
                                <div className="flex items-center gap-2 font-bold text-text-main">
                                    <span className="text-xs md:text-[13px]">{user.name}</span>
                                    <span className="text-[10px] md:text-xs font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                                        {user.isAdmin
                                            ? (language === 'ko' ? '관리자' : 'Admin')
                                            : (language === 'ko' ? `${user.remaining}회 남음` : `${user.remaining} left`)}
                                    </span>
                                </div>
                                <button onClick={logout} className="text-slate-400 hover:text-red-400 transition ml-2" title="Logout">
                                    <LogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div id="googleBtn" className="h-[32px]"></div>
                        )}
                        {location.pathname === '/gallery' ? (
                            <button
                                onClick={() => navigate('/')}
                                className="bg-primary text-white px-5 py-2 rounded-theme text-xs font-bold transition flex items-center gap-2 shadow-theme hover:opacity-90"
                            >
                                <FontAwesomeIcon icon={faMagic} />
                                <span>{t.generatorBtn}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/gallery')}
                                className="bg-surface hover:bg-surface/80 text-text-main px-5 py-2 rounded-theme text-xs font-bold transition flex items-center gap-2 border border-border-main shadow-theme"
                            >
                                <FontAwesomeIcon icon={faImage} />
                                <span>{t.galleryBtn}</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-border-main bg-bg-main text-center">
                <div className="flex flex-col items-center gap-4">

                    <p className="text-text-main/50 text-xs">
                        © 2026 Visual Chef. All rights reserved.
                    </p>
                    <div className="flex gap-4 text-xs text-text-main/40 items-center">
                        <a
                            href="https://jvibeschool.org/GALLERY/mdview.html?url=https%3A%2F%2Fjvibeschool.org%2FCHEF%2FREADME.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition cursor-pointer"
                        >
                            README
                        </a>
                        <span onClick={() => navigate('/privacy')} className="hover:text-primary transition cursor-pointer">Privacy Policy</span>
                        <span onClick={() => navigate('/terms')} className="hover:text-primary transition cursor-pointer">Terms of Service</span>
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition decoration-dotted underline underline-offset-4">
                            Google API Key
                        </a>
                        <button
                            onClick={() => setShowSplash(true)}
                            className="text-2xl hover:scale-110 transition-transform"
                            title="About CHEF"
                        >
                            😊
                        </button>
                    </div>
                </div>
            </footer>

            {/* Splash Modal */}
            {showSplash && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setShowSplash(false)}
                >
                    <div
                        className="relative w-full max-w-2xl aspect-square mx-4 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Image */}
                        <img
                            src="/CHEF/splash.jpg"
                            alt="CHEF Splash"
                            className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* Top Bar - App Name (15% height) */}
                        <div className="absolute top-0 left-0 right-0 h-[15%] bg-black/50 backdrop-blur-sm px-6 flex flex-col justify-center">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                🍳 CHEF
                            </h1>
                            <p className="text-white/80 text-sm md:text-lg mt-1">
                                AI Visual Recipe Generator
                            </p>
                        </div>



                        {/* Bottom Bar - Tech Stack & Info (10% height) */}
                        <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black/50 backdrop-blur-sm px-6 flex items-center">
                            <div className="grid grid-cols-4 gap-4 text-white w-full">
                                <div>
                                    <div className="font-bold text-primary text-sm">🛠️ Tech</div>
                                    <div className="text-white/80 text-sm">React + PHP</div>
                                </div>
                                <div>
                                    <div className="font-bold text-primary text-sm">🤖 AI</div>
                                    <div className="text-white/80 text-sm">Gemini API</div>
                                </div>
                                <div>
                                    <div className="font-bold text-primary text-sm">👨‍💻 Dev</div>
                                    <div className="text-white/80 text-sm">JinHo Jung</div>
                                </div>
                                <div>
                                    <div className="font-bold text-primary text-sm">📦 Ver</div>
                                    <div className="text-white/80 text-sm">v2.0.0</div>
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowSplash(false)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;

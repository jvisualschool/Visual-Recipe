import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRecipeStore from '../store/recipeStore';
import { ChefHat, Wand2, Loader2, ArrowRight, Sparkles, HelpCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import recipeApi, { authApi } from '../lib/api';
import { translations } from '../lib/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Hero = () => {
    // Access Store
    const { config, setConfig, dishName, setDishName, language, user, updateUsage } = useRecipeStore();
    const navigate = useNavigate();
    const t = translations[language];

    // Local State for Generation
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [helpModal, setHelpModal] = useState(null); // 'style' | 'layout' | null

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setHelpModal(null);
            }
        };

        if (helpModal) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [helpModal]);
    // Fetched Recipes for Carousel
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await recipeApi.getAll();
                if (res.data && Array.isArray(res.data)) {
                    setRecentRecipes(res.data.slice(0, 10));
                } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    setRecentRecipes(res.data.data.slice(0, 10));
                }
            } catch (err) {
                console.error("Failed to fetch recent recipes", err);
            }
        };
        fetchRecent();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!dishName) return alert('Please enter a dish name!');

        // Login Check
        if (!user) {
            alert(language === 'ko' ? '로그인이 필요합니다.' : 'Please login first.');
            // Scroll to top or highlight login button if needed??
            // Maybe trigger Google button via DOM? (Not recommended, just alert user)
            document.getElementById('googleBtn')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Daily Limit Check
        try {
            const checkRes = await authApi.check(user.email);
            if (!checkRes.data.canGenerate) {
                const limit = checkRes.data.dailyLimit || 2;
                alert(language === 'ko' ? `일일 생성 한도를 초과했습니다. (${limit}회/일)` : `Daily limit reached. (${limit}/day)`);
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            alert('인증 확인 중 오류가 발생했습니다.');
            return;
        }

        setLoading(true);
        setResult(null); // Reset previous result

        try {
            const payload = { dish: dishName, ...config, created_by: user.email };
            const res = await recipeApi.generate(payload);
            const data = res.data.data; // PHP API returns { success: true, id: ..., data: {...} }

            // Increment usage count
            const incRes = await authApi.increment(user.email);
            if (incRes.data.success) {
                updateUsage(incRes.data.todayCount, incRes.data.remaining);
            }

            // Show result on Hero page
            setResult(data);
            setLoading(false);

        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.error || error.message || 'Generation Failed. Server might be busy.';
            alert(`Error: ${errMsg}`);
            setLoading(false);
        }
    };

    return (
        <section className="relative overflow-hidden min-h-[90vh] flex flex-col justify-center items-center text-text-main pb-20 pt-32 transition-colors duration-500">
            {/* Animated Background */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-primary rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-dark rounded-full mix-blend-screen filter blur-[128px] opacity-10 animate-pulse"></div>

            <div className="relative z-10 text-center max-w-5xl px-4 space-y-6 w-full">

                {/* Header */}
                {!result && (
                    <div className="mb-8">


                        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000 font-sans">
                            {language === 'ko' ? (
                                <React.Fragment>
                                    나만의 <span className="font-light text-primary">레시피북</span>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    My <span className="font-light text-primary">Recipe Book</span>
                                </React.Fragment>
                            )}
                        </h1>
                        <p className="text-xl md:text-2xl opacity-60 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1200 delay-200">
                            <span className="text-base">{t.heroDesc}</span>
                        </p>

                        {/* Recent Recipes Carousel */}
                        {recentRecipes.length > 0 && (
                            <div className="w-full max-w-4xl mx-auto mb-8 group/carousel -mt-8">

                                <div className="flex items-center justify-center gap-4 bg-surface/50 backdrop-blur-sm rounded-2xl border border-border-main p-4 relative z-10">
                                    <button
                                        onClick={() => setStartIndex(Math.max(0, startIndex - 1))}
                                        disabled={startIndex === 0}
                                        className="z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>

                                    <div className="overflow-hidden w-[764px] relative">
                                        {/* 764px = (140px item + 16px gap) * 5 items - 16px gap for last item roughly, or just ensuring fit */}
                                        <div
                                            className="flex gap-4 transition-transform duration-500 ease-in-out will-change-transform"
                                            style={{ transform: `translateX(-${startIndex * 156}px)` }}
                                        >
                                            {recentRecipes.map((recipe) => (
                                                <div
                                                    key={recipe.id}
                                                    className="min-w-[140px] w-[140px] aspect-[3/4] rounded-theme overflow-hidden relative group cursor-pointer border border-white/10 hover:border-white/30 transition shadow-theme shrink-0"
                                                    onClick={() => navigate('/gallery')}
                                                >
                                                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                                                        <span className="text-xs font-bold text-white line-clamp-2 leading-tight">{recipe.title.replace(/[()]/g, '')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStartIndex(Math.min(recentRecipes.length - 5, startIndex + 1))}
                                        disabled={startIndex >= recentRecipes.length - 5}
                                        className="z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Result Overlay */}
                {result && (
                    <div className="mb-10 animate-in fade-in zoom-in max-w-lg mx-auto">
                        {/* Check render_mode for Overlay vs Embedded display */}
                        {config.render_mode === 'overlay' ? (
                            /* ===== HTML OVERLAY MODE: Premium PDF-Ready Card ===== */
                            <div id="recipe-card-overlay" className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                                {/* Background Image with Gradient Overlay */}
                                <div className="relative aspect-[3/4]">
                                    <img src={result.image_url} alt={result.title} className="w-full h-full object-cover" />
                                    {/* Gradient Overlay for Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                                        {/* Title */}
                                        <h2 className="text-2xl font-black mb-4 drop-shadow-lg leading-tight">
                                            {result.title.replace(/[()]/g, ' ')}
                                        </h2>

                                        {/* Ingredients */}
                                        <div className="mb-4">
                                            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-orange-400">
                                                {language === 'ko' ? '재료' : 'Ingredients'}
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(Array.isArray(result.ingredients) ? result.ingredients : (result.ingredients[language] || result.ingredients['en'] || [])).slice(0, 8).map((ing, i) => (
                                                    <span key={i} className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium">
                                                        {ing}
                                                    </span>
                                                ))}
                                                {(Array.isArray(result.ingredients) ? result.ingredients : (result.ingredients[language] || result.ingredients['en'] || [])).length > 8 && (
                                                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium">
                                                        +{(Array.isArray(result.ingredients) ? result.ingredients : (result.ingredients[language] || result.ingredients['en'] || [])).length - 8}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Steps */}
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest mb-2 text-orange-400">
                                                {language === 'ko' ? '조리 순서' : 'Instructions'}
                                            </h3>
                                            <ol className="space-y-1 text-[10px] leading-relaxed">
                                                {(Array.isArray(result.steps) ? result.steps : (result.steps[language] || result.steps['en'] || [])).slice(0, 4).map((step, i) => (
                                                    <li key={i} className="flex gap-2">
                                                        <span className="bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0">{i + 1}</span>
                                                        <span className="line-clamp-1">{step}</span>
                                                    </li>
                                                ))}
                                                {(Array.isArray(result.steps) ? result.steps : (result.steps[language] || result.steps['en'] || [])).length > 4 && (
                                                    <li className="text-white/60 pl-6">...{language === 'ko' ? '외 더 많은 단계' : 'and more'}</li>
                                                )}
                                            </ol>
                                        </div>
                                    </div>
                                </div>

                                {/* Download Button */}
                                <div className="p-4 bg-stone-100 flex gap-3">
                                    <a href={result.image_url} download className="flex-1 py-3 bg-stone-900 text-white text-center rounded-xl font-bold text-sm hover:bg-stone-800 transition">
                                        {language === 'ko' ? '이미지 다운로드' : 'Download Image'}
                                    </a>
                                    <button onClick={() => navigate('/gallery')} className="flex-1 py-3 bg-white border border-stone-300 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-50 transition">
                                        {language === 'ko' ? '갤러리로 이동' : 'Go to Gallery'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ===== EMBEDDED MODE: Original Display ===== */
                            <div className="p-4 bg-stone-800/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
                                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-black/50 shadow-lg mb-6 group">
                                    <img src={result.image_url} alt={result.title} className="w-full h-full object-cover" />
                                    <a href={result.image_url} download className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition">
                                        <ArrowRight size={16} className="-rotate-45" />
                                    </a>
                                </div>
                                {/* Ingredients & Steps */}
                                <div className="space-y-6 text-left max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    <div>
                                        <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span> Ingredients
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(result.ingredients) ? result.ingredients : (result.ingredients[language] || result.ingredients['en'] || [])).map((ing, i) => (
                                                <span key={i} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-slate-300">
                                                    {ing}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="w-1 h-4 bg-primary rounded-full"></span> Instructions
                                        </h4>
                                        <ol className="space-y-3">
                                            {(Array.isArray(result.steps) ? result.steps : (result.steps[language] || result.steps['en'] || [])).map((step, i) => (
                                                <li key={i} className="flex gap-3 text-xs text-slate-400 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <span className="font-bold text-white bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                                                    {step}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/gallery')} className="mt-6 w-full py-3 bg-white text-black hover:bg-stone-200 rounded-xl font-bold text-sm transition">
                                    {language === 'ko' ? '갤러리로 이동' : 'Go to Gallery'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 5-Option Config Form */}
                {!result && (
                    <div className="w-full max-w-4xl mx-auto bg-surface/50 backdrop-blur-md rounded-theme border border-border-main p-6 md:p-8 shadow-theme animate-in fade-in slide-in-from-bottom-16 duration-1000">

                        {/* 0. Determine Dish */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold opacity-50 uppercase mb-2 ml-1">{t.labelDish}</label>
                            <input
                                type="text"
                                value={dishName}
                                onChange={(e) => setDishName(e.target.value)}
                                placeholder={t.placeholder}
                                className="w-full bg-bg-main/50 border border-border-main rounded-theme px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition shadow-inner placeholder:opacity-30"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">

                            {/* Column 1: Core Settings (Lang, Ratio, Render) */}
                            <div className="space-y-6">
                                {/* 1. Language */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider">{t.labelLang}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['ko', 'en', 'bilingual'].map(opt => (
                                            <button key={opt} onClick={() => setConfig('lang', opt)}
                                                className={cn("py-2 text-xs rounded-lg border transition capitalize", config.lang === opt ? "bg-primary/20 border-primary text-primary" : "border-border-main text-text-main/50 hover:border-text-main/30")}>
                                                {t.optionValues.lang[opt]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Ratio */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider">{t.optRatio}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['vertical', 'horizontal', 'square'].map(opt => (
                                            <button key={opt} onClick={() => setConfig('ratio', opt)}
                                                className={cn("py-2 text-xs rounded-lg border transition capitalize", config.ratio === opt ? "bg-primary/20 border-primary text-primary" : "border-border-main text-text-main/50 hover:border-text-main/30")}>
                                                {t.optionValues.ratio[opt]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 5. Text Rendering (Moved here) */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-primary uppercase tracking-wider">{t.optRender}</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button onClick={() => setConfig('render_mode', 'embedded')}
                                            className={cn("p-3 text-xs rounded-lg border transition text-left", config.render_mode === 'embedded' ? "bg-primary/10 border-primary text-primary" : "border-border-main text-text-main/50 hover:border-text-main/30")}>
                                            <div className="font-bold mb-1">{t.optionValues.render.embedded.title}</div>
                                            <div className="opacity-70 text-[10px]">{t.optionValues.render.embedded.desc}</div>
                                        </button>
                                        <button onClick={() => setConfig('render_mode', 'overlay')}
                                            className={cn("p-3 text-xs rounded-lg border transition text-left", config.render_mode === 'overlay' ? "bg-primary/10 border-primary text-primary" : "border-border-main text-text-main/50 hover:border-text-main/30")}>
                                            <div className="font-bold mb-1">{t.optionValues.render.overlay.title}</div>
                                            <div className="opacity-50 text-[10px]">{language === 'ko' ? 'PDF용 고해상도 카드' : 'HD Card for PDF'}</div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Style */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                    {t.optStyle}
                                    <button onClick={() => setHelpModal('style')} className="text-primary/50 hover:text-primary transition" title="Preview Styles">
                                        <HelpCircle size={14} />
                                    </button>
                                </label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'minimal', label: t.optionValues.style.minimal },
                                        { id: 'infographic', label: t.optionValues.style.infographic },
                                        { id: 'watercolor', label: t.optionValues.style.watercolor },
                                        { id: 'graphic', label: t.optionValues.style.graphic },
                                        { id: 'sketch', label: t.optionValues.style.sketch },
                                        { id: 'girlish', label: t.optionValues.style.girlish },
                                        { id: 'botanical', label: t.optionValues.style.botanical }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setConfig('style', opt.id)}
                                            className={cn("w-full py-2 px-3 text-xs rounded-lg border transition text-left flex justify-between", config.style === opt.id ? "bg-primary/20 border-primary text-primary" : "border-border-main text-text-main/50 hover:border-text-main/30")}>
                                            {opt.label}
                                            {config.style === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-primary self-center" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Column 3: Layout (View) */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                    {t.optView}
                                    <button onClick={() => setHelpModal('layout')} className="text-primary/50 hover:text-primary transition" title="Preview Layouts">
                                        <HelpCircle size={14} />
                                    </button>
                                </label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'standard', label: t.optionValues.layout.standard },
                                        { id: 'bento', label: t.optionValues.layout.bento },
                                        { id: 'radial', label: t.optionValues.layout.radial },
                                        { id: 'magazine', label: t.optionValues.layout.magazine }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setConfig('layout', opt.id)}
                                            className={cn("w-full py-2 px-3 text-xs rounded-lg border transition text-left flex justify-between", config.layout === opt.id ? "bg-primary/20 border-primary text-primary" : "border-border-main text-text-main/50 hover:border-text-main/30")}>
                                            {opt.label}
                                            {config.layout === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-primary self-center" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !dishName}
                            className="w-full bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 py-4 rounded-theme font-black text-lg text-white shadow-theme transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                            {loading ? 'Designing Recipe...' : 'Generate Visual Recipe'}
                        </button>
                    </div>
                )}

                {/* Fun Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-50 bg-surface backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <LoadingView t={t} dishName={dishName} config={config} />
                    </div>
                )}
            </div>

            {/* Config & Style Helper Modal */}
            {helpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setHelpModal(null)}>
                    <div className={`bg-surface border border-border-main rounded-2xl w-full ${helpModal === 'layout' ? 'max-w-3xl' : 'max-w-5xl'} max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-200 custom-scrollbar`} onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 right-0 z-20 flex justify-end p-4 pointer-events-none">
                            <button
                                onClick={() => setHelpModal(null)}
                                className="pointer-events-auto bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 pt-2">
                            {helpModal === 'style' && <StylePreviewModal t={t} />}
                            {helpModal === 'layout' && <LayoutPreviewModal t={t} />}
                        </div>
                    </div>
                </div>
            )}
        </section >
    );
};

// Fun Loading Component
const LoadingView = ({ t, dishName, config }) => {
    const isOverlay = config.render_mode === 'overlay';
    const totalTime = isOverlay ? 150 : 40; // seconds

    const [progress, setProgress] = useState(0);
    const [messageIdx, setMessageIdx] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(totalTime);

    // Shuffle messages randomly on mount (Fisher-Yates algorithm)
    const messages = React.useMemo(() => {
        const arr = [...t.loadingMessages];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, []);

    useEffect(() => {
        // Progress Bar: Fill to 90% over totalTime
        const progressTicks = totalTime * 10; // 100ms intervals
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev; // Stall at 90% until done
                return prev + (90 / progressTicks);
            });
        }, 100);

        // Countdown Timer
        const timerInterval = setInterval(() => {
            setTimeRemaining(prev => Math.max(0, prev - 1));
        }, 1000);

        // Message Rotation: Every 3.5 seconds
        const msgInterval = setInterval(() => {
            setMessageIdx(prev => (prev + 1) % messages.length);
        }, 3500);

        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
            clearInterval(msgInterval);
        };
    }, []);

    // Style labels
    const styleLabels = { minimal: '미니멀', infographic: '인포그래픽', watercolor: '수채화', graphic: '그래픽', sketch: '스케치', girlish: '여중생', botanical: '보태니컬' };
    const renderLabels = { embedded: '이미지 내장', overlay: 'HTML 오버레이' };
    const layoutLabels = { standard: '세로형', bento: '벤토', radial: '방사형', magazine: '매거진' };

    return (
        <div className="w-full max-w-md">
            <div className="mb-6 relative">
                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-primary-dark rounded-full animate-spin blur-xl opacity-50 absolute inset-0 mx-auto"></div>
                <div className="relative z-10 bg-surface rounded-full p-4 inline-block shadow-xl border border-border-main">
                    <ChefHat size={40} className="text-primary animate-bounce" />
                </div>
            </div>

            {/* Dish Name & Options Display */}
            <div className="mb-4">
                <div className="text-2xl font-black text-text-main mb-3">🍳 {dishName}</div>
                <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-surface border border-border-main rounded-full text-xs font-bold text-text-main/70">{styleLabels[config.style] || config.style}</span>
                    <span className="px-3 py-1 bg-surface border border-border-main rounded-full text-xs font-bold text-text-main/70">{layoutLabels[config.layout] || config.layout}</span>
                    <span className="px-3 py-1 bg-surface border border-border-main rounded-full text-xs font-bold text-text-main/70">{renderLabels[config.render_mode] || config.render_mode}</span>
                </div>
            </div>

            {/* Estimated Time Display */}
            <div className="text-sm text-text-main/60 mb-2">
                ⏱️ {isOverlay ? '고품질 작업' : '작업'} 예상 시간: <span className="font-mono text-text-main">{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</span>
            </div>

            <h3 className="text-xl font-bold text-primary mb-2 min-h-[3.5rem] flex items-center justify-center animate-pulse">
                {messages[messageIdx]}
            </h3>

            <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border-main">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-xs text-text-main/50 mt-2 font-mono">{Math.floor(progress)}%</p>
        </div>
    );
};

// --- Preview Components ---

const StylePreviewModal = ({ t }) => {
    const styles = [
        { id: 'minimal', label: t.optionValues.style.minimal, desc: '깔끔하고 세련된 미니멀 디자인. 여백을 활용한 현대적인 레이아웃.', img: '/CHEF/previews/style_minimal.jpg' },
        { id: 'infographic', label: t.optionValues.style.infographic, desc: '3D 일러스트와 아이콘을 활용한 정보 중심 디자인. 시각적 구조가 명확.', img: '/CHEF/previews/style_infographic.jpg' },
        { id: 'watercolor', label: t.optionValues.style.watercolor, desc: '부드러운 수채화 질감과 파스텔 컬러. 감성적이고 따뜻한 느낌.', img: '/CHEF/previews/style_watercolor.jpg' },
        { id: 'graphic', label: t.optionValues.style.graphic, desc: '손그림 마커 스타일의 그래픽 레코딩. 회의록/강의 노트 느낌.', img: '/CHEF/previews/style_graphic.jpg' },
        { id: 'sketch', label: t.optionValues.style.sketch, desc: '연필로 가볍게 스케치한 듯한 담백한 느낌. 여백이 많고 섬세함.', img: '/CHEF/previews/style_sketch.jpg' },
        { id: 'girlish', label: t.optionValues.style.girlish, desc: '색연필로 그린 소녀 감성 일러스트. 노트 배경에 따뜻한 파스텔 톤.', img: '/CHEF/previews/style_girlish.jpg' },
        { id: 'botanical', label: t.optionValues.style.botanical, desc: '식물도감 스타일의 섬세한 일러스트. 베이지 배경에 스티커 느낌.', img: '/CHEF/previews/style_botanical.jpg' }
    ];

    return (
        <div>
            <h2 className="text-2xl font-black text-text-main mb-6 flex items-center gap-2">
                <Sparkles className="text-primary" /> Visual Styles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {styles.map(s => (
                    <div key={s.id} className="group overflow-hidden rounded-xl border border-white/10 bg-surface hover:border-primary/50 transition duration-300">
                        {/* Preview Area */}
                        <div className={`h-48 ${s.bg} flex items-center justify-center relative overflow-hidden`}>
                            {s.img ? (
                                <img src={s.img} alt={s.label} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                            ) : (
                                <>
                                    {/* Fallback Abstract Representation */}
                                    <div className={`text-center ${s.text}`}>
                                        <div className="text-3xl font-black mb-1 opacity-20 group-hover:opacity-40 transition scale-150 transform">AB</div>
                                        <div className="text-sm font-bold opacity-50">Visual Style</div>
                                    </div>
                                    {s.id === 'sketch' && <div className="absolute inset-0 border-2 border-dashed border-gray-400/30 m-2 rounded-lg"></div>}
                                </>
                            )}
                        </div>
                        <div className="p-4 bg-surface-dark border-t border-white/5">
                            <h3 className="font-bold text-text-main mb-1">{s.label}</h3>
                            <p className="text-xs text-slate-400">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LayoutPreviewModal = ({ t }) => {
    const layouts = [
        { id: 'standard', label: t.optionValues.layout.standard, desc: '전통적인 세로 3단 구성. 제목, 재료, 조리 순서가 위에서 아래로 배치.', img: '/CHEF/previews/layout_standard.jpg' },
        { id: 'bento', label: t.optionValues.layout.bento, desc: '일본 도시락처럼 칸칸이 나뉜 그리드 레이아웃. 정보가 구획별로 정리.', img: '/CHEF/previews/layout_bento.jpg' },
        { id: 'radial', label: t.optionValues.layout.radial, desc: '중앙에 메인 요리, 주변에 재료가 원형으로 배치. 시선 집중 효과.', img: '/CHEF/previews/layout_radial.jpg' },
        { id: 'magazine', label: t.optionValues.layout.magazine, desc: '잡지 표지 스타일. 대담한 타이포그래피와 히어로 이미지 강조.', img: '/CHEF/previews/layout_magazine.jpg' }
    ];

    return (
        <div>
            <h2 className="text-2xl font-black text-text-main mb-6 flex items-center gap-2">
                <ChefHat className="text-primary" /> 레이아웃 구조
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {layouts.map(l => (
                    <div key={l.id} className="group overflow-hidden rounded-xl border border-white/10 bg-surface hover:border-primary/50 transition duration-300">
                        {/* Preview Image */}
                        <div className="aspect-square overflow-hidden bg-stone-900">
                            <img src={l.img} alt={l.label} className="w-full h-full object-contain transition duration-500 group-hover:scale-105" />
                        </div>
                        <div className="p-4 bg-surface-dark border-t border-white/5">
                            <h3 className="font-bold text-text-main mb-1">{l.label}</h3>
                            <p className="text-xs text-slate-400">{l.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Hero;

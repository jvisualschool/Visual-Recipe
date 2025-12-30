import React, { useEffect, useState } from 'react';
import useRecipeStore from '../store/recipeStore';
import recipeApi from '../lib/api';
import { cn } from '../lib/utils';
import { Loader2, Search, X, Copy, Check, ArrowUpRight, Trash2, Layers } from 'lucide-react';

import { translations } from '../lib/translations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faChartPie, faCalendarDay, faImages, faExpand, faListCheck, faDownload, faTrash, faCopy, faCheck, faFilePdf, faPrint, faShare, faArrowLeft, faTerminal } from '@fortawesome/free-solid-svg-icons';
import OverlayEditor from '../components/OverlayEditor';
import jsPDF from 'jspdf';

const Gallery = () => {
    // State
    const { language, user } = useRecipeStore();
    const t = translations[language];

    const [stats, setStats] = useState({ total: 0, today: 0 });
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null); // For Modal
    const [copied, setCopied] = useState(false);
    const [showOverlayEditor, setShowOverlayEditor] = useState(false); // Overlay Editor Modal
    const [modalLang, setModalLang] = useState('ko'); // Modal language toggle: 'ko' or 'en'
    const [showPromptModal, setShowPromptModal] = useState(false); // Prompt Modal

    // Fetch Data
    useEffect(() => {
        fetchGalleryData();
    }, []);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (showPromptModal) {
                    setShowPromptModal(false);
                    return;
                }
                if (showOverlayEditor) {
                    setShowOverlayEditor(false);
                    return;
                }
                if (selectedRecipe) {
                    setSelectedRecipe(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedRecipe, showOverlayEditor, showPromptModal]);

    const fetchGalleryData = async () => {
        setLoading(true);
        try {
            // Parallel Fetch: Stats + List
            const [statsRes, listRes] = await Promise.all([
                recipeApi.getStats(),
                recipeApi.getAll()
            ]);
            setStats(statsRes.data);
            setRecipes(listRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getLocalizedData = (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (Array.isArray(data)) return data;
            return data[language] || data['en'] || [];
        } catch (e) {
            return [];
        }
    };

    // For modal - uses modalLang toggle state
    const getModalLocalizedData = (jsonStr) => {
        try {
            const data = JSON.parse(jsonStr);
            if (Array.isArray(data)) return data;
            return data[modalLang] || data['en'] || [];
        } catch (e) {
            return [];
        }
    };

    const formatCardTitle = (title) => {
        // Remove all parentheses
        return title.replace(/[()]/g, ' ');
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete Recipe #${id}? This cannot be undone.`)) return;

        try {
            await recipeApi.delete(id, user?.email);
            // Remove from local state
            setRecipes(prev => prev.filter(r => r.id !== id));
            setStats(prev => ({ ...prev, total: prev.total - 1 })); // Approximate update
            setSelectedRecipe(null); // Close modal
        } catch (error) {
            console.error(error);
            alert('Failed to delete recipe.');
        }
    };

    // Native Print Functionality with Custom Layout
    const handlePrint = async (recipe) => {
        const ingredients = getModalLocalizedData(recipe.ingredients_json);
        const steps = getModalLocalizedData(recipe.steps_json);

        let title = recipe.title;
        const match = title.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            title = modalLang === 'ko' ? match[1] : match[2];
        } else {
            title = formatCardTitle(recipe.title);
        }

        // Image URL logic
        const imgUrl = recipe.render_mode === 'overlay' && recipe.image_embedded_url
            ? recipe.image_embedded_url
            : recipe.image_url;

        // Open print window immediately to avoid popup blockers
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) {
            alert(modalLang === 'ko' ? '팝업 차단을 해제해주세요.' : 'Please allow popups to print.');
            return;
        }

        // Determine orientation based on image logic or default to vertical
        const img = new Image();
        img.src = imgUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
        const isVertical = (img.width / img.height) < 0.9;

        const dateStr = new Date(recipe.created_at).toLocaleDateString();

        // Print Styles
        const styles = `
            <style>
                @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
                @page { size: A4; margin: 0; }
                body { 
                    margin: 0; padding: 40px; 
                    font-family: 'Pretendard', sans-serif; 
                    color: #1f2937;
                    background-color: white;
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact;
                }
                .container { max-width: 100%; margin: 0 auto; }
                
                h1 { 
                    font-size: 32px; font-weight: 900; margin-bottom: 8px; 
                    line-height: 1.2; letter-spacing: -0.5px; color: #111;
                }
                .meta { 
                    font-size: 13px; color: #6b7280; margin-bottom: 30px; 
                    display: flex; align-items: center; gap: 8px; font-weight: 500;
                }
                .section-header { 
                    font-size: 18px; font-weight: 800; margin-bottom: 15px; 
                    display: flex; align-items: center; gap: 10px;
                    text-transform: uppercase; letter-spacing: 0.5px;
                }
                .tag {
                    display: inline-block; padding: 8px 16px; margin: 0 6px 6px 0;
                    border-radius: 20px; font-size: 13px; font-weight: 600;
                    background-color: #f3f4f6; border: 1px solid #e5e7eb; color: #374151;
                }
                .step-item { display: flex; gap: 16px; margin-bottom: 16px; break-inside: avoid; }
                .step-num {
                    width: 28px; height: 28px; border-radius: 50%;
                    background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; font-weight: 800; flex-shrink: 0; margin-top: 2px;
                }
                .step-text { font-size: 14px; line-height: 1.6; color: #4b5563; padding-top: 2px; }
                
                .hero-img { 
                    max-width: 100%; height: auto; max-height: 500px; 
                    border-radius: 20px; 
                    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1); margin-bottom: 30px;
                    object-fit: contain;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                /* Layouts */
                .layout-vertical { display: flex; gap: 40px; }
                .col-left { flex: 0 0 45%; }
                .col-right { flex: 1; }
                
                .layout-horizontal .grid-2 { display: flex; gap: 40px; }
                .col-ing { flex: 1; border-right: 1px solid #f3f4f6; padding-right: 30px; }
                .col-steps { flex: 1.5; }
                
                .footer {
                    margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;
                    text-align: center; font-size: 12px; color: #9ca3af;
                }
            </style>
        `;

        const ingredientsHtml = `
            <div class="section-header" style="color: #166534;">
                <span style="width: 4px; height: 18px; background-color: #22c55e; border-radius: 2px;"></span>
                ${modalLang === 'ko' ? '재료' : 'Ingredients'}
            </div>
            <div>
                ${ingredients.map(ing => `<span class="tag">${ing}</span>`).join('')}
            </div>
        `;

        const stepsHtml = `
            <div class="section-header" style="color: #9a3412; margin-top: 20px;">
                <span style="width: 4px; height: 18px; background-color: #f97316; border-radius: 2px;"></span>
                ${modalLang === 'ko' ? '조리 순서' : 'Instructions'}
            </div>
            <div>
                ${steps.map((step, i) => `
                    <div class="step-item">
                        <div class="step-num">${i + 1}</div>
                        <div class="step-text">${step}</div>
                    </div>
                `).join('')}
            </div>
        `;

        let content = '';

        if (isVertical) {
            content = `
                <div class="container layout-vertical">
                    <div class="col-left">
                        <img src="${imgUrl}" class="hero-img" />
                    </div>
                    <div class="col-right">
                        <h1>${title}</h1>
                        <div class="meta">
                            <span>${dateStr}</span>
                            <span>•</span>
                            <span>Visual Chef AI</span>
                        </div>
                        <div style="margin-bottom: 30px;">${ingredientsHtml}</div>
                        <div>${stepsHtml}</div>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="container layout-horizontal">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #f9fafb;">
                        <div>
                            <h1>${title}</h1>
                            <div class="meta" style="margin-bottom: 0;">
                                <span>${dateStr}</span>
                                <span>•</span>
                                <span>Visual Chef AI</span>
                            </div>
                        </div>
                        <img src="/CHEF/icon-192.png" style="width: 32px; height: 32px; border-radius: 8px; opacity: 0.8;" onerror="this.style.display='none'" />
                    </div>
                    
                    <div style="text-align: center;">
                        <img src="${imgUrl}" class="hero-img" />
                    </div>
                    
                    <div class="grid-2">
                        <div class="col-ing">${ingredientsHtml}</div>
                        <div class="col-steps">${stepsHtml}</div>
                    </div>
                </div>
            `;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title} - Visual Chef</title>
                ${styles}
            </head>
            <body>
                ${content}
                <div class="footer">Generated by Visual Chef AI</div>
                <script>
                    window.onload = () => {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="min-h-screen text-text-main pb-20 pt-24 px-4 transition-colors duration-500">

            <div className="max-w-[1920px] mx-auto mb-12 flex flex-col md:flex-row justify-between items-end border-b border-border-main pb-8 gap-6 px-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                        Recipe <span className="text-primary">Gallery</span>
                    </h1>
                    <p className="opacity-60 max-w-md text-sm">
                        {t.galleryDesc}
                    </p>
                </div>

                <div className="flex gap-8 text-right">
                    <div>
                        <div className="text-3xl font-bold font-mono">{stats.total}</div>
                        <div className="text-xs opacity-50 uppercase tracking-widest font-bold flex items-center justify-end gap-1">
                            <FontAwesomeIcon icon={faUtensils} className="opacity-60" />
                            {t.totalRecipes}
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold font-mono text-green-500">+{stats.today}</div>
                        <div className="text-xs opacity-50 uppercase tracking-widest font-bold flex items-center justify-end gap-1">
                            <FontAwesomeIcon icon={faCalendarDay} className="opacity-60" />
                            {t.todayRecipes}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Masonry Grid (Switching to CSS Grid for row consistency) */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <div className="max-w-[1920px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                    {recipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            onClick={() => setSelectedRecipe(recipe)}
                            className="bg-surface/50 rounded-theme overflow-hidden border border-border-main hover:border-primary/50 hover:bg-surface transition cursor-pointer group shadow-theme flex flex-col"
                        >
                            {/* Image Header */}
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <img src={recipe.render_mode === 'overlay' && recipe.image_embedded_url ? recipe.image_embedded_url : recipe.image_url} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy" />
                                <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black via-black/50 to-transparent opacity-50 group-hover:opacity-40 transition"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="font-bold text-lg leading-tight text-white drop-shadow-md line-clamp-2">{formatCardTitle(recipe.title)}</h3>
                                </div>
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                                        <ArrowUpRight size={16} className="text-white" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* 3. Detail Modal (Immersive View) */}
            {selectedRecipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface w-full max-w-5xl h-[90vh] rounded-theme overflow-hidden flex flex-col md:flex-row shadow-theme border border-border-main relative text-text-main">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedRecipe(null)}
                            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black p-2 rounded-full text-white transition"
                        >
                            <X size={24} />
                        </button>

                        {/* Left: Image - Show embedded image for overlay mode, else regular image */}
                        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black group">
                            <img
                                src={selectedRecipe.render_mode === 'overlay' && selectedRecipe.image_embedded_url ? selectedRecipe.image_embedded_url : selectedRecipe.image_url}
                                alt={selectedRecipe.title}
                                className="w-full h-full object-contain md:object-cover cursor-zoom-in"
                                onClick={() => window.open(selectedRecipe.render_mode === 'overlay' && selectedRecipe.image_embedded_url ? selectedRecipe.image_embedded_url : selectedRecipe.image_url, '_blank')}
                            />

                            {/* Overlay Editor Button for overlay-mode recipes */}
                            {selectedRecipe.render_mode === 'overlay' && (
                                <button
                                    onClick={() => setShowOverlayEditor(true)}
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg transition z-10"
                                >
                                    <Layers size={16} />
                                    {language === 'ko' ? '텍스트 오버레이 보기' : 'View Text Overlay'}
                                </button>
                            )}

                            {/* Overlay Mode: Position-aware text rendering */}
                            {selectedRecipe.render_mode === 'overlay' && (() => {
                                // Try to parse position data
                                let positions = [];
                                try {
                                    positions = JSON.parse(selectedRecipe.text_positions_json || '[]');
                                } catch (e) { positions = []; }

                                const ingredients = getLocalizedData(selectedRecipe.ingredients_json);
                                const steps = getLocalizedData(selectedRecipe.steps_json);

                                // If we have position data, render at detected positions
                                if (positions && positions.length > 0) {
                                    // Ensure Title exists
                                    const hasTitle = positions.some(p => p.type === 'title');
                                    if (!hasTitle) {
                                        positions.unshift({ type: 'title', x: 50, y: 8, fontSize: 'xl', align: 'center' });
                                    }

                                    const fontSizes = { sm: '9px', md: '11px', lg: '14px', xl: '18px' };
                                    let ingIdx = 0, stepIdx = 0;

                                    return (
                                        <div className="absolute inset-0 pointer-events-none">
                                            {positions.map((pos, i) => {
                                                let text = '';
                                                let transform = 'translate(-50%, -50%)'; // Default center align
                                                let textAlign = 'center';

                                                if (pos.type === 'title') {
                                                    text = formatCardTitle(selectedRecipe.title);
                                                    // Use pos.align if available, else default to center for injected title
                                                } else if (pos.type === 'ingredient' && ingredients[ingIdx]) {
                                                    text = ingredients[ingIdx++];
                                                } else if (pos.type === 'step' && steps[stepIdx]) {
                                                    text = `${stepIdx + 1}. ${steps[stepIdx++]}`;
                                                }

                                                if (!text) return null;

                                                return (
                                                    <div
                                                        key={i}
                                                        className="absolute bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg"
                                                        style={{
                                                            left: `${pos.x}%`,
                                                            top: `${pos.y}%`,
                                                            transform: transform,
                                                            fontSize: fontSizes[pos.fontSize] || '10px',
                                                            maxWidth: '80%',
                                                            textAlign: textAlign,
                                                            fontWeight: pos.type === 'title' ? 800 : 500,
                                                            whiteSpace: 'pre-wrap',
                                                            zIndex: pos.type === 'title' ? 20 : 10
                                                        }}
                                                    >
                                                        {text}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                // Fallback: Bottom-aligned overlay if no position data
                                return (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 text-white pointer-events-none">
                                        <h2 className="text-xl font-black mb-3 drop-shadow-lg leading-tight">
                                            {formatCardTitle(selectedRecipe.title)}
                                        </h2>
                                        <div className="mb-3">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-orange-400">{t.ingredients}</h3>
                                            <div className="flex flex-wrap gap-1">
                                                {ingredients.slice(0, 6).map((ing, i) => (
                                                    <span key={i} className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-[9px]">{ing}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-orange-400">{t.instructions}</h3>
                                            <ol className="space-y-0.5 text-[9px]">
                                                {steps.slice(0, 3).map((step, i) => (
                                                    <li key={i} className="flex gap-1.5">
                                                        <span className="bg-orange-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0">{i + 1}</span>
                                                        <span className="line-clamp-1">{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Zoom hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                                <span className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm font-bold flex items-center gap-2">
                                    <FontAwesomeIcon icon={faExpand} />
                                    {t.viewFull}
                                </span>
                            </div>
                        </div>

                        {/* Right: Details (Scrollable) */}
                        <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 overflow-y-auto custom-scrollbar bg-surface border-l border-border-main">
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black leading-tight mb-2">{formatCardTitle(selectedRecipe.title)}</h2>
                                    <div className="text-slate-500 text-sm flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCalendarDay} />
                                        <span>
                                            {modalLang === 'ko'
                                                ? `${new Date(selectedRecipe.created_at).toLocaleDateString('ko-KR')} 생성`
                                                : `Generated on ${new Date(selectedRecipe.created_at).toLocaleDateString('en-US')}`
                                            }
                                        </span>
                                        {selectedRecipe.created_by && (
                                            <>
                                                <span className="w-1 h-1 bg-slate-500 rounded-full mx-1"></span>
                                                <span className="text-primary font-medium">by {selectedRecipe.created_by}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Styles */}
                                {(() => {
                                    const tagMap = {
                                        // Styles
                                        'minimal': '미니멀',
                                        'infographic': '인포그래픽',
                                        'watercolor': '수채화',
                                        'graphic': '그래픽',
                                        'sketch': '스케치',
                                        'girlish': '소녀감성',
                                        // Ratios
                                        'vertical': '세로형',
                                        'horizontal': '가로형',
                                        'square': '정사각',
                                        // Layouts
                                        'standard': '기본',
                                        'bento': '벤토',
                                        'radial': '원형',
                                        'magazine': '잡지',
                                        // Languages
                                        'ko': '한글',
                                        'en': '영어',
                                        'bilingual': '한영병기'
                                    };

                                    const getTagText = (val) => (modalLang === 'ko' && tagMap[val]) ? tagMap[val] : val;

                                    return (
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                {getTagText(selectedRecipe.style_type)}
                                            </span>
                                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                {getTagText(selectedRecipe.view_type)}
                                            </span>
                                            {selectedRecipe.layout_type && (
                                                <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    {getTagText(selectedRecipe.layout_type)}
                                                </span>
                                            )}
                                            {selectedRecipe.language_code && (
                                                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    {getTagText(selectedRecipe.language_code)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Language Toggle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{modalLang === 'ko' ? '표시 언어:' : 'Language:'}</span>
                                    <button
                                        onClick={() => setModalLang('ko')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${modalLang === 'ko' ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                    >
                                        한글
                                    </button>
                                    <button
                                        onClick={() => setModalLang('en')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${modalLang === 'en' ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                    >
                                        English
                                    </button>
                                </div>

                                {/* Ingredients */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <FontAwesomeIcon icon={faListCheck} className="text-green-500" />
                                            {modalLang === 'ko' ? '재료' : 'Ingredients'}
                                        </h3>
                                        <button
                                            onClick={() => handleCopy(getModalLocalizedData(selectedRecipe.ingredients_json).join('\n'))}
                                            className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition"
                                        >
                                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-500" : ""} />
                                            {modalLang === 'ko'
                                                ? (copied ? '복사됨' : '리스트 복사')
                                                : (copied ? 'Copied' : 'Copy List')
                                            }
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {getModalLocalizedData(selectedRecipe.ingredients_json).map((ing, i) => (
                                            <span key={i} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-slate-300">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Steps */}
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                                        <FontAwesomeIcon icon={faUtensils} className="text-orange-500" />
                                        {modalLang === 'ko' ? '조리 순서' : 'Instructions'}
                                    </h3>
                                    <ol className="space-y-4">
                                        {getModalLocalizedData(selectedRecipe.steps_json).map((step, i) => (
                                            <li key={i} className="flex gap-4 group">
                                                <span className="font-bold text-slate-900 bg-slate-500 group-hover:bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition mt-0.5">{i + 1}</span>
                                                <p className="text-slate-400 group-hover:text-slate-200 transition leading-relaxed text-sm md:text-base">{step}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Download & Delete Action */}
                                {/* Download & Actions */}
                                <div className="pt-8 border-t border-white/10 grid grid-cols-4 gap-4">
                                    <a
                                        href={selectedRecipe.image_url}
                                        download
                                        className="inline-flex items-center justify-center gap-2 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition"
                                        title={modalLang === 'ko' ? '이미지 다운로드' : 'Download Image'}
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                    </a>
                                    <button
                                        onClick={() => setShowPromptModal(true)}
                                        className="inline-flex items-center justify-center px-6 py-4 bg-purple-500/10 text-purple-500 font-bold rounded-xl hover:bg-purple-500 hover:text-white transition border border-purple-500/20"
                                        title={modalLang === 'ko' ? '프롬프트 보기' : 'View Prompt'}
                                    >
                                        <FontAwesomeIcon icon={faTerminal} />
                                    </button>
                                    <button
                                        onClick={() => handlePrint(selectedRecipe)}
                                        className="inline-flex items-center justify-center px-6 py-4 bg-blue-500/10 text-blue-500 font-bold rounded-xl hover:bg-blue-500 hover:text-white transition border border-blue-500/20"
                                        title={modalLang === 'ko' ? '레시피 인쇄' : 'Print Recipe'}
                                    >
                                        <FontAwesomeIcon icon={faPrint} />
                                    </button>

                                    {/* Admin Only Delete */}
                                    {user?.isAdmin && (
                                        <button
                                            onClick={() => handleDelete(selectedRecipe.id)}
                                            className="inline-flex items-center justify-center px-6 py-4 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition border border-red-500/20"
                                            title={t.delete}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-center mt-2">
                                    <span className="text-[10px] text-slate-600 font-mono">ID: #{selectedRecipe.id}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Overlay Editor Modal */}
            {showOverlayEditor && selectedRecipe && (
                <OverlayEditor
                    recipe={selectedRecipe}
                    onClose={() => setShowOverlayEditor(false)}
                    onSave={(newPositions) => {
                        // Update local state with new positions
                        setSelectedRecipe(prev => ({
                            ...prev,
                            text_positions_json: JSON.stringify(newPositions)
                        }));
                    }}
                />
            )}

            {/* Prompt Modal */}
            {showPromptModal && selectedRecipe && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-surface w-full max-w-2xl rounded-theme overflow-hidden shadow-2xl border border-border-main flex flex-col relative text-text-main max-h-[80vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <FontAwesomeIcon icon={faTerminal} className="text-purple-500" />
                                Image Generation Prompt
                            </h3>
                            <button
                                onClick={() => setShowPromptModal(false)}
                                className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full text-slate-300 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-black/20">
                            {selectedRecipe.final_prompt ? (
                                <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedRecipe.final_prompt}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500">
                                    <p>Prompt data not available for this recipe.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-white/10 bg-surface flex justify-end">
                            <button
                                onClick={() => handleCopy(selectedRecipe.final_prompt || '')}
                                className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selectedRecipe.final_prompt}
                            >
                                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? "text-green-600" : ""} />
                                {copied ? 'Copied to Clipboard' : 'Copy Prompt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Gallery;

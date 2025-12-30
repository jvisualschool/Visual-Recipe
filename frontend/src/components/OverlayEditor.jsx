import React, { useState, useRef, useEffect } from 'react';
import { X, Save, RotateCcw, Move } from 'lucide-react';
import useRecipeStore from '../store/recipeStore';
import { translations } from '../lib/translations';
import recipeApi from '../lib/api';

const OverlayEditor = ({ recipe, onClose, onSave }) => {
    const { language } = useRecipeStore();
    const t = translations[language];
    const containerRef = useRef(null);

    // Parse initial positions or create default if none exist
    const getInitialPositions = () => {
        try {
            const parsed = JSON.parse(recipe.text_positions_json || '[]');
            if (parsed && parsed.length > 0) return parsed;
        } catch (e) { }

        // Default positions if none exist
        const ingredients = JSON.parse(recipe.ingredients_json || '{}');
        const steps = JSON.parse(recipe.steps_json || '{}');
        const ingList = ingredients[language] || ingredients['en'] || [];
        const stepList = steps[language] || steps['en'] || [];

        const defaultPositions = [
            { type: 'title', x: 5, y: 3, fontSize: 'xl' }
        ];

        // Add ingredients
        ingList.slice(0, 6).forEach((_, i) => {
            defaultPositions.push({ type: 'ingredient', x: 5, y: 15 + i * 5, fontSize: 'sm' });
        });

        // Add steps
        stepList.slice(0, 4).forEach((_, i) => {
            defaultPositions.push({ type: 'step', x: 5, y: 55 + i * 10, fontSize: 'md' });
        });

        return defaultPositions;
    };

    const [positions, setPositions] = useState(getInitialPositions);
    const [dragging, setDragging] = useState(null);
    const [saving, setSaving] = useState(false);

    // Get recipe text data
    const ingredients = (() => {
        try {
            const data = JSON.parse(recipe.ingredients_json || '{}');
            return data[language] || data['en'] || [];
        } catch (e) { return []; }
    })();

    const steps = (() => {
        try {
            const data = JSON.parse(recipe.steps_json || '{}');
            return data[language] || data['en'] || [];
        } catch (e) { return []; }
    })();

    const formatTitle = (title) => title.replace(/[()]/g, ' ').trim();

    // Handle drag start
    const handleMouseDown = (e, idx) => {
        e.preventDefault();
        setDragging(idx);
    };

    // Handle dragging
    const handleMouseMove = (e) => {
        if (dragging === null || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

        setPositions(prev => prev.map((pos, i) =>
            i === dragging ? { ...pos, x: Math.round(x), y: Math.round(y) } : pos
        ));
    };

    // Handle drag end
    const handleMouseUp = () => {
        setDragging(null);
    };

    // Save positions to server
    const handleSave = async () => {
        setSaving(true);
        try {
            await recipeApi.updatePositions(recipe.id, positions);
            onSave(positions);
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('저장 실패. 다시 시도해 주세요.');
        } finally {
            setSaving(false);
        }
    };

    // Reset to AI-detected positions
    const handleReset = () => {
        setPositions(getInitialPositions());
    };

    // Get text for each position
    const getTextForPosition = (pos, idx) => {
        let ingIdx = 0, stepIdx = 0;

        // Count how many of each type came before this index
        for (let i = 0; i < idx; i++) {
            if (positions[i].type === 'ingredient') ingIdx++;
            if (positions[i].type === 'step') stepIdx++;
        }

        if (pos.type === 'title') {
            return formatTitle(recipe.title);
        } else if (pos.type === 'ingredient') {
            return ingredients[ingIdx] || '';
        } else if (pos.type === 'step') {
            return steps[stepIdx] ? `${stepIdx + 1}. ${steps[stepIdx]}` : '';
        }
        return '';
    };

    const fontSizes = { sm: '11px', md: '13px', lg: '16px', xl: '22px' };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Move className="text-orange-400" size={20} />
                    <h2 className="text-white font-bold text-lg">
                        {language === 'ko' ? '텍스트 위치 편집기' : 'Overlay Position Editor'}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2 transition"
                    >
                        <RotateCcw size={16} />
                        {language === 'ko' ? '초기화' : 'Reset'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white rounded-lg text-sm flex items-center gap-2 transition"
                    >
                        <Save size={16} />
                        {saving ? (language === 'ko' ? '저장 중...' : 'Saving...') : (language === 'ko' ? '저장' : 'Save')}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Editor Canvas */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                <div
                    ref={containerRef}
                    className="relative rounded-2xl overflow-visible shadow-2xl bg-slate-800"
                    style={{ cursor: dragging !== null ? 'grabbing' : 'default' }}
                >
                    {/* Clean Image - Full view without cropping */}
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="max-w-full max-h-[70vh] object-contain select-none pointer-events-none"
                        draggable={false}
                    />

                    {/* Draggable Text Elements */}
                    {positions.map((pos, idx) => {
                        const text = getTextForPosition(pos, idx);
                        if (!text || pos.deleted) return null;

                        return (
                            <div
                                key={idx}
                                className={`absolute bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 pr-7 rounded-lg shadow-lg cursor-grab select-none transition-shadow ${dragging === idx ? 'ring-2 ring-orange-500 shadow-orange-500/30' : 'hover:ring-2 hover:ring-white/50'}`}
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    fontSize: fontSizes[pos.fontSize] || '12px',
                                    fontWeight: pos.type === 'title' ? 800 : 500,
                                    maxWidth: pos.type === 'title' ? '90%' : '45%',
                                    cursor: dragging === idx ? 'grabbing' : 'grab'
                                }}
                                onMouseDown={(e) => handleMouseDown(e, idx)}
                            >
                                {text}
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPositions(prev => prev.map((p, i) => i === idx ? { ...p, deleted: true } : p));
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Hint */}
            <div className="p-4 bg-slate-900 border-t border-white/10 text-center">
                <p className="text-slate-400 text-sm">
                    {language === 'ko'
                        ? '✋ 텍스트를 드래그하여 원하는 위치로 이동하세요'
                        : '✋ Drag text elements to reposition them'}
                </p>
            </div>
        </div>
    );
};

export default OverlayEditor;

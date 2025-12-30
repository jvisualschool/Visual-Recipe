import React, { useState } from 'react';
import useRecipeStore from '../store/recipeStore';
import { ChefHat, Wand2, Download, Share2, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import recipeApi from '../lib/api';

const Creator = () => {
    const { config, setConfig, dishName, setDishName } = useRecipeStore();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleGenerate = async () => {
        if (!dishName) return alert('Please enter a dish name!');
        setLoading(true);

        try {
            // Prepare Data for API
            const payload = {
                dish: dishName,
                ...config
            };
            // Simulated API Call
            // const res = await recipeApi.generate(payload);
            // setResult(res.data);

            // Mock Delay for Effect
            setTimeout(() => {
                setResult({
                    image_url: 'https://placehold.co/400x800/orange/white?text=Gen+Complete',
                    ingredients: ['Kimchi', 'Rice', 'Spam'],
                    steps: ['Fry Kimchi', 'Add Rice', 'Mix & Serve'],
                    title: dishName
                });
                setLoading(false);
            }, 3000);

        } catch (e) {
            console.error(e);
            setLoading(false);
            alert('Generation failed. Quota might be exceeded.');
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">

            {/* Configuration Panel */}
            <aside className="w-full md:w-1/3 lg:w-[400px] bg-surface border-r border-border-main flex flex-col z-20 shadow-xl overflow-y-auto transition-colors duration-300">
                <div className="p-6 space-y-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-text-main">
                        <ChefHat className="text-primary" /> Recipe Config
                    </h2>

                    {/* Dish Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-main/50 uppercase tracking-wider">Dish Name</label>
                        <input
                            type="text"
                            value={dishName}
                            onChange={(e) => setDishName(e.target.value)}
                            placeholder="e.g. Kimchi Fried Rice"
                            className="w-full text-2xl font-bold border-b-2 border-border-main focus:border-primary outline-none py-2 bg-transparent transition text-text-main placeholder:text-text-main/30"
                        />
                    </div>

                    {/* Ratio */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-text-main/50 uppercase tracking-wider">Canvas Ratio</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['vertical', 'horizontal', 'square'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setConfig('ratio', r)}
                                    className={cn(
                                        "border rounded-xl p-3 flex flex-col items-center gap-2 transition",
                                        config.ratio === r
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border-main text-text-main/40 hover:border-text-main/40"
                                    )}
                                >
                                    <span className="text-xs font-bold capitalize">{r}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Style */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-text-main/50 uppercase tracking-wider">Visual Style</label>
                        <div className="space-y-2">
                            {['minimal', 'infographic', 'watercolor', 'graphic', 'sketch', 'girlish', 'botanical'].map(s => (
                                <label key={s} className={cn(
                                    "flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition",
                                    config.style === s
                                        ? "border-primary bg-primary/5"
                                        : "border-border-main hover:border-primary/50"
                                )}>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm capitalize text-text-main">{s}</div>
                                    </div>
                                    <input
                                        type="radio"
                                        name="style"
                                        checked={config.style === s}
                                        onChange={() => setConfig('style', s)}
                                        className="accent-primary"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-text-main text-bg-main hover:bg-text-main/90 text-lg font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        {loading ? 'Cooking...' : 'Generate'}
                    </button>
                </div>
            </aside>

            {/* Preview Panel */}
            <main className="flex-1 bg-bg-main flex items-center justify-center p-8 relative transition-colors duration-300">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px', color: 'var(--theme-text)' }}></div>

                <div className="relative w-[360px] h-[640px] bg-black rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden flex flex-col shrink-0">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

                    <div className="flex-1 bg-surface relative flex flex-col h-full overflow-hidden transition-colors duration-300">
                        {result ? (
                            <>
                                <img src={result.image_url} className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                    <h2 className="text-2xl font-black">{result.title}</h2>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-main/30 gap-4">
                                <Wand2 size={48} />
                                <p className="font-bold text-sm text-center">Review settings<br />and Generate</p>
                            </div>
                        )}

                        {loading && (
                            <div className="absolute inset-0 bg-surface backdrop-blur flex flex-col items-center justify-center z-30 transition-colors duration-300">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                                <span className="font-bold text-text-main text-lg">Chef AI is cooking...</span>
                                <span className="text-xs text-text-main/70 mt-2">Analyzing ingredients...</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Creator;

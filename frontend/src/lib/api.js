import axios from 'axios';

// In production, this should point to the actual backend URL
// Updated for /CHEF subdirectory
const API_BASE_URL = import.meta.env.PROD ? '/CHEF/api' : 'http://localhost:8080/api';
// NOTE: We will likely run the PHP server on port 8080 or use a proxy. 
// For now assuming localhost:8080 for PHP development server.

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const recipeApi = {
    // Generate Recipe (Dual AI Pipeline)
    generate: (data) => api.post('/generate.php', data),

    // Get Stats
    getStats: () => api.get('/stats.php'),

    // Get All Recipes (Gallery)
    getAll: (params) => api.get('/recipes.php', { params }),

    // Get Single Recipe
    getOne: (id) => api.get(`/recipes.php?id=${id}`),

    // Like Recipe
    like: (id) => api.post('/like.php', { id }),

    // Delete Recipe (Admin Only)
    delete: (id, email) => api.post('/delete.php', { id, email }),

    // Update Text Overlay Positions
    updatePositions: (id, positions) => api.post('/update_positions.php', { id, positions }),
};

// Auth API
export const authApi = {
    // Google login
    login: (data) => api.post('/auth.php', { action: 'login', ...data }),

    // Check if user can generate
    check: (email) => api.post('/auth.php', { action: 'check', email }),

    // Increment usage after generation
    increment: (email) => api.post('/auth.php', { action: 'increment', email }),

    // Get user status
    status: (email) => api.post('/auth.php', { action: 'status', email }),
};

export default recipeApi;

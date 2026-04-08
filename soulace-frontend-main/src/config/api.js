// Central API base URL for frontend
// Keep empty by default in development so Vite proxy can handle /api requests
// and avoid cross-origin CORS issues.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export default API_BASE_URL

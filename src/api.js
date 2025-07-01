import axios from 'axios';
import API_ENDPOINTS from './apiconfig';

export const fetchData = async (endpointKey) => {
  try {
    const endpoint = API_ENDPOINTS[endpointKey];
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointKey} not found in API config.`);
    }
    
    const response = await axios.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpointKey}:`, error);
    throw error;
  }
};

// Helper to get token from user context or localStorage
export function getAuthToken(user) {
  return (user && (user.Token || user.token)) || localStorage.getItem('token');
}

// Universal fetch wrapper for Bearer token
export async function authFetch(url, options = {}, user) {
  const token = getAuthToken(user);
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

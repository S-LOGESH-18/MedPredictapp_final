const API_BASE_URL = 'http://localhost:5000/api';

export const sendAlert = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/send-alert`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send alert');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

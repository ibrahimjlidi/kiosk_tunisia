export const normalizeApiError = (error: any, fallback: string): string => {
  if (!error) return fallback;

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors || {})
      .map((item: any) => item?.message)
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'value';
    return `${field.replace(/_/g, ' ')} already exists.`;
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

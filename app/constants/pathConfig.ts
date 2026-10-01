export const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/portfolio' : '';
};

export const withBase = (path: string) => {
  const base = getBasePath();
  if (path.startsWith('/') && base) {
    return `${base}${path}`;
  }
  return path;
};




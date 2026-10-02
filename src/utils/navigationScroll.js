const scrollPositions = new Map();

export const rememberScrollPosition = (key, position) => {
  if (!key || !position) return;

  scrollPositions.set(key, {
    left: Number(position.left) || 0,
    top: Number(position.top) || 0,
  });
};

export const scrollTargetForNavigation = (isHistoryNavigation, key) => {
  if (isHistoryNavigation) {
    return scrollPositions.get(key) ?? null;
  }

  return { left: 0, top: 0 };
};

export const resetScrollPositions = () => {
  scrollPositions.clear();
};

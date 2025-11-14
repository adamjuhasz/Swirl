import * as FileSystem from 'expo-file-system';

const CACHE_ROOT = `${FileSystem.cacheDirectory}marble`; 

async function ensureCacheDir(subdir) {
  const target = `${CACHE_ROOT}/${subdir}`;
  const info = await FileSystem.getInfoAsync(target);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(target, { intermediates: true });
  }
  return target;
}

export async function cacheNewsletterAssets(html, messageId) {
  if (!html) {
    return { html, assets: [] };
  }

  const assetMatches = Array.from(html.matchAll(/<img[^>]+src=["']([^"'>]+)["'][^>]*>/gi));
  if (assetMatches.length === 0) {
    return { html, assets: [] };
  }

  let mutatedHtml = html;
  const cachedAssets = [];
  const cacheDir = await ensureCacheDir(messageId);

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const match of assetMatches) {
    const originalUrl = match[1];
    if (!originalUrl || originalUrl.startsWith('cid:') || originalUrl.startsWith('data:')) {
      continue;
    }
    try {
      const fileName = encodeURIComponent(originalUrl).replace(/%/g, '');
      const filePath = `${cacheDir}/${fileName}`;
      const info = await FileSystem.getInfoAsync(filePath);
      if (!info.exists) {
        await FileSystem.downloadAsync(originalUrl, filePath);
      }
      mutatedHtml = mutatedHtml.replace(new RegExp(escapeRegExp(originalUrl), 'g'), filePath);
      cachedAssets.push(filePath);
    } catch (error) {
      console.warn('Failed to cache asset', originalUrl, error);
    }
  }

  return { html: mutatedHtml, assets: cachedAssets };
}

export async function clearNewsletterAssets(messageId) {
  const cacheDir = `${CACHE_ROOT}/${messageId}`;
  const info = await FileSystem.getInfoAsync(cacheDir);
  if (info.exists) {
    await FileSystem.deleteAsync(cacheDir, { idempotent: true });
  }
}

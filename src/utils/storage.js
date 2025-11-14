import * as FileSystem from 'expo-file-system';

const DATA_ROOT = `${FileSystem.documentDirectory}marble`;
const DATA_DIR = `${DATA_ROOT}/data`;

async function ensureDirAsync(dirPath) {
  try {
    const dirInfo = await FileSystem.getInfoAsync(dirPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }
  } catch (error) {
    console.warn('Marble storage ensureDirAsync error', error);
  }
}

export async function writeJsonAsync(key, value) {
  try {
    await ensureDirAsync(DATA_DIR);
    const targetPath = `${DATA_DIR}/${key}.json`;
    await FileSystem.writeAsStringAsync(targetPath, JSON.stringify(value));
    return targetPath;
  } catch (error) {
    console.warn('Marble storage write error', error);
    throw error;
  }
}

export async function readJsonAsync(key, fallback = null) {
  try {
    await ensureDirAsync(DATA_DIR);
    const targetPath = `${DATA_DIR}/${key}.json`;
    const info = await FileSystem.getInfoAsync(targetPath);
    if (!info.exists) {
      return fallback;
    }
    const content = await FileSystem.readAsStringAsync(targetPath);
    return JSON.parse(content);
  } catch (error) {
    console.warn('Marble storage read error', error);
    return fallback;
  }
}

export async function deleteAsync(key) {
  try {
    const targetPath = `${DATA_DIR}/${key}.json`;
    const info = await FileSystem.getInfoAsync(targetPath);
    if (info.exists) {
      await FileSystem.deleteAsync(targetPath, { idempotent: true });
    }
  } catch (error) {
    console.warn('Marble storage delete error', error);
  }
}

export async function wipeAllAsync() {
  try {
    const info = await FileSystem.getInfoAsync(DATA_ROOT);
    if (info.exists) {
      await FileSystem.deleteAsync(DATA_ROOT, { idempotent: true });
    }
  } catch (error) {
    console.warn('Marble storage wipe error', error);
  }
}

export async function listFilesAsync(subdir) {
  try {
    const dirPath = `${DATA_ROOT}/${subdir}`;
    await ensureDirAsync(dirPath);
    return await FileSystem.readDirectoryAsync(dirPath);
  } catch (error) {
    console.warn('Marble storage list files error', error);
    return [];
  }
}

export async function writeFileAsync(subdir, filename, content) {
  const dirPath = `${DATA_ROOT}/${subdir}`;
  await ensureDirAsync(dirPath);
  const filePath = `${dirPath}/${filename}`;
  await FileSystem.writeAsStringAsync(filePath, content);
  return filePath;
}

export async function readFileAsync(subdir, filename) {
  const dirPath = `${DATA_ROOT}/${subdir}`;
  await ensureDirAsync(dirPath);
  const filePath = `${dirPath}/${filename}`;
  const info = await FileSystem.getInfoAsync(filePath);
  if (!info.exists) {
    return null;
  }
  return await FileSystem.readAsStringAsync(filePath);
}

export async function deleteFileAsync(subdir, filename) {
  const dirPath = `${DATA_ROOT}/${subdir}`;
  await ensureDirAsync(dirPath);
  const filePath = `${dirPath}/${filename}`;
  const info = await FileSystem.getInfoAsync(filePath);
  if (info.exists) {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  }
}

export function getDataDir() {
  return DATA_ROOT;
}

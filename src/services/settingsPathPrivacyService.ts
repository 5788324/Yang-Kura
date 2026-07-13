import type { LibraryPath, LibrarySettings } from "../types";
import { normalizeThemeType } from "../theme/themeContract";

const WINDOWS_ABSOLUTE_PATH = /^[a-zA-Z]:[\\/]/;
const UNC_PATH = /^(?:\\\\|\/\/)[^/\\]+[\\/][^/\\]+/;
const FILE_URL = /^file:\/\//i;
const ROOT_TOKEN_PREFIX = "rootPathToken:";
const LEGACY_PATH_PLACEHOLDER = "<旧本地路径已清除，请重新选择目录>";

function isPlaceholder(value: string): boolean {
  return value.startsWith("<") && value.endsWith(">");
}

export const settingsPathPrivacyService = {
  isAbsolutePath(value: unknown): boolean {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    return WINDOWS_ABSOLUTE_PATH.test(trimmed) || UNC_PATH.test(trimmed) || FILE_URL.test(trimmed);
  },

  isRootToken(value: unknown): boolean {
    return typeof value === "string" && value.startsWith(ROOT_TOKEN_PREFIX);
  },

  sanitizePathValue(value: unknown, kind: LibraryPath["type"] = "local"): string {
    if (typeof value !== "string") return kind === "local" ? LEGACY_PATH_PLACEHOLDER : "";
    const trimmed = value.trim();
    if (!trimmed) return kind === "local" ? LEGACY_PATH_PLACEHOLDER : "";
    if (kind === "local" && this.isAbsolutePath(trimmed)) return LEGACY_PATH_PLACEHOLDER;
    if (FILE_URL.test(trimmed)) return kind === "local" ? LEGACY_PATH_PLACEHOLDER : "";
    return trimmed;
  },

  sanitizeLibraryPath(pathItem: LibraryPath): LibraryPath {
    return {
      ...pathItem,
      path: this.sanitizePathValue(pathItem.path, pathItem.type),
    };
  },

  sanitizeSettings(settings: LibrarySettings): LibrarySettings {
    return {
      ...settings,
      audioLibPath: this.sanitizePathValue(settings.audioLibPath, "local"),
      musicLibPath: this.sanitizePathValue(settings.musicLibPath, "local"),
      tempDownloadPath: this.sanitizePathValue(settings.tempDownloadPath, "local"),
      currentTheme: normalizeThemeType(settings.currentTheme),
      asmrPaths: Array.isArray(settings.asmrPaths)
        ? settings.asmrPaths.map((item) => this.sanitizeLibraryPath(item))
        : [],
      musicPaths: Array.isArray(settings.musicPaths)
        ? settings.musicPaths.map((item) => this.sanitizeLibraryPath(item))
        : [],
    };
  },

  getDisplayValue(pathItem: LibraryPath): string {
    const value = this.sanitizePathValue(pathItem.path, pathItem.type);
    if (pathItem.type === "local") {
      if (this.isRootToken(value)) return "已授权本地目录";
      if (value === LEGACY_PATH_PLACEHOLDER) return "旧路径记录已清除，请重新选择目录";
      if (isPlaceholder(value)) return value.slice(1, -1);
      return "本地目录记录";
    }
    if (/^https?:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        return `已配置 ${url.hostname}`;
      } catch {
        return "已配置网络地址";
      }
    }
    return value || "尚未配置";
  },

  getSafeLocalInputLabel(value: string): string {
    if (this.isRootToken(value)) return "已授权本地目录";
    if (this.isAbsolutePath(value)) return "旧路径已隐藏，请重新选择目录";
    return value || "请使用“选择目录”完成授权";
  },

  legacyPlaceholder: LEGACY_PATH_PLACEHOLDER,
};

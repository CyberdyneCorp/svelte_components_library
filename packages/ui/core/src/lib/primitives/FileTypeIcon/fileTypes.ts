/** Broad file family used to colour a `FileTypeIcon`. */
export type FileCategory =
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "image"
  | "audio"
  | "video"
  | "archive"
  | "code"
  | "other";

const EXTENSIONS: Record<Exclude<FileCategory, "other">, string[]> = {
  pdf: ["pdf"],
  document: ["doc", "docx", "odt", "rtf", "txt", "md", "pages"],
  spreadsheet: ["xls", "xlsx", "ods", "csv", "tsv", "numbers"],
  presentation: ["ppt", "pptx", "odp", "key"],
  image: ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "heic", "tif", "tiff", "ico"],
  audio: ["mp3", "wav", "flac", "ogg", "m4a", "aac", "opus"],
  video: ["mp4", "mov", "webm", "mkv", "avi", "m4v"],
  archive: ["zip", "tar", "gz", "tgz", "rar", "7z", "bz2", "xz"],
  code: [
    "js", "mjs", "cjs", "ts", "tsx", "jsx", "json", "html", "css", "scss", "py", "go", "rs", "c", "h",
    "cpp", "hpp", "java", "kt", "swift", "rb", "php", "svelte", "vue", "sh", "yaml", "yml", "toml",
    "xml", "sql", "sol", "sv",
  ],
};

const CATEGORY_BY_EXTENSION = new Map<string, FileCategory>(
  (Object.entries(EXTENSIONS) as [FileCategory, string[]][]).flatMap(([category, exts]) =>
    exts.map((ext): [string, FileCategory] => [ext, category]),
  ),
);

/**
 * Lowercase extension of a filename: the text after its last dot. Returns
 * `""` when there is no dot, or for a dotfile such as `.env`.
 */
export function fileExtension(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

/**
 * Category of an extension (`"pdf"`, `".PDF"`) or a filename (`"a.tar.gz"`).
 * Input containing a dot after its first character is read as a filename.
 */
export function fileCategory(extOrName: string): FileCategory {
  const ext = normalizeExtension(extOrName);
  return CATEGORY_BY_EXTENSION.get(ext) ?? "other";
}

/** `"pdf"`, `".PDF"` → `"pdf"`; `"report.final.pdf"` → `"pdf"`. */
export function normalizeExtension(extOrName: string): string {
  const trimmed = extOrName.trim();
  if (trimmed.lastIndexOf(".") > 0) return fileExtension(trimmed);
  return trimmed.replace(/^\./, "").toLowerCase();
}

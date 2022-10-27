import ffsConfig from "../ffs-config.json";

interface FFSConfig {
  PLACES_SQLITE_SRC: string | undefined;
  PLACES_SQLITE_DEST: string | undefined;
}

export interface SqlitePath {
  src: string;
  dest: string;
}

export const getSqlitePath = (): SqlitePath => {
  const { PLACES_SQLITE_SRC: src, PLACES_SQLITE_DEST: dest } =
    ffsConfig as FFSConfig;
  if (!src || !dest) {
    throw new Error("src or dest does not exist!");
  }
  return { src, dest };
};

export const TYPE_BOOKMARK = 1;
export const TYPE_DIR = 2;
type TypeBookmark = typeof TYPE_BOOKMARK;
type TypeDir = typeof TYPE_DIR;
type RowType = TypeBookmark | TypeDir;
export interface ResultRow {
  id: number;
  type: RowType;
  parent: number;
  title: string;
}

export const EXACT_BOTH = "exact-both";
export const EXACT_DIR = "exact-dir";
export const EXACT_BOOKMARK = "exact-bookmark";
export type ExactType =
  | typeof EXACT_BOTH
  | typeof EXACT_DIR
  | typeof EXACT_BOOKMARK;

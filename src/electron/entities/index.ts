export type StoreType = {
  src?: string;
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

export const TARGET_BOTH = "TARGET_BOTH";
export const TARGET_DIR = "TARGET_DIR";
export const TARGET_BOOKMARK = "TARGET_BOOKMARK";
export type TargetType =
  | typeof TARGET_BOTH
  | typeof TARGET_DIR
  | typeof TARGET_BOOKMARK;

export const MATCH_FUZZY = "MATCH_FUZZY";
export const MATCH_EXACT = "MATCH_EXACT";
export type MatchType = typeof MATCH_FUZZY | typeof MATCH_EXACT;

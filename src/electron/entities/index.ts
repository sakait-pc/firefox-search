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

export interface ResultRow {
  id: number;
  type: 1 | 2;
  parent: number;
  title: string;
}

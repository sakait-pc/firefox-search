import fs from "fs";
import sqlite3 from "sqlite3";
import type { Database } from "sqlite3";
import type { ResultRow, MatchType, TargetType } from "../entities";
import {
  getSqlitePath,
  TARGET_BOTH,
  TARGET_DIR,
  TARGET_BOOKMARK,
  TYPE_DIR,
  TYPE_BOOKMARK,
  MATCH_EXACT,
} from "../entities";

interface CreationResult {
  db: Database | null;
  log: string;
}

const createDB = (): CreationResult => {
  try {
    const { src, dest } = getSqlitePath();
    const existsDest = fs.existsSync(dest);
    if (!existsDest) fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
    const db = new sqlite3.Database(dest);
    const baseLog = "The DB instance was successfully created.";
    const log = existsDest ? `${baseLog}\n${dest} already exists.` : baseLog;
    return { db, log };
  } catch (e) {
    if (e instanceof Error) {
      return { db: null, log: e.message };
    } else {
      return { db: null, log: "Unexpected error" };
    }
  }
};

const { db, log } = createDB();

export const existsDB = () => !!db;

export const getLog = () => log;

export const close = () => db?.close();

// ===== API =====
const getQuery = (title: string, match: MatchType, target: TargetType) => {
  const sql =
    "select id, type, parent, title from moz_bookmarks where title like ?";
  const params = match === MATCH_EXACT ? [title] : [`%${title}%`];
  const defaultQuery = { sql, params };
  switch (target) {
    case TARGET_BOTH:
      return defaultQuery;
    case TARGET_DIR:
      return {
        sql: `${sql} and type = ${TYPE_DIR}`,
        params,
      };
    case TARGET_BOOKMARK:
      return {
        sql: `${sql} and type = ${TYPE_BOOKMARK}`,
        params,
      };
    default:
      return defaultQuery;
  }
};

export const selectAsync = (
  title: string,
  match: MatchType,
  target: TargetType
): Promise<Array<ResultRow>> => {
  return new Promise((resolve, reject) => {
    const { sql, params } = getQuery(title, match, target);
    db?.serialize(() => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  });
};

export const selectParentAsync = (
  parentId: number
): Promise<ResultRow | undefined> => {
  return new Promise((resolve, reject) => {
    db?.serialize(() => {
      db.get(
        "select id, type, parent, title from moz_bookmarks where id = ?",
        parentId,
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  });
};

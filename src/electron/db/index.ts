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

const toMultipleWord = (title: string, match: MatchType) => {
  const baseSql =
    "select id, type, parent, title from moz_bookmarks where title like ?";
  if (match === MATCH_EXACT) return { sql: baseSql, params: [title] };
  const titles = title
    .trim()
    .replace(/(\s|　)+/g, " ")
    .split(" ");
  const sql = titles.slice(1).reduce(sql => `${sql} and title like ?`, baseSql);
  const params = titles.map(title => `%${title}%`);
  return { sql, params };
};

const getQuery = (title: string, match: MatchType, target: TargetType) => {
  const { sql, params } = toMultipleWord(title, match);
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

export class DatabaseModule {
  db: Database | null = null;

  log: string = "The DB instance was successfully created.";

  constructor() {
    this.createDB();
  }

  createDB = () => {
    try {
      const { src, dest } = getSqlitePath();
      const existsDest = fs.existsSync(dest);
      if (!existsDest) fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
      this.db = new sqlite3.Database(dest);
      if (existsDest) {
        this.log = `${this.log}\n${dest} already exists.`;
      }
    } catch (e) {
      this.db = null;
      this.log = e instanceof Error ? e.message : "Unexpected error";
    }
  };

  existsDB = () => !!this.db;

  close = () => this.db?.close();

  selectAsync = (
    title: string,
    match: MatchType,
    target: TargetType
  ): Promise<Array<ResultRow>> => {
    return new Promise((resolve, reject) => {
      const { sql, params } = getQuery(title, match, target);
      this.db?.serialize(() => {
        this.db?.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
    });
  };

  selectParentAsync = (parentId: number): Promise<ResultRow | undefined> => {
    return new Promise((resolve, reject) => {
      this.db?.serialize(() => {
        this.db?.get(
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
}

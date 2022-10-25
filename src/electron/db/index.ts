import fs from "fs";
import sqlite3 from "sqlite3";
import type { Database } from "sqlite3";
import { getSqlitePath } from "../entities";

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

export interface ResultRow {
  id: number;
  type: 1 | 2;
  parent: number;
  title: string;
}

export interface ElectronAPI {
  selectDirectory: (title: string) => Promise<ResultRow | undefined>;
}

export const selectDirectoryAsync = (
  title: string
): Promise<ResultRow | undefined> => {
  return new Promise((resolve, reject) => {
    db?.serialize(() => {
      db.get(
        "select * from moz_bookmarks where title = ?",
        [title],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  });
};

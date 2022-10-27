import { useState } from "react";
import type { ChangeEvent } from "react";
import type { ResultRow, ExactType } from "./electron/entities";
import {
  TYPE_DIR,
  EXACT_BOTH,
  EXACT_DIR,
  EXACT_BOOKMARK,
} from "./electron/entities";
import { ROOT_ID } from "./electron/constants";
import "./App.css";

const App = () => {
  const { selectExact, selectParent } = window.electron;

  const [$rows, setRows] = useState<Array<ResultRow>>([]);
  const [$searchText, setSearchText] = useState("");
  const [$currentExactType, setCurrentExactType] =
    useState<ExactType>(EXACT_BOTH);

  const onChangeSearchText = async (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    try {
      const row = await selectExact(e.target.value, $currentExactType);
      if (!row) {
        setRows([]);
        return;
      }
      setRows([row]);
    } catch (error) {
      alert(`Failed to search: ${error}`);
    }
  };

  const onChangeExactType = async (e: ChangeEvent<HTMLInputElement>) => {
    const exactType = e.target.value as ExactType;
    setCurrentExactType(exactType);
    try {
      const row = await selectExact($searchText, exactType);
      if (!row) {
        setRows([]);
        return;
      }
      setRows([row]);
    } catch (error) {
      alert(`Failed to search: ${error}`);
    }
  };

  const validate = (row: ResultRow) => {
    if (row.id === ROOT_ID) return false;
    const exists = $rows.map($row => $row.id).includes(row.id);
    if (exists) return false;

    return true;
  };

  const onClickSelectParent = async (parentId: number) => {
    try {
      const row = await selectParent(parentId);
      if (!row || !validate(row)) return;
      setRows([row, ...$rows]);
    } catch (error) {
      alert(`Failed to search parent: ${error}`);
    }
  };

  return (
    <div className="App">
      <aside className="side">
        <div>
          <span>完全一致検索</span>
        </div>
        <div className="radios-wrap">
          <div className="radio-wrap">
            <input
              type="radio"
              id="radio-exact-both"
              name="exact"
              value={EXACT_BOTH}
              checked={$currentExactType === EXACT_BOTH}
              // disabled={isDisabledRadioBtn}
              onChange={onChangeExactType}
            />
            <label htmlFor="radio-exact-both">both</label>
          </div>
          <div className="radio-wrap">
            <input
              type="radio"
              id="radio-exact-dir"
              name="exact"
              value={EXACT_DIR}
              checked={$currentExactType === EXACT_DIR}
              onChange={onChangeExactType}
            />
            <label htmlFor="radio-exact-dir">dir</label>
          </div>
          <div className="radio-wrap">
            <input
              type="radio"
              id="radio-exact-bookmark"
              name="exact"
              value={EXACT_BOOKMARK}
              checked={$currentExactType === EXACT_BOOKMARK}
              onChange={onChangeExactType}
            />
            <label htmlFor="radio-exact-bookmark">bookmark</label>
          </div>
        </div>
        <div className="search">
          <input
            type="text"
            onChange={onChangeSearchText}
            value={$searchText}
          />
        </div>
      </aside>
      <main className="main">
        <h1>
          Hello, Vite +{" "}
          {
            <a
              href="https://www.electronjs.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Electron
            </a>
          }{" "}
          + React + TypeScript
        </h1>
        <div className="list-item">
          {$rows.length !== 0 &&
            $rows.map((row, idx) => {
              const isLastElement = idx === $rows.length - 1;
              return isLastElement ? (
                <button
                  key={row.id}
                  onClick={() => onClickSelectParent(row.parent)}
                  className={row.type === TYPE_DIR ? "result-dir" : undefined}
                >
                  {row.title}
                </button>
              ) : (
                <span key={row.id}>
                  <button
                    onClick={() => onClickSelectParent(row.parent)}
                    className="result-dir"
                  >
                    {row.title}
                  </button>
                  <span> &gt; </span>
                </span>
              );
            })}
        </div>
      </main>
    </div>
  );
};

export default App;

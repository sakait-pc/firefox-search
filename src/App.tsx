import { useState } from "react";
import type { ChangeEvent } from "react";
import type { ResultRow, MatchType, TargetType } from "./electron/entities";
import {
  TYPE_DIR,
  TARGET_BOTH,
  TARGET_DIR,
  TARGET_BOOKMARK,
  MATCH_FUZZY,
  MATCH_EXACT,
} from "./electron/entities";
import { ROOT_ID } from "./electron/constants";
import "./App.css";

const App = () => {
  const { select, selectParent } = window.electron;

  const [$searchResults, setSearchResults] = useState<Array<Array<ResultRow>>>([
    [],
  ]);
  const [$searchText, setSearchText] = useState("");
  const [$matchType, setMatchType] = useState<MatchType>(MATCH_FUZZY);
  const [$targetType, setTargetType] = useState<TargetType>(TARGET_BOTH);

  const onChangeSearchText = async (e: ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setSearchText(title);
    if (title === "") return;
    try {
      const rows = await select(title, $matchType, $targetType);
      if (rows.length === 0) {
        setSearchResults([[]]);
        return;
      }
      setSearchResults(rows.map(row => [row]));
    } catch (error) {
      alert(`Failed to search: ${error}`);
    }
  };

  const onChangeTargetType = async (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target.value as TargetType;
    setTargetType(target);
    if ($searchText === "") return;
    try {
      const rows = await select($searchText, $matchType, target);
      if (rows.length === 0) {
        setSearchResults([[]]);
        return;
      }
      setSearchResults(rows.map(row => [row]));
    } catch (error) {
      alert(`Failed to search: ${error}`);
    }
  };

  const onChangeMatchType = async (e: ChangeEvent<HTMLInputElement>) => {
    const match = e.target.value as MatchType;
    setMatchType(match);
    if ($searchText === "") return;
    try {
      const rows = await select($searchText, match, $targetType);
      if (rows.length === 0) {
        setSearchResults([[]]);
        return;
      }
      setSearchResults(rows.map(row => [row]));
    } catch (error) {
      alert(`Failed to search: ${error}`);
    }
  };

  const validate = (row: ResultRow, rowsIdx: number) => {
    if (row.id === ROOT_ID) return false;
    const exists = $searchResults[rowsIdx]
      .map($row => $row.id)
      .includes(row.id);
    if (exists) return false;

    return true;
  };

  const onClickSelectParent = async (parentId: number, rowsIdx: number) => {
    try {
      const row = await selectParent(parentId);
      if (!row || !validate(row, rowsIdx)) return;
      setSearchResults(
        $searchResults.map((rows, idx) => {
          if (idx === rowsIdx) {
            return [row, ...rows];
          }
          return rows;
        })
      );
    } catch (error) {
      alert(`Failed to search parent: ${error}`);
    }
  };

  return (
    <div className="App">
      <aside className="side">
        <div className="side-section-wrap">
          <span className="side-section-title">Match type</span>
          <div className="radios-wrap">
            <div className="radio-wrap">
              <input
                type="radio"
                id="radio-match-fuzzy"
                name="match"
                value={MATCH_FUZZY}
                checked={$matchType === MATCH_FUZZY}
                onChange={onChangeMatchType}
              />
              <label htmlFor="radio-match-fuzzy">fuzzy</label>
            </div>
            <div className="radio-wrap">
              <input
                type="radio"
                id="radio-match-exact"
                name="match"
                value={MATCH_EXACT}
                checked={$matchType === MATCH_EXACT}
                onChange={onChangeMatchType}
              />
              <label htmlFor="radio-match-exact">exact</label>
            </div>
          </div>
        </div>
        <div className="side-section-wrap">
          <span className="side-section-title">Target type</span>
          <div className="radios-wrap">
            <div className="radio-wrap">
              <input
                type="radio"
                id="radio-target-both"
                name="target"
                value={TARGET_BOTH}
                checked={$targetType === TARGET_BOTH}
                // disabled={isDisabledRadioBtn}
                onChange={onChangeTargetType}
              />
              <label htmlFor="radio-target-both">both</label>
            </div>
            <div className="radio-wrap">
              <input
                type="radio"
                id="radio-target-dir"
                name="target"
                value={TARGET_DIR}
                checked={$targetType === TARGET_DIR}
                onChange={onChangeTargetType}
              />
              <label htmlFor="radio-target-dir">dir</label>
            </div>
            <div className="radio-wrap">
              <input
                type="radio"
                id="radio-target-bookmark"
                name="target"
                value={TARGET_BOOKMARK}
                checked={$targetType === TARGET_BOOKMARK}
                onChange={onChangeTargetType}
              />
              <label htmlFor="radio-target-bookmark">bookmark</label>
            </div>
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
        {$searchResults[0].length !== 0 &&
          $searchResults.map((rows, rowsIdx) => (
            <div key={rowsIdx} className="list-item">
              {rows.map((row, idx) => {
                const isLastElement = idx === rows.length - 1;
                return isLastElement ? (
                  <button
                    key={row.id}
                    onClick={() => onClickSelectParent(row.parent, rowsIdx)}
                    className={row.type === TYPE_DIR ? "result-dir" : undefined}
                  >
                    {row.title}
                  </button>
                ) : (
                  <span key={row.id}>
                    <button
                      onClick={() => onClickSelectParent(row.parent, rowsIdx)}
                      className="result-dir"
                    >
                      {row.title}
                    </button>
                    <span> &gt; </span>
                  </span>
                );
              })}
            </div>
          ))}
      </main>
    </div>
  );
};

export default App;

import { useState } from "react";
import type { ChangeEvent } from "react";
import type { ResultRow } from "./electron/entities";
import { ROOT_ID } from "./electron/entities";
import "./App.css";

const App = () => {
  const { selectDirectory, selectParent } = window.electron;

  const [$rows, setRows] = useState<Array<ResultRow>>([]);
  const [$searchText, setSearchText] = useState("");

  const onChangeSearchText = async (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    try {
      const row = await selectDirectory(e.target.value);
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
        <header className="side-header">
          <span>フォルダ名検索（完全一致）</span>
        </header>
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
                >
                  {row.title}
                </button>
              ) : (
                <span key={row.id}>
                  <button onClick={() => onClickSelectParent(row.parent)}>
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

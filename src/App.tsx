import { useState } from "react";
import type { ChangeEvent } from "react";
import "./App.css";
import { ResultRow } from "./electron/db";

const App = () => {
  const { selectDirectory } = window.electron;

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
                <span key={row.id}>{row.title}</span>
              ) : (
                <span key={row.id}>{row.title} &gt; </span>
              );
            })}
        </div>
      </main>
    </div>
  );
};

export default App;

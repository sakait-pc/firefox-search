import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import "./App.css";
import { ResultRow } from "./electron/db";

// TODO: Array<<Array<ResultRow>>>
const initialResultRows: Array<ResultRow> = [
  {
    id: 2,
    type: 2,
    parent: 1,
    title: "ブックマークメニュー",
  },
  {
    id: 15253,
    type: 2,
    parent: 2,
    title: "Electron",
  },
  {
    id: 25094,
    type: 2,
    parent: 15253,
    title: "入門",
  },
];

const App = () => {
  const { selectMock } = window.electron;

  const [count, setCount] = useState(0);
  const [$rows, setRows] = useState<Array<ResultRow>>(initialResultRows);
  const [$searchText, setSearchText] = useState("");
  const [$mock, setMock] = useState<ResultRow>({
    id: 0,
    type: 2,
    parent: 0,
    title: "",
  });

  useEffect(() => {
    const fetchMockAsync = async () => {
      const mockRow = await selectMock();
      setMock(mockRow);
    };
    fetchMockAsync();
  }, []);

  const onChangeSearchText = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    // TODO: call function to get search results
  };

  return (
    <div className="App">
      <aside className="side">
        <header className="side-header">
          <span>フォルダ名検索</span>
        </header>
        <div className="search">
          <input
            type="text"
            onChange={onChangeSearchText}
            value={$searchText}
          />
        </div>
        <div>
          <button onClick={() => setCount(count => count + 1)}>
            count is {count}
          </button>
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
          {$rows.map((row, idx) => {
            const isLastElement = idx === $rows.length - 1;
            return isLastElement ? (
              <span key={row.id}>{row.title}</span>
            ) : (
              <span key={row.id}>{row.title} &gt; </span>
            );
          })}
        </div>
        <div className="list-item">
          <span>{$mock.title}</span>
        </div>
      </main>
    </div>
  );
};

export default App;

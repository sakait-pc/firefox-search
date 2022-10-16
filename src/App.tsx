import { useState } from "react";

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello, Vite + Electron + React + TypeScript</h1>
      <button onClick={() => setCount(count => count + 1)}>
        count is {count}
      </button>
    </div>
  );
};

export default App;

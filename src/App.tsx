import { useState } from "react";
import { load, save } from "./storage";

export function App() {
  const [title, setTitle] = useState(() => load().title);

  return (
    <main>
      <h1>tabsplit</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save({ title });
        }}
      >
        <label>
          Tab name
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <button type="submit">Save</button>
      </form>
    </main>
  );
}

import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [tab, setTab] = useState({});

  // chrome.action.setIcon({ path: "/example/path/image.png" });
  if (chrome.tabs) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    if (currentTab) {
      const url = new URL(currentTab.url || "");
      setTab({
        title: currentTab.title,
        favicon: currentTab.favIconUrl,
        url: {
          origin: url.origin,
          pathname: url.pathname,
        },
      });
    }
  });
}

  return (
    <div className="App">
      <h1>TabTime</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <div className='text-left'>
          <code>
            <pre>{JSON.stringify(tab, null, 2)}</pre>
          </code>
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App

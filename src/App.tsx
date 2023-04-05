import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [tab, setTab] = useState({});

  // chrome.action.setIcon({ path: "/example/path/image.png" });
  if (chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        const url = new URL(currentTab.url || '');
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

  const clickButton = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline">TabTime</h1>
      <div>
        <button onClick={() => clickButton()}>count is {count}</button>
        <div>
          <code>
            <pre>{JSON.stringify(tab, null, 2)}</pre>
          </code>
        </div>
      </div>
      <p>Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;

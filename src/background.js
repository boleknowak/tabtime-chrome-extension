/* eslint-disable no-undef */

// if (chrome.action) {
//   chrome.action.setIcon({ path: '/images/icons/tabtime.png' });
// }

const API_URL = 'http://localhost:3003/v1';
const cache = [];

if (chrome.tabs) {
  const getActiveTab = () => {
    // chrome.action.setBadgeText({ text: 'ON' });
    // chrome.action.setBadgeBackgroundColor({ color: '#9688F1' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        if (typeof currentTab.url === 'undefined') return;
        if (currentTab.url.startsWith('chrome://')) return;

        const url = new URL(currentTab.url || currentTab.pendingUrl || '');
        const data = {
          title: currentTab.title,
          favicon: currentTab.favIconUrl,
          url: {
            origin: url.origin,
            pathname: url.pathname,
          },
          started_at: new Date().toISOString(),
        };

        cache[currentTab.id] = data;

        chrome.storage.sync.get('token', (result) => {
          if (!result.token) return;

          // TODO: Handle error
          try {
            fetch(`${API_URL}/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${result.token}`,
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify(data),
            });
          } catch (error) {
            // console.error(error);
          }
        });
      }
    });
  };

  chrome.webNavigation.onHistoryStateUpdated.addListener((data) => {
    if (data.frameId === 0) {
      getActiveTab();
    }
  });

  chrome.tabs.onActivated.addListener(() => {
    getActiveTab();
  });

  chrome.tabs.onUpdated.addListener((tabid, changeInfo) => {
    if (changeInfo.status === 'complete') {
      getActiveTab();
    }
  });

  chrome.tabs.onRemoved.addListener(async (tabid) => {
    if (typeof cache[tabid] === 'undefined') return;

    const data = cache[tabid];

    await chrome.storage.sync.get('token', async (result) => {
      if (!result.token) return;

      // TODO: send end_at to server
      try {
        await fetch(`${API_URL}/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${result.token}`,
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            ...data,
            type: 'tab',
            ended_at: new Date().toISOString(),
          }),
        });
      } catch (error) {
        // console.error(error);
      }
    });
  });

  // not working
  chrome.windows.onRemoved.addListener(async (tabid) => {
    if (typeof cache[tabid] === 'undefined') return;

    const data = cache[tabid];
    await chrome.storage.sync.get('token', async (result) => {
      if (!result.token) return;

      try {
        await fetch(`${API_URL}/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${result.token}`,
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            ...data,
            type: 'window',
            ended_at: new Date().toISOString(),
          }),
        });
      } catch (error) {
        // console.error(error);
      }
    });
  });

  setInterval(() => {
    // getActiveTab();
    // TODO: pulse to server, if started_at is set but ended_at is not, and there are 5 minutes passed, then end it
  }, 1000 * 60 * 5);
}

/* eslint-disable no-undef */

// if (chrome.action) {
//   chrome.action.setIcon({ path: '/images/icons/tabtime.png' });
// }

// onTabChange it should send a request to server and insert a new record
// every x minutes it should send a request to server and update the record
// if server does not get any request for a tab for 5 minutes, it should end the record
// because if user has 2 windows open (e.g. 2 screens), clock will have a problem
// newTab -> create record -> update record every x minutes -> end record if no update for 5 minutes
// e.g. last_ping_at

const API_URL = 'http://localhost:3003/v1';
const cache = [];

if (chrome.tabs) {
  const getActiveTab = (mode = 'track') => {
    // chrome.action.setBadgeText({ text: 'ON' });
    // chrome.action.setBadgeBackgroundColor({ color: '#9688F1' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        const checkUrl = currentTab.url || currentTab.pendingUrl || '';
        if (typeof checkUrl === 'undefined') return;
        if (checkUrl.startsWith('chrome://')) return;
        if (checkUrl.startsWith('chrome-extension://')) return;
        if (checkUrl.startsWith('chrome://newtab')) return;

        const url = new URL(checkUrl);

        chrome.runtime.getPlatformInfo((info) => {
          const data = {
            title: currentTab.title,
            favicon: currentTab.favIconUrl,
            url: {
              origin: url.origin,
              pathname: url.pathname + url.search,
            },
            os: info.os || 'unknown',
            browser: 'chrome',
          };

          cache[currentTab.id] = data;
          chrome.storage.sync.get('token', (result) => {
            if (!result.token) return;

            // TODO: Handle error
            try {
              fetch(`${API_URL}/${mode}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: result.token,
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(data),
              });
            } catch (error) {
              // console.error(error);
            }
          });
        });
      }
    });
  };

  // chrome.webNavigation.onHistoryStateUpdated.addListener(() => {
  //   fetch(`${API_URL}?event=onHistoryStateUpdated`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Access-Control-Allow-Origin': '*',
  //     },
  //   });
  //   getActiveTab();
  // });

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
            Authorization: result.token,
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

  setInterval(() => {
    getActiveTab('pulse');
  }, 1000 * 5);
}

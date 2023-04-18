/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */

// because if user has 2 windows open (e.g. 2 screens), clock will have a problem
// newTab -> create record -> update record every x minutes -> end record if no update for 5 minutes

const API_URL = 'http://localhost:3003/v1';
const cache = [];

function getOSAndBrowserInfo(userAgent) {
  let os;
  let browser;
  let version;

  // Get operating system
  if (userAgent.indexOf('Win') !== -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') !== -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Linux') !== -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') !== -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iOS') !== -1) {
    os = 'iOS';
  } else {
    os = 'Unknown';
  }

  // Get browser name and version
  if (/MSIE|Trident/.test(userAgent)) {
    browser = 'Internet Explorer';
    version = userAgent.match(/(?:MSIE |rv:)(\d+(\.\d+)?)/)[1];
  } else if (/Firefox/.test(userAgent)) {
    browser = 'Mozilla Firefox';
    version = userAgent.match(/Firefox\/(\d+(\.\d+)?)/)[1];
  } else if (/Chrome/.test(userAgent)) {
    browser = 'Google Chrome';
    version = userAgent.match(/Chrome\/(\d+(\.\d+)?)/)[1];
  } else if (/Safari/.test(userAgent)) {
    browser = 'Apple Safari';
    version = userAgent.match(/Safari\/(\d+(\.\d+)?)/)[1];
  } else if (/Edge/.test(userAgent)) {
    browser = 'Microsoft Edge';
    version = userAgent.match(/Edge\/(\d+(\.\d+)?)/)[1];
  } else {
    browser = 'Unknown';
    version = 'Unknown';
  }

  return {
    os,
    browser,
    version,
  };
}

if (chrome.tabs) {
  const getActiveTab = (mode = 'track') => {
    // chrome.action.setBadgeText({ text: 'ON' });
    // chrome.action.setBadgeBackgroundColor({ color: '#9688F1' });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        const checkUrl = currentTab.url || currentTab.pendingUrl || '';
        if (typeof checkUrl === 'undefined') return;
        // if (checkUrl.startsWith('chrome://')) return;
        // if (checkUrl.startsWith('chrome-extension://')) return;
        // if (checkUrl.startsWith('chrome://newtab')) return;

        const url = new URL(checkUrl);

        const userAgent = getOSAndBrowserInfo(navigator.userAgent);

        // chrome.runtime.getPlatformInfo((info) => {});
        const data = {
          title: currentTab.title,
          favicon: currentTab.favIconUrl,
          url: {
            origin: url.origin,
            pathname: url.pathname + url.search,
          },
          os: userAgent.os || 'unknown',
          browser: userAgent.browser || 'unknown',
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

/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */

const API_URL = 'http://localhost:3003/v1';

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
  const getActiveTabs = () => {
    // chrome.action.setBadgeText({ text: 'ON' });
    // chrome.action.setBadgeBackgroundColor({ color: '#9688F1' });
    chrome.tabs.query({ active: true }, (tabs) => {
      chrome.storage.sync.get('token', (result) => {
        if (!result.token) return;

        // TODO: Handle error
        try {
          const data = {
            tabs: tabs.map((tab) => {
              const checkUrl = tab.url || tab.pendingUrl || '';
              if (typeof checkUrl === 'undefined') return null;
              // if (checkUrl.startsWith('chrome://')) return null;
              // if (checkUrl.startsWith('chrome-extension://')) return null;
              // if (checkUrl.startsWith('chrome://newtab')) return null;

              const url = new URL(checkUrl);

              return {
                title: tab.title,
                favicon: tab.favIconUrl,
                url: {
                  origin: url.origin,
                  pathname: url.pathname + url.search,
                },
              };
            }),
            os: getOSAndBrowserInfo(navigator.userAgent).os,
            browser: getOSAndBrowserInfo(navigator.userAgent).browser,
          };

          fetch(`${API_URL}/track-tabs`, {
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
  };

  setInterval(() => {
    getActiveTabs();
  }, 1000 * 1);
}

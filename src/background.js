/* eslint-disable no-undef */

if (chrome.tabs) {
  chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        if (typeof currentTab.url === 'undefined') return;
        if (currentTab.url.startsWith('chrome://')) return;

        const url = new URL(currentTab.url || '');
        const data = {
          title: currentTab.title,
          favicon: currentTab.favIconUrl,
          url: {
            origin: url.origin,
            pathname: url.pathname,
          },
        };

        console.log('data', data);
      }
    });
  });
}

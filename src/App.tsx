import { useEffect, useState } from 'react';

type CurrentStats = {
  origin: string;
  time: string;
};

const API_URL = 'http://localhost:3003/v1';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isSavedKey, setIsSavedKey] = useState(false);
  const [isEditingKeyState, setIsEditingKeyState] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [time, setTime] = useState(null);
  const [currentStats, setCurrentStats] = useState<CurrentStats>({
    origin: '',
    time: '',
  });
  const messages = [
    'TabTime or not TabTime, that is the question...',
    'TabTime is keeping an eye on your tabs 👀',
    'Keep calm and TabTime on 🤘',
    'TabTime, because every second counts ⏰',
    'TabTime, because you deserve to know how you spend your time ⏳',
    'Track your time, crush your goals - with TabTime ⏰',
    'Make every minute count - with TabTime 🤑',
  ];
  const [message, setMessage] = useState(messages[0]);

  const getTabTime = () => {
    if (!chrome.tabs) return;

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab) return;

      if (typeof currentTab.url === 'undefined') return;
      if (currentTab.url.startsWith('chrome://')) return;

      const url = new URL(currentTab.url || '');

      let { origin } = url;

      if (!token) return;

      setIsLoadingData(true);
      try {
        const response = await fetch(`${API_URL}/stats?url=${url}&time=${time}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        origin = origin.replace('https://', '');
        origin = origin.replace('http://', '');
        origin = origin.replace('www.', '');
        origin = origin.replace(/\/$/, '');

        if (data.message === 'ok') {
          setIsLoadingData(false);
          setCurrentStats({
            origin,
            time: data.time || '0s',
          });
        }
      } catch (error) {
        // console.log(error);
      }
    });
  };

  useEffect(() => {
    getTabTime();
  }, [token, time]);

  useEffect(() => {
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    if (!chrome.storage) return;

    chrome.storage.sync.get(['token', 'selectedTimeRange'], (result) => {
      setToken(result.token);
      setTime(result.selectedTimeRange || '24h');
      setIsSavedKey(!!result.token);
    });
  }, []);

  const setUserToken = () => {
    if (!chrome.storage) return;

    setIsSavingKey(true);
    chrome.storage.sync.set({ token }, () => {
      setIsSavingKey(false);
      setIsSavedKey(true);
      setIsEditingKeyState(false);

      if (token === null || token === '') {
        setIsSavedKey(false);
      }
    });
  };

  const setRange = (range: string) => {
    setTime(range);

    if (!chrome.storage) return;

    chrome.storage.sync.set({ selectedTimeRange: range }, () => {});
  };

  return (
    <div className="w-[400px] p-4 text-center">
      <div className="mb-4 text-left">
        <h1 className="text-2xl font-bold">TabTime</h1>
        <div className="text-xs font-medium">{message}</div>
      </div>
      {isSavedKey && (
        <div>
          <div className="mt-4 border-2 border-black p-4">
            {!isLoadingData && (
              <div>
                <div className="text-lg font-bold">{currentStats.time}</div>
                <div className="leading-4">{currentStats.origin}</div>
              </div>
            )}
            {isLoadingData && (
              <div className="space-y-2">
                <div className="mx-auto h-6 w-48 animate-pulse rounded bg-gray-100"></div>
                <div className="mx-auto h-3 w-28 animate-pulse rounded bg-gray-100"></div>
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-row items-center justify-between">
            <div className="flex flex-row items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditingKeyState(!isEditingKeyState)}
                className={`border-2 border-black px-2 font-bold uppercase ${
                  isEditingKeyState && 'bg-gray-600 text-white'
                }`}
              >
                Edit key
              </button>
            </div>
            <div className="flex flex-row items-center space-x-2">
              <button
                type="button"
                onClick={() => setRange('24h')}
                className={`border-2 border-black px-1 font-bold ${
                  time === '24h' && 'bg-gray-600 text-white'
                }`}
              >
                24h
              </button>
              <button
                type="button"
                onClick={() => setRange('7d')}
                className={`border-2 border-black px-1 font-bold ${
                  time === '7d' && 'bg-gray-600 text-white'
                }`}
              >
                7d
              </button>
              <button
                type="button"
                onClick={() => setRange('all')}
                className={`border-2 border-black px-1 font-bold ${
                  time === 'all' && 'bg-gray-600 text-white'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>
      )}
      {(isEditingKeyState || !isSavedKey) && (
        <div>
          <div className="mt-4 flex flex-grow flex-row space-x-4">
            <input
              type="password"
              className="w-full border-2 border-black px-2 py-1 text-center text-sm focus:border-black focus:outline-none"
              placeholder="Enter your key"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <button
              onClick={() => setUserToken()}
              disabled={isSavingKey}
              className={`block w-48 bg-black px-2 py-1 font-bold uppercase text-white ${
                isSavingKey && 'bg-opacity-50'
              }`}
            >
              Save key
            </button>
          </div>
          <div className="mt-1 text-left text-xs text-gray-600">
            <a
              href="https://tabtime.app/dashboard/keys"
              target="_blank"
              className="hover:underline"
            >
              Click here to get a token
            </a>
          </div>
        </div>
      )}
      <div className="mt-4 space-x-1 text-left text-xs text-gray-500">
        <a href="https://tabtime.app/dashboard" className="hover:underline" target="_blank">
          Account
        </a>
        <span>•</span>
        <a
          href="https://tabtime.app/dashboard/leaderboard"
          className="hover:underline"
          target="_blank"
        >
          Leaderboard
        </a>
        <span>•</span>
        <a href="https://tabtime.app" className="hover:underline" target="_blank">
          About
        </a>
      </div>
    </div>
  );
}

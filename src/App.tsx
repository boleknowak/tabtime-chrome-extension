import { useEffect, useState } from 'react';

type CurrentStats = {
  origin: string;
  time: string;
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [time, setTime] = useState('24h');
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

      const response = await fetch(`http://localhost:3003/v1/stats?url=${url}&time=${time}`, {
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
        setCurrentStats({
          origin,
          time: data.time || '0s',
        });
      }
    });
  };

  useEffect(() => {
    getTabTime();
  }, [token, time]);

  useEffect(() => {
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    if (!chrome.storage) return;

    chrome.storage.sync.get(['token'], (result) => {
      setToken(result.token);
    });
  }, []);

  const setUserToken = () => {
    if (!chrome.storage) return;

    setIsSaving(true);
    chrome.storage.sync.set({ token }, () => {
      setIsSaving(false);
    });
  };

  const toggleEditKey = () => {
    setIsEditingKey(!isEditingKey);
  };

  // TODO: add view when user not provided token
  return (
    <div className="w-[400px] p-4 text-center">
      <div className="mb-4 text-left">
        <h1 className="text-2xl font-bold">TabTime</h1>
        <div className="text-xs font-medium">{message}</div>
      </div>
      <div className="mt-4 border-2 border-black p-4">
        <div>
          <div className="text-lg font-bold">{currentStats.time}</div>
          <div>{currentStats.origin}</div>
        </div>
      </div>
      <div className="mt-2 flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-2">
          <button
            type="button"
            onClick={() => toggleEditKey()}
            className="border-2 border-black px-2 font-bold uppercase"
          >
            Edit key
          </button>
        </div>
        <div className="flex flex-row items-center space-x-2">
          <button
            type="button"
            onClick={() => setTime('24h')}
            className="border-2 border-black bg-gray-600 px-1 font-bold text-white"
          >
            24h
          </button>
          <button
            type="button"
            onClick={() => setTime('7d')}
            className="border-2 border-black px-1 font-bold"
          >
            7d
          </button>
          <button
            type="button"
            onClick={() => setTime('all')}
            className="border-2 border-black px-1 font-bold"
          >
            All
          </button>
        </div>
      </div>
      {isEditingKey && (
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
            disabled={isSaving}
            className="block w-48 bg-black px-2 py-1 font-bold uppercase text-white"
          >
            Save key
          </button>
        </div>
      )}
      {/* <div className="mt-4">
        You've spent <span className="font-medium">5 hours and 20 minutes</span> on the{' '}
        <span className="font-medium">chat.openai.com</span>
      </div> */}
      <div className="mt-4 space-x-1 text-left text-xs text-gray-500">
        <a href="" className="hover:underline" target="_blank">
          Account
        </a>
        <span>•</span>
        <a href="" className="hover:underline" target="_blank">
          Leaderboard
        </a>
        <span>•</span>
        <a href="" className="hover:underline" target="_blank">
          About
        </a>
      </div>
    </div>
  );
}

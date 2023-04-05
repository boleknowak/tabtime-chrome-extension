import { useEffect, useState } from 'react';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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

  return (
    <div className="w-[400px] p-4 text-center">
      <h1 className="mb-10 text-3xl font-bold">TabTime</h1>
      <div className="font-medium">I'm watching your tabs 👀</div>
      <div className="mt-4 flex flex-grow flex-row space-x-4">
        <input
          type="password"
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-center text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Enter your token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          onClick={() => setUserToken()}
          disabled={isSaving}
          className="block w-32 rounded-lg bg-blue-600 px-2 py-1 text-white"
        >
          Save token
        </button>
      </div>
      <div className="mt-10 text-xs text-gray-400">Click here to get more information</div>
    </div>
  );
}

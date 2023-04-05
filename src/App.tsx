export default function App() {
  // useEffect(() => {
  //   if (!chrome.action) return;

  //   chrome.action.setIcon({ path: '/images/icons/green.png' });
  //   setTimeout(() => {
  //     chrome.action.setIcon({ path: '/images/icons/red.png' });
  //   }, 5000);
  // }, [chrome.tabs]);

  return (
    <div className="w-[400px] p-4 text-center">
      <h1 className="mb-10 text-3xl font-bold">TabTime</h1>
      <div className="font-medium">I'm watching your tabs 👀</div>
      <div className="mt-10 text-xs text-gray-400">Click here to get more information</div>
    </div>
  );
}

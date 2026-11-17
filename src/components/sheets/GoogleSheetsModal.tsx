import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Table,
  Zap,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../../services/sheetsSync';

export const GoogleSheetsModal: React.FC = () => {
  const {
    tasks,
    isSheetsModalOpen,
    setIsSheetsModalOpen,
    sheetsSyncUrl,
    isSheetsSyncing,
    sheetsLastSyncTime,
    sheetsSyncError,
    connectSheets,
    disconnectSheets,
    triggerSheetsSync,
  } = useApp();

  const [inputUrl, setInputUrl] = useState(sheetsSyncUrl || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });
  const [activeTab, setActiveTab] = useState<'connect' | 'guide'>('connect');

  if (!isSheetsModalOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setTestStatus({ loading: true });
    const success = await connectSheets(inputUrl.trim());
    if (success) {
      setTestStatus({
        loading: false,
        success: true,
        message: 'Connected successfully to Google Sheet! Tasks synced.',
      });
    } else {
      setTestStatus({
        loading: false,
        success: false,
        message: 'Failed to connect. Make sure Web App access is set to "Anyone".',
      });
    }
  };

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Never synced';
    const date = new Date(iso);
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#18181c] border border-[#2e2e38] rounded-3xl shadow-2xl p-6 text-slate-200 text-xs flex flex-col max-h-[90vh] space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#282832]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2 m-0">
                Google Sheets Cloud Sync
                <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
                  Mobile + Laptop
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sync tasks across all your devices & multiple users directly into your Google Sheet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSheetsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#282832] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#121214] rounded-xl border border-[#26262e] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Connection Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Setup Instructions & Code</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* TAB 1: Connect & Status */}
        {activeTab === 'connect' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Status Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                sheetsSyncUrl
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-[#141416] border-[#2c2c36]'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      sheetsSyncUrl
                        ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                        : 'bg-slate-600'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {sheetsSyncUrl ? 'Connected to Google Sheet' : 'Not Connected'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {sheetsSyncUrl
                        ? `Last synced: ${formatLastSync(sheetsLastSyncTime)}`
                        : 'Connect your sheet to enable real-time sync across mobile and laptop.'}
                    </p>
                  </div>
                </div>

                {sheetsSyncUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setTestStatus({ loading: true, message: 'Pushing all tasks to Google Sheet...' });
                        await triggerSheetsSync();
                        setTestStatus({
                          loading: false,
                          success: true,
                          message: 'Pushed latest tasks directly to Google Sheet!',
                        });
                      }}
                      disabled={isSheetsSyncing || testStatus.loading}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 text-xs transition-all cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isSheetsSyncing || testStatus.loading ? 'animate-spin' : ''}`}
                      />
                      <span>{isSheetsSyncing || testStatus.loading ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Disconnect Google Sheet? Local tasks will not be deleted.')) {
                          disconnectSheets();
                          setInputUrl('');
                        }
                      }}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Where to find your tasks in Google Sheets banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white">Google Sheet-la Tasks enga irukum? (Important Tab Check)</p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Google Sheet-la keezha (bottom tabs) paatha <strong>"Tasks"</strong> nu oru tab create aagi irukum. Default-ah open aagura <em>Sheet1</em> blank-ah irundha, keezha irukira <strong>Tasks</strong> tab-ah click panni paarunga — unga tasks ellam anga columns-ah save aagirukum!
                </p>
              </div>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleConnect} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Google Apps Script Web App URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    required
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#121214] text-white border border-[#2e2e38] focus:outline-none focus:border-blue-500 font-mono placeholder-slate-600"
                  />
                  <button
                    type="submit"
                    disabled={testStatus.loading || !inputUrl.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 text-xs transition-all cursor-pointer shrink-0"
                  >
                    {testStatus.loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    <span>{sheetsSyncUrl ? 'Update URL' : 'Connect & Sync'}</span>
                  </button>
                </div>
              </div>

              {testStatus.message && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testStatus.success
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/30 text-red-300'
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}

              {sheetsSyncError && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{sheetsSyncError}</span>
                </div>
              )}
            </form>

            {/* Quick Multi-Device Explanation Banner */}
            <div className="p-3.5 rounded-2xl bg-[#141418] border border-[#26262e] space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>How to use on Mobile & Multiple Devices:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
                1. Once you connect your Google Sheet here on your laptop, open this web app on your <strong>Mobile phone</strong>.
                <br />
                2. On Mobile, open this Google Sheets Sync window, paste the <strong>same Web App URL</strong>, and click Connect!
                <br />
                3. That's it! Any tasks added or updated on mobile will appear on your laptop, and vice versa. 2-3 users can share the same sheet simultaneously!
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Setup Instructions & Code */}
        {activeTab === 'guide' && (
          <div className="space-y-4 overflow-y-auto pr-1 max-h-[60vh]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Step-by-Step Setup Guide (2 Minutes)</span>
                </h4>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-md"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Code Copied!' : 'Copy Apps Script Code'}</span>
                </button>
              </div>

              <ol className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed pl-4 list-decimal">
                <li>
                  Go to <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-400 underline font-bold inline-flex items-center gap-1">sheets.new <ExternalLink className="w-3 h-3" /></a> to create a new blank Google Sheet. Give it any name (e.g., <em>My TickTick Database</em>).
                </li>
                <li>
                  In the top menu, click <strong>Extensions</strong> &rarr; <strong>Apps Script</strong>.
                </li>
                <li>
                  Delete any code already in <code>Code.gs</code>, click the green <strong>Copy Apps Script Code</strong> button above, and paste it into the editor. Press <kbd className="bg-[#24242c] px-1 py-0.5 rounded border border-[#383842] text-[10px]">Ctrl+S</kbd> to save.
                </li>
                <li>
                  Click the blue <strong>Deploy</strong> button (top right) &rarr; select <strong>New deployment</strong>.
                </li>
                <li>
                  Click the gear icon next to "Select type" &rarr; choose <strong>Web app</strong>:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
                    <li>Description: <em>TickTick Sync</em></li>
                    <li>Execute as: <strong>Me (your email)</strong></li>
                    <li>Who has access: <strong className="text-emerald-400">Anyone</strong> (Essential for mobile & laptop access without login popups)</li>
                  </ul>
                </li>
                <li>
                  Click <strong>Deploy</strong>, grant permission if prompted, and <strong>copy the Web app URL</strong>.
                </li>
                <li>
                  Switch back to the <strong>Connection Status</strong> tab here, paste the URL, and click <strong>Connect & Sync</strong>!
                </li>
              </ol>
            </div>

            {/* Code Snippet Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Google Apps Script Source Code (Click to Copy):</span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-[#2a2a34] bg-[#101012]">
                <pre className="p-3 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48 scrollbar-thin">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-[#22222a] hover:bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

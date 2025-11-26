
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { WhatsAppService } from '../services/whatsapp';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'TEMPLATES'>('CONFIG');
  
  // Test State
  const [testPhone, setTestPhone] = useState('');
  const [testStatus, setTestStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testMsg, setTestMsg] = useState('');

  const handleSave = () => {
    StorageService.saveSettings(settings);
    alert("Settings Saved Successfully");
  };

  const handleTestSend = async () => {
    if (!testPhone) return;
    setTestStatus('SENDING');
    setTestMsg('');
    
    const result = await WhatsAppService.sendTestMessage(testPhone, settings);
    
    if (result.success) {
        setTestStatus('SUCCESS');
        setTestMsg('Message sent successfully!');
    } else {
        setTestStatus('ERROR');
        setTestMsg(result.error || 'Failed to send');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">System Configuration</h3>
        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button 
            onClick={() => setActiveTab('CONFIG')} 
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'CONFIG' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Gateway Connection
        </button>
        <button 
            onClick={() => setActiveTab('TEMPLATES')} 
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'TEMPLATES' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Notification Templates
        </button>
      </div>

      {activeTab === 'CONFIG' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Connection Settings */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 h-fit">
                <div>
                    <h4 className="font-bold text-slate-800 mb-1">WhatsApp Gateway</h4>
                    <p className="text-xs text-slate-500">Configure your seen.getsender.id credentials.</p>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">API Key</label>
                    <input className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono bg-slate-50" value={settings.waApiKey} onChange={e => setSettings({...settings, waApiKey: e.target.value})} placeholder="Enter API Key" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Sender ID</label>
                    <input className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono bg-slate-50" value={settings.waSender} onChange={e => setSettings({...settings, waSender: e.target.value})} placeholder="e.g. 628..." />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Endpoint URL</label>
                    <input className="w-full border rounded-lg px-3 py-2.5 text-sm font-mono bg-slate-50" value={settings.waEndpoint} onChange={e => setSettings({...settings, waEndpoint: e.target.value})} />
                </div>
            </div>

            {/* Test Connection */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 h-fit">
                 <div>
                    <h4 className="font-bold text-slate-800 mb-1">Test Connection</h4>
                    <p className="text-xs text-slate-500">Send a test message to verify credentials.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Target Phone Number</label>
                    <div className="flex gap-2">
                        <input 
                            className="w-full border rounded-lg px-3 py-2.5 text-sm" 
                            placeholder="e.g. 6281234..." 
                            value={testPhone} 
                            onChange={e => setTestPhone(e.target.value)} 
                        />
                        <button 
                            onClick={handleTestSend}
                            disabled={testStatus === 'SENDING' || !testPhone}
                            className="bg-slate-900 text-white px-4 rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    {testStatus === 'SENDING' && <p className="text-xs text-blue-600 mt-2 font-medium">Sending request...</p>}
                    {testStatus === 'SUCCESS' && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span>{testMsg}</span>
                        </div>
                    )}
                    {testStatus === 'ERROR' && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 p-2 rounded break-all">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{testMsg}</span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                     <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-slate-900 text-sm">Payment Gateway</h4>
                            <p className="text-xs text-slate-500">Enable QRIS Payments (Future)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.enablePaymentGateway} onChange={e => setSettings({...settings, enablePaymentGateway: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'TEMPLATES' && (
          <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             
             {/* Package Template */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800">New Package Arrival</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">REGULAR</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Variables: {`{name}, {tracking}, {location}, {link}`}</p>
                <textarea 
                    className="w-full border rounded-lg px-4 py-3 text-sm h-32 font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
                    value={settings.waTemplatePackage} 
                    onChange={e => setSettings({...settings, waTemplatePackage: e.target.value})} 
                />
                <div className="mt-2 text-xs text-orange-500 font-medium bg-orange-50 p-2 rounded">
                    Note: "Pickup Code" is now hidden in the message body. Use {`{link}`} to direct users to the tracking page.
                </div>
             </div>

             {/* Member Template */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800">Membership Activation</h4>
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold">MEMBER</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Variables: {`{name}, {location}, {expiry}`}</p>
                <textarea 
                    className="w-full border rounded-lg px-4 py-3 text-sm h-32 font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-colors" 
                    value={settings.waTemplateMember} 
                    onChange={e => setSettings({...settings, waTemplateMember: e.target.value})} 
                />
             </div>

             {/* Reminder Template */}
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800">Pickup Reminder (H+7)</h4>
                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold">REMINDER</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Variables: {`{name}, {tracking}, {location}, {link}`}</p>
                <textarea 
                    className="w-full border rounded-lg px-4 py-3 text-sm h-32 font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors" 
                    value={settings.waTemplateReminder} 
                    onChange={e => setSettings({...settings, waTemplateReminder: e.target.value})} 
                />
             </div>
          </div>
      )}
    </div>
  );
};

export default Settings;

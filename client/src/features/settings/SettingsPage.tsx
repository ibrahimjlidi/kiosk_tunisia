import React, { useEffect, useState } from 'react';
import { fetchSettings, createSetting, updateSetting, deleteSetting } from '../../services/settingsApi';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ key: '', value: '', type: 'string', category: 'general', description: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchSettings();
      setSettings(res.settings || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    try {
      const payload = { ...form, value: form.type === 'number' ? Number(form.value) : form.type === 'boolean' ? form.value === 'true' : form.value };
      const res = await createSetting(payload);
      if (res.success) {
        setForm({ key: '', value: '', type: 'string', category: 'general', description: '' });
        load();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400">System configuration keys and global operational preferences.</p>
      </div>

      <div className="glass-panel p-4 space-y-3">
        <div className="grid md:grid-cols-5 gap-3">
          <input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="Key" className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
          <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Value" className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white">
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="json">json</option>
          </select>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white" />
          <button onClick={handleSave} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">Add Setting</button>
        </div>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white" rows={2} />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">Configuration keys</div>
        <div className="divide-y divide-slate-800 text-sm text-slate-300">
          {loading ? <div className="px-4 py-4 text-slate-400">Loading...</div> : settings.map((item: any) => (
            <div key={item._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 gap-2">
              <div>
                <div className="font-semibold text-white">{item.key}</div>
                <div className="text-xs text-slate-400">{item.category} · {item.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">{JSON.stringify(item.value)}</span>
                <button onClick={() => updateSetting(item._id, { value: item.value })} className="px-2 py-1 rounded bg-slate-800 text-xs">Sync</button>
                <button onClick={() => deleteSetting(item._id)} className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

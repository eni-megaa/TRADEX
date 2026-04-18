import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTradingStore } from '../../store/tradingStore';
import { Plus, Edit2, Trash2, Search, Globe, Save, X, Power } from 'lucide-react';

export const AssetManagementPage = () => {
  const { assets, fetchAssets } = useTradingStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'Forex',
    base_price: '',
    is_enabled: true
  });

  useEffect(() => {
    const init = async () => {
      await fetchAssets();
      setLoading(false);
    };
    init();
  }, [fetchAssets]);

  const handleOpenModal = (asset: any = null) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name,
        symbol: asset.symbol,
        type: asset.type,
        base_price: asset.base_price.toString(),
        is_enabled: asset.is_enabled
      });
    } else {
      setEditingAsset(null);
      setFormData({
        name: '',
        symbol: '',
        type: 'Forex',
        base_price: '',
        is_enabled: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const assetData = {
      ...formData,
      base_price: Number(formData.base_price)
    };

    try {
      if (editingAsset) {
        await supabase.from('assets').update(assetData).eq('id', editingAsset.id);
      } else {
        await supabase.from('assets').insert([assetData]);
      }
      setIsModalOpen(false);
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const toggleAssetEnabled = async (asset: any) => {
    await supabase.from('assets').update({ is_enabled: !asset.is_enabled }).eq('id', asset.id);
    fetchAssets();
  };

  const deleteAsset = async (id: string) => {
    if (confirm('Are you sure you want to delete this asset? This may affect existing trades.')) {
      await supabase.from('assets').delete().eq('id', id);
      fetchAssets();
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Asset <span className="text-accent">Manager</span></h1>
            <p className="text-gray-500 font-medium">Configure trading pairs, base prices, and market availability.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Search assets..."
                className="pl-10 pr-4 py-3 bg-navy-light/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent w-full md:w-64 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-accent/20 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
                <span>Add New Asset</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
             <div className="col-span-full py-20 text-center text-gray-500">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 bg-navy-light/40 border border-white/5 rounded-3xl">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">No assets found matching your search.</p>
            </div>
        ) : filteredAssets.map((asset) => (
          <div key={asset.id} className={`bg-navy-light/40 border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all group relative overflow-hidden ${!asset.is_enabled ? 'opacity-60' : ''}`}>
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
                        asset.type === 'Crypto' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                        {asset.symbol[0]}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white group-hover:text-accent transition-colors">{asset.symbol}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{asset.type}</p>
                    </div>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => toggleAssetEnabled(asset)} className={`p-2 rounded-lg transition-all ${asset.is_enabled ? 'text-green-500 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/10'}`}>
                        <Power className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenModal(asset)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteAsset(asset.id!)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
             </div>
             
             <div className="space-y-4">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Base Price</span>
                    <span className="text-white font-mono font-bold">${(asset.base_price || asset.basePrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className={`font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-md ${asset.is_enabled ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {asset.is_enabled ? 'Available' : 'Disabled'}
                    </span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-xl">
          <div className="bg-navy-light border border-white/5 p-8 rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden">
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
             
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                {editingAsset ? 'Modify' : 'Register'} <span className="text-accent">Asset</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleSaveAsset} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Bitcoin"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Ticker Symbol</label>
                    <input 
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent font-mono"
                      value={formData.symbol}
                      onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                      placeholder="e.g. BTCUSDT"
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Asset Category</label>
                    <select 
                      className="w-full px-4 py-3 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent appearance-none"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Forex">Forex</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Commodities">Commodities</option>
                      <option value="Indices">Indices</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Starting Price (USD)</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      className="w-full px-4 py-3 bg-navy/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent font-mono"
                      value={formData.base_price}
                      onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-navy/50 rounded-2xl border border-white/5">
                <input 
                    type="checkbox"
                    id="is_enabled"
                    className="w-5 h-5 rounded-lg border-white/5 bg-navy focus:ring-accent accent-accent"
                    checked={formData.is_enabled}
                    onChange={(e) => setFormData({...formData, is_enabled: e.target.checked})}
                />
                <label htmlFor="is_enabled" className="text-sm font-bold text-gray-300">Enable trading for this asset immediately</label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="py-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-2xl transition-all">Cancel</button>
                  <button type="submit" className="py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-2xl shadow-lg shadow-accent/20 transition-all flex items-center justify-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>{editingAsset ? 'Update Asset' : 'Register Asset'}</span>
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

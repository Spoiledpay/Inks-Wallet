/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Send, 
  X,
  Terminal,
  Activity,
  History,
  Settings,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Cpu,
  Server,
  Zap,
  Globe,
  ChevronRight,
  MoreVertical,
  Plus,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  address: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  memo?: string;
}

interface NodeStatus {
  status: 'online' | 'offline';
  version: string;
  chainId: string;
  blockHeight: number;
  peers: number;
  nodeUrl?: string; // Added config support
}

// Sub-components
const LogsModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/node/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error('Failed to fetch logs', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="premium-card w-full max-w-4xl h-[600px] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Inks Node Real-time Logs</h3>
              <p className="text-xs text-slate-400 font-mono italic">Observando fluxos de dados do nó...</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>
        <div 
          ref={scrollRef}
          className="flex-1 bg-slate-950 p-6 overflow-y-auto font-mono text-sm leading-relaxed"
        >
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">Aguardando logs do sistema...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">
                <span className="text-emerald-500/50 mr-2">{i + 1}.</span>
                <span className="text-emerald-400">{log}</span>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
           <p className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             Atividade detectada em tempo real
           </p>
           <p>UTF-8 Encoding | Node Native Bridge</p>
        </div>
      </motion.div>
    </div>
  );
};

// Sub-components
const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-slate-900 text-white shadow-sm' 
        : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const TransactionCard: React.FC<{ tx: Transaction }> = ({ tx }) => (
  <div className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${
        tx.type === 'send' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-600'
      }`}>
        {tx.type === 'send' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-800">
          {tx.type === 'send' ? 'Enviado para' : 'Recebido de'} {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
        </div>
        <div className="text-[10px] text-slate-400">
          {tx.timestamp}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className={`text-xs font-bold ${
        tx.type === 'send' ? 'text-slate-800' : 'text-emerald-600'
      }`}>
        {tx.type === 'send' ? '-' : '+'}{tx.amount} INK
      </div>
      <div className={`text-[10px] lowercase font-bold tracking-wider ${
        tx.status === 'confirmed' ? 'text-emerald-500' : 'text-orange-500'
      }`}>
        {tx.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [balance, setBalance] = useState('1,250.45');
  const [address, setAddress] = useState('0x67a2...b84c');
  const [nodeInfo, setNodeInfo] = useState<NodeStatus | null>(null);
  const [isLoadingNode, setIsLoadingNode] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [newNodeUrl, setNewNodeUrl] = useState('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  
  const transactions: Transaction[] = [
    { id: '1', type: 'receive', amount: '500.00', address: '0x123...456', status: 'confirmed', timestamp: '2 hours ago' },
    { id: '2', type: 'send', amount: '25.00', address: '0x888...999', status: 'confirmed', timestamp: 'Yesterday', memo: 'Gas fee' },
    { id: '3', type: 'send', amount: '10.50', address: '0xabc...def', status: 'pending', timestamp: 'Just now' },
  ];

  const fetchNodeInfo = async () => {
    try {
      const res = await fetch('/api/health'); // Updated to use health info + rpc for details
      const healthData = await res.json();
      
      const rpcRes = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'node_info' })
      });
      const rpcData = await rpcRes.json();
      
      setNodeInfo({
        status: healthData.nodeRunning ? 'online' : 'offline',
        nodeUrl: healthData.config?.nodeApiUrl,
        ...rpcData
      });
      
      if (!newNodeUrl && healthData.config?.nodeApiUrl) {
        setNewNodeUrl(healthData.config.nodeApiUrl);
      }
    } catch (e) {
      console.error('Failed to fetch node info', e);
    }
  };

  const toggleNode = async () => {
    setIsLoadingNode(true);
    const endpoint = nodeInfo?.status === 'online' ? '/api/node/stop' : '/api/node/start';
    try {
      await fetch(endpoint, { method: 'POST' });
      await fetchNodeInfo();
    } catch (e) {
      console.error('Node action failed', e);
    } finally {
      setIsLoadingNode(false);
    }
  };

  const updateNodeUrl = async () => {
    setIsSavingUrl(true);
    try {
      await fetch('/api/node/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newNodeUrl })
      });
      await fetchNodeInfo();
      alert('Configuração de rede atualizada com sucesso.');
    } catch (e) {
      console.error('Failed to update node URL', e);
    } finally {
      setIsSavingUrl(false);
    }
  };

  useEffect(() => {
    fetchNodeInfo();
    const interval = setInterval(fetchNodeInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <LogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Zap className="text-white transform rotate-12" size={16} />
          </div>
          <span className="text-xl font-bold tracking-tight">INKS WALLET</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={Activity} label="Painel" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Server} label="Gerenciar Nó" active={activeTab === 'node'} onClick={() => setActiveTab('node')} />
          <SidebarItem icon={Terminal} label="Logs do Console" active={false} onClick={() => setIsLogsOpen(true)} />
          <SidebarItem icon={History} label="Histórico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <SidebarItem icon={Settings} label="Configurações" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-100 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local Node Status</span>
              <div className={`w-2 h-2 rounded-full ${nodeInfo?.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
            </div>
            <p className="text-sm font-semibold">{nodeInfo?.status === 'online' ? 'Synchronized' : 'Offline'}</p>
            <p className="text-[11px] text-slate-500">Block: {nodeInfo?.blockHeight?.toLocaleString() || '--'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">Current Address:</span>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
              <code className="text-xs font-mono">{address}</code>
              <button className="text-slate-400 hover:text-black transition-colors" onClick={() => { navigator.clipboard.writeText(address); alert('Endereço copiado!'); }}>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('send')} className="premium-button-primary">Enviar Ativos</button>
            <button className="premium-button-secondary">Receber</button>
          </div>
        </header>

        <div className="p-10 flex justify-center h-full overflow-y-auto">
          <div className="w-full max-w-6xl">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="view-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-8"
                >
                  {/* Column 1: Financials */}
                  <div className="flex-[1.5] space-y-8">
                  <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Available Balance</h3>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-bold tracking-tight">{balance}</span>
                       <span className="text-xl font-semibold text-slate-400">INKS</span>
                    </div>
                    <p className="text-emerald-600 font-medium text-sm mt-1">≈ $4,242.32 USD <span className="text-slate-400 ml-1">+2.4%</span></p>
                  </section>

                  <section className="premium-card p-6">
                    <h4 className="font-bold mb-4 text-sm">Native Assets</h4>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs">I</div>
                             <div>
                                <p className="font-bold text-sm">Inks Core</p>
                                <p className="text-xs text-slate-500">Native Token</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-sm">{balance}</p>
                             <p className="text-xs text-slate-400">$4,242.32</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between p-3 border border-transparent rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">G</div>
                             <div>
                                <p className="font-bold text-sm">InkGas</p>
                                <p className="text-xs text-slate-500">Utility Token</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="font-bold text-sm">4,200.00</p>
                             <p className="text-xs text-slate-400">$420.00</p>
                          </div>
                       </div>
                    </div>
                  </section>

                  {/* Fee Estimator Card */}
                  <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="font-medium text-slate-400 text-sm italic">Network Fee Estimator</h4>
                       <Zap size={16} className="text-slate-400" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <div className="border border-slate-700 p-3 rounded-lg bg-slate-800/50">
                          <p className="text-[10px] uppercase text-slate-500 font-bold">Fast</p>
                          <p className="text-sm font-bold">0.002 INK</p>
                          <p className="text-[10px] text-emerald-400">~ 12s</p>
                       </div>
                       <div className="border border-white/20 p-3 rounded-lg bg-white/10">
                          <p className="text-[10px] uppercase text-slate-300 font-bold">Normal</p>
                          <p className="text-sm font-bold">0.0008 INK</p>
                          <p className="text-[10px] text-slate-300">~ 45s</p>
                       </div>
                       <div className="border border-slate-700 p-3 rounded-lg bg-slate-800/50">
                          <p className="text-[10px] uppercase text-slate-500 font-bold">Slow</p>
                          <p className="text-sm font-bold">0.0002 INK</p>
                          <p className="text-[10px] text-slate-500">~ 3m</p>
                       </div>
                    </div>
                  </section>
                </div>

                {/* Column 2: Node & History */}
                <div className="flex-1 space-y-8">
                  <section className="premium-card p-6 h-auto min-h-[240px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                       <h4 className="font-bold text-sm">Local Node Management</h4>
                       <span className={`px-2 py-1 ${nodeInfo?.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'} text-[10px] font-bold rounded uppercase tracking-wide`}>
                         {nodeInfo?.status === 'online' ? 'Healthy' : 'Offline'}
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div>
                          <p className="text-xs text-slate-400 mb-1">Active Connections</p>
                          <p className="text-lg font-bold">{nodeInfo?.peers || 0} Peers</p>
                       </div>
                       <div>
                          <p className="text-xs text-slate-400 mb-1">Node Version</p>
                          <p className="text-lg font-bold">v{nodeInfo?.version || '--'}</p>
                       </div>
                       <div className="col-span-2 border-t border-slate-50 pt-4">
                          <p className="text-xs text-slate-400 mb-1">Sync Progress</p>
                          <p className="text-lg font-bold">{nodeInfo?.status === 'online' ? '100%' : '0%'}</p>
                       </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                       <button onClick={toggleNode} disabled={isLoadingNode} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
                         {isLoadingNode ? 'Wait...' : nodeInfo?.status === 'online' ? 'Stop Node' : 'Start Node'}
                       </button>
                       <button onClick={() => setIsLogsOpen(true)} className="flex-1 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Logs View</button>
                    </div>
                  </section>

                  <section className="premium-card p-6 flex-1 flex flex-col overflow-hidden min-h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="font-bold text-sm">Recent Transactions</h4>
                       <button onClick={() => setActiveTab('history')} className="text-xs text-blue-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-1 overflow-y-auto flex-1">
                       {transactions.map(tx => (
                         <TransactionCard key={tx.id} tx={tx} />
                       ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'node' && (
              <motion.div 
                key="view-node"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col gap-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                     <section className="premium-card p-8">
                        <div className="flex justify-between items-center mb-8">
                           <div>
                              <h2 className="text-2xl font-bold text-slate-900">Configuração do Nó</h2>
                              <p className="text-slate-500">Defina os parâmetros de conexão com a rede Inks.</p>
                           </div>
                           <div className={`px-4 py-2 rounded-full font-bold text-sm ${nodeInfo?.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                             {nodeInfo?.status === 'online' ? 'OPERACIONAL' : 'INOPERANTE'}
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="grid grid-cols-1 gap-4">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Node RPC API Endereço (IP:Porta)</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={newNodeUrl}
                                  onChange={(e) => setNewNodeUrl(e.target.value)}
                                  placeholder="http://127.0.0.1:8545" 
                                  className="premium-input flex-1 font-mono" 
                                />
                                <button 
                                  onClick={updateNodeUrl}
                                  disabled={isSavingUrl}
                                  className="bg-slate-900 text-white px-6 rounded-lg font-bold text-sm hover:shadow-lg transition-all"
                                >
                                  {isSavingUrl ? 'Salvando...' : 'Atualizar'}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 italic">O backend usará este endereço para toda a coordenação da blockchain Inks.</p>
                           </div>

                           <div className="pt-6 border-t border-slate-100">
                              <h4 className="font-bold text-sm mb-4">Administração de Sistema</h4>
                              <div className="grid grid-cols-2 gap-4">
                                 <button onClick={toggleNode} className="premium-button-secondary text-left flex-col items-start gap-1 h-auto py-4">
                                    <span className="font-bold">{nodeInfo?.status === 'online' ? 'Derrubar Nó' : 'Forçar Início'}</span>
                                    <span className="text-[10px] font-normal text-slate-400">Controle direto do binário local</span>
                                 </button>
                                 <button onClick={() => setIsLogsOpen(true)} className="premium-button-secondary text-left flex-col items-start gap-1 h-auto py-4">
                                    <span className="font-bold">Transmitir Logs</span>
                                    <span className="text-[10px] font-normal text-slate-400">Fluxo em tempo real do console</span>
                                 </button>
                              </div>
                           </div>
                        </div>
                     </section>

                     <section className="premium-card p-8 bg-slate-900 text-white">
                        <h4 className="font-bold mb-6 flex items-center gap-2">
                           <Shield size={18} className="text-emerald-400" />
                           Segurança Avançada de Nó
                        </h4>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Encryption Key</p>
                              <code className="text-emerald-400 text-xs">ED25519_AUTH_ACTIVE</code>
                           </div>
                           <div className="space-y-2">
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">P2P Encryption</p>
                              <code className="text-emerald-400 text-xs">AES-256-GCM-TUNNEL</code>
                           </div>
                        </div>
                     </section>
                  </div>

                  <div className="space-y-8">
                     <section className="premium-card p-6">
                        <h4 className="font-bold text-sm mb-4">Metadata da Blockchain</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between border-b border-slate-50 pb-2">
                              <span className="text-xs text-slate-400">Network ID</span>
                              <span className="text-xs font-mono font-bold">{nodeInfo?.chainId || 'inks-main-1'}</span>
                           </div>
                           <div className="flex justify-between border-b border-slate-50 pb-2">
                              <span className="text-xs text-slate-400">Protocolo</span>
                              <span className="text-xs font-bold">PoS Hybrid</span>
                           </div>
                           <div className="flex justify-between border-b border-slate-50 pb-2">
                              <span className="text-xs text-slate-400">Peers Conectados</span>
                              <span className="text-xs font-bold">{nodeInfo?.peers || 0} Ativos</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-xs text-slate-400">Uptime</span>
                              <span className="text-xs font-bold">99.98%</span>
                           </div>
                        </div>
                     </section>

                     <section className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="p-2 bg-emerald-500 rounded-lg text-white">
                              <Zap size={18} />
                           </div>
                           <h4 className="font-bold text-emerald-900 text-sm">Nó Sincronizado</h4>
                        </div>
                        <p className="text-xs text-emerald-700 leading-relaxed">
                           Seu nó está operando perfeitamente. As transações enviadas por esta carteira serão transmitidas instantaneamente para a rede global Inks.
                        </p>
                     </section>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'send' && (
              <motion.div 
                key="view-send"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-xl mx-auto w-full pt-10"
              >
                <div className="premium-card p-8 flex flex-col gap-6">
                   <h2 className="text-xl font-bold text-slate-900">Transferir Inks</h2>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço do Destinatário</label>
                        <input type="text" placeholder="0x..." className="premium-input w-full font-mono" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantia</label>
                          <input type="number" placeholder="0.00" className="premium-input w-full" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prioridade</label>
                          <select className="premium-input w-full appearance-none">
                            <option>Padrão</option>
                            <option>Rápido</option>
                          </select>
                        </div>
                      </div>
                      <button className="premium-button-primary w-full h-12 mt-4 text-sm font-bold uppercase tracking-widest">Enviar Transação</button>
                   </div>
                </div>
              </motion.div>
            )}

            {(activeTab === 'history' || activeTab === 'settings') && (
              <motion.div 
                key={`view-content-${activeTab}`}
                className="premium-card p-8 w-full h-[400px] flex flex-col items-center justify-center text-center gap-4"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                   <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 capitalize">Módulo {activeTab}</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Esta funcionalidade está sendo atualizada com dados do nó sincronizado.</p>
                </div>
                <button onClick={() => setActiveTab('dashboard')} className="premium-button-secondary">Voltar ao Painel</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  </div>
);
}

const Sphere = ({ size }: { size: number }) => (
  <div style={{ width: size, height: size }} className="bg-slate-200 rounded-full blur-3xl opacity-30"></div>
);

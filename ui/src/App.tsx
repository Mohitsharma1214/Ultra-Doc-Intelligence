import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  MessageSquare, 
  Search, 
  FileText, 
  CheckCircle2, 
  BrainCircuit, 
  ShieldCheck, 
  BarChart3,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/$/, "");

interface ExtractionData {
  shipment_id: string | null;
  shipper: string | null;
  consignee: string | null;
  pickup_datetime: string | null;
  delivery_datetime: string | null;
  equipment_type: string | null;
  mode: string | null;
  rate: string | null;
  currency: string | null;
  weight: string | null;
  carrier_name: string | null;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ text: string, confidence: number, sources: string[] } | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [activeTab, setActiveTab] = useState<'qa' | 'extract'>('qa');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData);
      setDocId(res.data.document_id);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!docId || !question) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await axios.post(`${API_BASE}/ask`, {
        document_id: docId,
        question: question
      });
      setAnswer({
        text: res.data.answer,
        confidence: res.data.confidence_score,
        sources: res.data.sources
      });
      setActiveTab('qa');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!docId) return;
    setLoading(true);
    setExtraction(null);
    try {
      const res = await axios.post(`${API_BASE}/extract`, {
        document_id: docId
      });
      setExtraction(res.data);
      setActiveTab('extract');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header / Hero */}
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
        >
          <div className="glass" style={{ padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={48} className="text-primary" style={{ color: 'var(--primary)' }} />
          </div>
        </motion.div>
        
        <motion.h1 
          className="title-gradient"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3.5rem', margin: '0 0 1rem 0', fontWeight: 800 }}
        >
          Ultra Doc-Intelligence
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}
        >
          Institutional-grade logistics intelligence. Grounded Q&A, structured extraction, and automated confidence scoring.
        </motion.p>
      </header>

      <div className="grid">
        {/* Sidebar: Config & Upload */}
        <aside>
          <motion.div 
            className="glass" 
            style={{ padding: '2rem', marginBottom: '2rem' }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
              <Upload size={18} color="var(--primary)" /> Document Load
            </h3>
            
            <div 
              style={{ 
                border: '2px dashed var(--glass-border)', 
                padding: '2.5rem 1.5rem', 
                textAlign: 'center',
                borderRadius: '16px',
                marginTop: '1.5rem',
                cursor: 'pointer',
                position: 'relative',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <input 
                type="file" 
                onChange={handleUpload}
                style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', cursor: 'pointer' }}
                accept=".pdf,.docx,.txt"
              />
              <FileText size={32} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {file ? file.name : "Drop logistics PDF/Docs"}
              </p>
              {docId && (
                <div className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', marginTop: '1rem', border: '1px solid var(--accent)' }}>
                  <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Vectorized
                </div>
              )}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={handleExtract}
                disabled={!docId || loading}
              >
                <Cpu size={18} /> Deep Extraction
              </button>
            </div>
          </motion.div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>System Guardrails</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} color="var(--accent)" /> Retrieval Grounding Enabled
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} color="var(--accent)" /> Confidence Threshold: 0.35
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} color="var(--accent)" /> Hallucination Filter active
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main>
          <div className="glass" style={{ padding: '2rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem', gap: '2rem' }}>
              <button 
                style={{ background: 'none', border: 'none', color: activeTab === 'qa' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', position: 'relative' }}
                onClick={() => setActiveTab('qa')}
              >
                Intelligent Q&A
                {activeTab === 'qa' && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', background: 'var(--primary)' }} />}
              </button>
              <button 
                style={{ background: 'none', border: 'none', color: activeTab === 'extract' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', position: 'relative' }}
                onClick={() => setActiveTab('extract')}
              >
                Structured Data
                {activeTab === 'extract' && <motion.div layoutId="tab" style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', background: 'var(--primary)' }} />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'qa' ? (
                <motion.div 
                  key="qa"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        className="input-field"
                        style={{ paddingLeft: '45px' }}
                        placeholder="Ex: What is the Pickup ID and Agreed Rate?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                      />
                    </div>
                    <button 
                      className="btn-primary" 
                      onClick={handleAsk}
                      disabled={!docId || loading}
                    >
                      {loading ? <div className="loader" /> : <ArrowRight size={20} />}
                    </button>
                  </div>

                  <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                    {answer && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Response</span>
                          <div className="badge" style={{ 
                            background: answer.confidence > 0.7 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            color: answer.confidence > 0.7 ? 'var(--accent)' : 'var(--danger)',
                            border: '1px solid currentColor'
                          }}>
                            Confidence: {(answer.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <p style={{ lineHeight: '1.7', color: '#e2e8f0', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                          {answer.text}
                        </p>
                        
                        <div style={{ marginTop: '2.5rem' }}>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <BarChart3 size={16} /> Source Citations
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {answer.sources.map((s, i) => (
                              <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '12px', borderLeft: '2px solid var(--primary)', background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0' }}>
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {!answer && !loading && (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)', opacity: 0.5 }}>
                        <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
                        <p>Ask a question to start the analysis</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="extract"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {extraction ? (
                      Object.entries(extraction).map(([key, val]) => (
                        <motion.div 
                          key={key} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass" 
                          style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}
                        >
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.1em' }}>{key.replace('_', ' ')}</div>
                          <div style={{ fontWeight: '600', color: val ? 'white' : 'var(--text-muted)' }}>{val || 'Not Detected'}</div>
                        </motion.div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)', opacity: 0.5 }}>
                        <Search size={48} style={{ marginBottom: '1rem' }} />
                        <p>Run Deep Extraction to see structured results</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;


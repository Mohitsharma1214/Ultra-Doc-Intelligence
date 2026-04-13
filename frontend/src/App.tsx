import React, { useState } from 'react';
import axios from 'axios';
import { Upload, MessageSquare, Search, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000";

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!docId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/extract`, {
        document_id: docId
      });
      setExtraction(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ultra Doc-Intelligence
        </motion.h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
          Interactively analyze and extract data from logistics documents with AI.
        </p>
      </header>

      <div className="grid">
        {/* Left Column: Upload & Settings */}
        <section>
          <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={20} /> Upload Document
            </h2>
            <div 
              style={{ 
                border: '2px dashed rgba(255,255,255,0.1)', 
                padding: '2rem', 
                textAlign: 'center',
                borderRadius: '12px',
                marginTop: '1.5rem',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <input 
                type="file" 
                onChange={handleUpload}
                style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', cursor: 'pointer' }}
                accept=".pdf,.docx,.txt"
              />
              <FileText size={40} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
              <p>{file ? file.name : "Drag & Drop or Click to browse"}</p>
              {docId && (
                <div style={{ color: 'var(--accent)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                  <CheckCircle2 size={16} /> Fully Processed
                </div>
              )}
            </div>
          </div>

          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={20} /> Actions
            </h2>
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleExtract}
              disabled={!docId || loading}
            >
              Run Structured Extraction
            </button>
          </div>
        </section>

        {/* Right Column: Interaction */}
        <section>
          <div className="glass" style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={20} /> Ask Document
            </h2>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
              <input 
                type="text" 
                className="glass"
                style={{ 
                  flex: 1, 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  padding: '12px', 
                  color: 'white',
                  borderRadius: '8px'
                }}
                placeholder="Ex: What is the freight charge?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              />
              <button 
                className="btn-primary" 
                onClick={handleAsk}
                disabled={!docId || loading}
              >
                Ask
              </button>
            </div>

            <div style={{ flex: 1, marginTop: '2rem', overflowY: 'auto' }}>
              <AnimatePresence mode="wait">
                {answer && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>Answer</h3>
                      <div style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem',
                        background: answer.confidence > 0.7 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: answer.confidence > 0.7 ? '#10b981' : '#ef4444',
                        border: '1px solid currentColor'
                      }}>
                        Confidence: {(answer.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <p style={{ lineHeight: '1.6', color: '#e2e8f0', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                      {answer.text}
                    </p>
                    
                    <h4 style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>Sources (Reference Context)</h4>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {answer.sources.map((s, i) => (
                        <div key={i} style={{ marginBottom: '10px', padding: '10px', borderLeft: '2px solid var(--primary)', background: 'rgba(255,255,255,0.02)' }}>
                          {s.length > 200 ? s.substring(0, 200) + "..." : s}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {extraction && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '2rem' }}
                  >
                    <h3>Structured Extraction</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1rem' }}>
                      {Object.entries(extraction).map(([key, val]) => (
                        <div key={key} className="glass" style={{ padding: '10px', background: 'rgba(255,255,255,0.02)' }}>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{key.replace('_', ' ')}</div>
                          <div style={{ fontWeight: '500' }}>{val || 'N/A'}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <div className="spinner">Processing...</div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;

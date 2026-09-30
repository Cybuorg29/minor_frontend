import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import { 
  Code2, Sparkles, Github, Search, 
  FolderOpen, FileCode, FileText, ChevronDown, 
  Bot, User, Info, Loader2, AlertCircle, Activity 
} from 'lucide-react';
import './index.css';

/**
 * Interface for the API response from the detector backend.
 * @typedef {Object} DetectionResult
 * @property {'AI' | 'Human'} prediction - The predicted author of the code.
 * @property {number} confidence - The confidence percentage (0-100).
 * @property {string} reason - The explainable AI reason for the prediction.
 */

function App() {
  const [code, setCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  /** @type {[DetectionResult | null, React.Dispatch<React.SetStateAction<DetectionResult | null>>]} */
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isAI = result?.prediction === 'AI';

  return (
    <div className="ide-layout">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="brand">
          <Sparkles color="#c084fc" size={24} />
          <span>NeuroDetect IDE</span>
        </div>
        
        <div className="github-input-group">
          <Github size={18} className="text-muted" style={{ marginLeft: '8px' }} />
          <input 
            type="text" 
            placeholder="Paste GitHub Repository URL to analyze entire repos (Coming Soon...)" 
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
          <button className="github-fetch-btn" title="Fetch Repository">
            <Search size={18} />
          </button>
        </div>

        <button 
          className="analyze-btn" 
          onClick={analyzeCode} 
          disabled={isAnalyzing || !code.trim()}
        >
          {isAnalyzing ? <Loader2 size={18} className="spinner" /> : <Activity size={18} />}
          Analyze Code
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="main-content">
        
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-title">Explorer</div>
          <div className="folder-item">
            <ChevronDown size={16} />
            <FolderOpen size={16} color="#fbbf24" />
            <span>mock-repo</span>
          </div>
          <div className="file-tree">
            <div className="file-item active pl-4">
              <FileCode size={16} color="#38bdf8" />
              <span>detector.py</span>
            </div>
            <div className="file-item pl-4">
              <FileText size={16} color="#94a3b8" />
              <span>README.md</span>
            </div>
          </div>
        </div>

        {/* EDITOR AREA */}
        <div className="editor-area">
          <div className="tabs">
            <div className="tab">
              <FileCode size={14} color="#38bdf8" />
              detector.py
            </div>
          </div>
          <div className="code-container">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
              padding={20}
              placeholder="# Paste or write code here to analyze..."
              style={{
                fontFamily: '"Fira Code", "Fira Mono", "Courier New", monospace',
                fontSize: 15,
                backgroundColor: 'transparent',
                minHeight: '100%'
              }}
            />
          </div>
        </div>

        {/* RESULT PANEL */}
        <div className="result-panel">
          <div className="panel-title">
            <Activity size={18} color="#8b5cf6" />
            Analysis Result
          </div>
          <div className="panel-content">
            
            {!result && !error && !isAnalyzing && (
              <div className="empty-state">
                <Bot size={48} opacity={0.5} />
                <p>Run analysis to detect AI generated patterns.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="empty-state">
                <Loader2 size={48} className="spinner" color="#8b5cf6" />
                <p>Analyzing Neural Patterns...</p>
              </div>
            )}

            {error && (
              <div className="empty-state text-error" style={{ color: '#ef4444' }}>
                <AlertCircle size={48} />
                <p>Server Connection Failed.<br/>Is port 8000 running?</p>
              </div>
            )}

            {result && !error && (
              <div className={`result-content ${isAI ? 'result-is-ai' : 'result-is-human'}`}>
                
                <div className="result-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>
                  {isAI ? <Bot size={32} /> : <User size={32} />}
                  {isAI ? 'AI Generated Code' : 'Human Authored Code'}
                </div>

                <div className="confidence-metric">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Confidence Score</span>
                    <span style={{ fontWeight: 600 }}>{typeof result.confidence === 'number' ? result.confidence.toFixed(1) : result.confidence}%</span>
                  </div>
                  <div className="confidence-bar-bg">
                    <div className="confidence-bar-fill" style={{ width: `${result.confidence}%` }}></div>
                  </div>
                </div>

                {result.reason && (
                  <div className="reason-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600 }}>
                      <Info size={18} />
                      Why?
                    </div>
                    {result.reason}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
        
      </div>
    </div>
  );
}

export default App;

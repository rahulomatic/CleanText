import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Shield, RotateCcw, Settings } from 'lucide-react';

interface FilterResult {
  originalText: string;
  censoredText: string;
  censoredWords: string[];
  censoredCount: number;
  wordCount: number;
}

const badWords = [
  'idiot', 'stupid', 'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'asshole',
  'bastard', 'crap', 'piss', 'moron', 'dumb', 'retard', 'gay', 'lame', 'suck',
  'hate', 'kill', 'die', 'murder', 'rape', 'sex', 'porn', 'nude', 'naked'
];

type CensorStyle = 'asterisk' | 'censored' | 'emoji';

const censorStyles = {
  asterisk: '****',
  censored: '[CENSORED]',
  emoji: '🤐'
};

function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<FilterResult | null>(null);
  const [censorStyle, setCensorStyle] = useState<CensorStyle>('censored');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const censorText = (text: string): FilterResult => {
    if (!text.trim()) {
      return {
        originalText: text,
        censoredText: text,
        censoredWords: [],
        censoredCount: 0,
        wordCount: 0
      };
    }

    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Create regex pattern with word boundaries
    const pattern = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi');
    const foundWords: string[] = [];
    
    // Find all matches
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      foundWords.push(match[0].toLowerCase());
    }
    
    // Replace with chosen style
    const replacement = censorStyles[censorStyle];
    const censoredText = text.replace(pattern, replacement);
    
    return {
      originalText: text,
      censoredText,
      censoredWords: [...new Set(foundWords)], // Remove duplicates
      censoredCount: foundWords.length,
      wordCount
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    // Simulate processing time for better UX
    setTimeout(() => {
      const filterResult = censorText(inputText);
      setResult(filterResult);
      setIsProcessing(false);
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'text/plain') {
      alert('Please upload a .txt file only');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const downloadCleanedText = () => {
    if (!result) return;
    
    const blob = new Blob([result.censoredText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setInputText('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const highlightCensoredWords = (text: string, originalText: string) => {
    if (!result || result.censoredWords.length === 0) return text;
    
    const replacement = censorStyles[censorStyle];
    let highlightedText = text;
    
    // Replace censored placeholders with highlighted versions
    const censoredPattern = new RegExp(
      replacement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
      'gi'
    );
    
    highlightedText = highlightedText.replace(
      censoredPattern, 
      `<mark class="bg-red-200 text-red-800 px-1 rounded">${replacement}</mark>`
    );
    
    return highlightedText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CleanText
                </h1>
                <p className="text-sm text-gray-600">Smart Profanity Filter</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Censoring Style</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(censorStyles).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setCensorStyle(key as CensorStyle)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    censorStyle === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {value} ({key})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Input Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="text-input" className="block text-lg font-semibold text-gray-700 mb-3">
                Enter Text to Filter
              </label>
              <textarea
                id="text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here or upload a file..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                <span>Words: {inputText.split(/\s+/).filter(w => w.length > 0).length}</span>
                <span>Characters: {inputText.length}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Upload .txt file</span>
                </label>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all flex items-center font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Filter Text
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-blue-600">{result.wordCount}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-red-600">{result.censoredCount}</div>
                <div className="text-sm text-gray-600">Words Censored</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-green-600">{result.censoredWords.length}</div>
                <div className="text-sm text-gray-600">Unique Bad Words</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((result.censoredCount / result.wordCount) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Filtered</div>
              </div>
            </div>

            {/* Original Text */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Original Text
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {result.wordCount} words
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {result.originalText}
                </p>
              </div>
            </div>

            {/* Filtered Text */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Filtered Text
                </h3>
                <button
                  onClick={downloadCleanedText}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
              <div className="bg-green-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p 
                  className="text-gray-700 whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightCensoredWords(result.censoredText, result.originalText)
                  }}
                />
              </div>
            </div>

            {/* Censored Words List */}
            {result.censoredWords.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Detected Bad Words ({result.censoredWords.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.censoredWords.map((word, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.censoredCount === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Text is Clean!</h3>
                <p className="text-green-600">No profanity or inappropriate content detected.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-gray-600">
            CleanText - Advanced text filtering with privacy-first processing. 
            <span className="text-sm block mt-1">Your text is processed locally and never sent to any server.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
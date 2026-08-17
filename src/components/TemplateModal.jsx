import React, { useState } from 'react';
import { X, Download, Upload, Save, Trash2, Check, Folder } from 'lucide-react';
import { loadSavedTemplates, saveTemplate, deleteTemplate, exportTemplateAsJSON } from '../utils/storage';
import { playBeep } from '../utils/audio';

export default function TemplateModal({ currentNodes, currentTotalSeconds, onLoadTemplate, onClose }) {
  const [templates, setTemplates] = useState(loadSavedTemplates());
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSelectTemplate = (tpl) => {
    onLoadTemplate(tpl);
    playBeep(650, 'sine', 0.12);
    onClose();
  };

  const handleSaveCurrent = () => {
    if (!newTemplateName.trim()) return;
    const newTpl = {
      id: `template-${Date.now()}`,
      name: newTemplateName.trim(),
      totalDurationMinutes: Math.floor(currentTotalSeconds / 60),
      createdAt: new Date().toISOString(),
      nodes: currentNodes
    };
    const updated = saveTemplate(newTpl);
    setTemplates(updated);
    setNewTemplateName('');
    setShowSaveInput(false);
    playBeep(800, 'sine', 0.15);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = deleteTemplate(id);
    setTemplates(updated);
    playBeep(350, 'sawtooth', 0.15);
  };

  const handleExport = (tpl, e) => {
    e.stopPropagation();
    exportTemplateAsJSON(tpl);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && parsed.nodes && Array.isArray(parsed.nodes)) {
          const importedTpl = {
            ...parsed,
            id: `imported-${Date.now()}`,
            name: parsed.name || '匯入的任務範本'
          };
          const updated = saveTemplate(importedTpl);
          setTemplates(updated);
          playBeep(750, 'sine', 0.15);
          alert('成功匯入任務範本！');
        } else {
          alert('JSON 格式無效：缺乏 nodes 陣列結構。');
        }
      } catch (err) {
        alert('解析 JSON 檔案失敗，請確認檔案內容格式。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(4, 3, 3, 0.92)',
      backdropFilter: 'blur(20px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--color-nerv-orange)',
        boxShadow: '0 0 30px rgba(255, 85, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-nerv-orange)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(20, 10, 5, 0.9)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Folder color="var(--color-nerv-amber)" size={24} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-family-display)', color: 'var(--color-nerv-amber)', letterSpacing: '1px' }}>
              [ WRO 戰術範本庫 ]
            </h2>
          </div>
          <button className="btn-glass" style={{ padding: '8px' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <label className="btn-glass btn-primary" style={{ cursor: 'pointer', fontSize: '0.82rem' }}>
              <Upload size={16} /> 匯入 JSON 戰術檔
              <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
            </label>

            {!showSaveInput ? (
              <button className="btn-glass btn-success" style={{ fontSize: '0.82rem' }} onClick={() => setShowSaveInput(true)}>
                <Save size={16} /> 儲存目前戰術為範本
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="輸入範本名稱"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    border: '1px solid var(--color-nerv-orange)',
                    color: '#fff',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-family-sans)'
                  }}
                />
                <button className="btn-glass btn-success" style={{ padding: '6px 12px' }} onClick={handleSaveCurrent}>
                  <Check size={16} />
                </button>
                <button className="btn-glass" style={{ padding: '6px 12px' }} onClick={() => setShowSaveInput(false)}>
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <hr style={{ border: 'none', height: '1px', background: 'var(--glass-border)', margin: '8px 0' }} />

          {/* Template List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className="glass-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderColor: 'var(--color-nerv-orange)',
                  background: 'rgba(20, 12, 5, 0.85)',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
                onClick={() => handleSelectTemplate(tpl)}
              >
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    {tpl.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'flex', gap: '12px', fontFamily: 'var(--font-family-mono)' }}>
                    <span>競賽總時間: {tpl.totalDurationMinutes || 60} 分鐘</span>
                    <span>任務數量: {tpl.nodes ? tpl.nodes.length : 0}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-glass"
                    style={{ padding: '8px' }}
                    title="匯出 JSON 檔案"
                    onClick={(e) => handleExport(tpl, e)}
                  >
                    <Download size={16} color="var(--color-nerv-amber)" />
                  </button>

                  <button
                    className="btn-glass btn-danger"
                    style={{ padding: '8px' }}
                    title="刪除範本"
                    onClick={(e) => handleDelete(tpl.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

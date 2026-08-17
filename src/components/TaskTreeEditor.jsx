import React, { useState, useCallback, memo, useMemo } from 'react';
import { X, Plus, Trash2, Save, Layers, ChevronDown, ChevronUp, Sliders, Copy, Clock, CheckCircle2 } from 'lucide-react';
import { playBeep } from '../utils/audio';

// Memoized Task Card Component inside the Editor Grid
const EditorTaskCard = memo(function EditorTaskCard({
  node,
  allNodes,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onDragStart,
  forceExpand,
  hoveredNodeId,
  setHoveredNodeId
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Use local state unless forceExpand is explicitly toggled by parent
  const expanded = forceExpand !== undefined ? forceExpand : isExpanded;

  const handleInputMouseDown = (e) => {
    e.stopPropagation();
  };

  const isTargetOfHovered = hoveredNodeId && (
    allNodes.find(n => n.id === hoveredNodeId)?.successNextId === node.id ||
    allNodes.find(n => n.id === hoveredNodeId)?.failNextId === node.id
  );
  const isSourceOfHovered = hoveredNodeId && (
    node.successNextId === hoveredNodeId || node.failNextId === hoveredNodeId
  );
  const isSelfHovered = hoveredNodeId === node.id;

  let cardBorder = '1px solid var(--color-nerv-orange)';
  let cardGlow = '0 0 12px rgba(255, 102, 0, 0.25)';

  if (isSelfHovered) {
    cardBorder = '1px solid var(--color-nerv-amber)';
    cardGlow = '0 0 20px rgba(255, 170, 0, 0.6)';
  } else if (isTargetOfHovered) {
    cardBorder = '2px solid var(--color-nerv-green)';
    cardGlow = '0 0 20px rgba(0, 255, 102, 0.5)';
  } else if (isSourceOfHovered) {
    cardBorder = '2px solid var(--color-nerv-cyan)';
    cardGlow = '0 0 20px rgba(0, 229, 255, 0.5)';
  }

  return (
    <div
      id={`editor-card-${node.id}`}
      draggable={!isInputFocused}
      onMouseEnter={() => setHoveredNodeId(node.id)}
      onMouseLeave={() => setHoveredNodeId(null)}
      onDragStart={(e) => {
        if (isInputFocused) {
          e.preventDefault();
          return;
        }
        onDragStart(e, node.id);
      }}
      className="glass-card"
      style={{
        padding: '10px 12px',
        cursor: isInputFocused ? 'default' : 'grab',
        background: 'rgba(20, 12, 5, 0.95)',
        border: cardBorder,
        boxShadow: cardGlow,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 4,
        willChange: 'transform',
        transition: 'all 0.2s ease',
        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
      }}
    >
      {/* Card Top Title & Duration Edit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
        <input
          type="text"
          value={node.name}
          onChange={(e) => onUpdateNode(node.id, 'name', e.target.value)}
          onMouseDown={handleInputMouseDown}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          placeholder="任務名稱"
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid var(--glass-border)',
            color: '#fff',
            padding: '5px 8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            flex: 1,
            minWidth: 0,
            cursor: 'text',
            fontFamily: 'var(--font-family-sans)'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <input
            type="text"
            inputMode="numeric"
            value={node.allocatedMinutes === '' ? '' : node.allocatedMinutes}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onUpdateNode(node.id, 'allocatedMinutes', '');
              } else {
                const parsed = parseInt(val, 10);
                onUpdateNode(node.id, 'allocatedMinutes', isNaN(parsed) ? '' : Math.max(0, parsed));
              }
            }}
            onMouseDown={handleInputMouseDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => {
              setIsInputFocused(false);
              if (node.allocatedMinutes === '' || isNaN(node.allocatedMinutes)) {
                onUpdateNode(node.id, 'allocatedMinutes', 0);
              }
            }}
            style={{
              width: '42px',
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid var(--color-nerv-orange)',
              color: 'var(--color-nerv-amber)',
              padding: '4px 4px',
              fontFamily: 'var(--font-family-mono)',
              fontSize: '0.8rem',
              textAlign: 'center',
              cursor: 'text'
            }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-family-mono)' }}>分</span>

          <button
            className="btn-glass"
            style={{ padding: '4px 6px', marginLeft: '2px', color: expanded ? 'var(--color-nerv-amber)' : 'var(--text-dim)' }}
            onMouseDown={handleInputMouseDown}
            onClick={() => setIsExpanded(!expanded)}
            title={expanded ? "收合說明與分支" : "展開說明與分支"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            className="btn-glass"
            style={{ padding: '4px 6px', color: 'var(--color-nerv-amber)' }}
            onMouseDown={handleInputMouseDown}
            onClick={() => onDuplicateNode(node.id)}
            title="複製此任務卡片"
          >
            <Copy size={13} />
          </button>

          <button
            className="btn-glass btn-danger"
            style={{ padding: '4px 6px' }}
            onMouseDown={handleInputMouseDown}
            onClick={() => onDeleteNode(node.id)}
            title="刪除任務卡片"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded Area: Description & Branch Connection Selectors */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(255,102,0,0.3)' }}>
          {/* Description Edit */}
          <textarea
            value={node.description || ''}
            onChange={(e) => onUpdateNode(node.id, 'description', e.target.value)}
            onMouseDown={handleInputMouseDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="任務說明（選填）"
            rows={3}
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid var(--glass-border)',
              color: '#fff3e6',
              padding: '6px 8px',
              fontSize: '0.78rem',
              resize: 'vertical',
              width: '100%',
              boxSizing: 'border-box',
              cursor: 'text'
            }}
          />

          {/* Branch Connections Selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
            {/* Success Branch Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
              <span style={{ color: 'var(--color-nerv-green)', fontWeight: 700, width: '80px', flexShrink: 0, fontFamily: 'var(--font-family-mono)' }}>
                ● 成功 (PASS):
              </span>
              <select
                value={node.successNextId || ''}
                onChange={(e) => onUpdateNode(node.id, 'successNextId', e.target.value || null)}
                onMouseDown={handleInputMouseDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: 0,
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(0, 255, 102, 0.4)',
                  color: '#fff',
                  padding: '3px 6px',
                  fontSize: '0.75rem',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-family-mono)'
                }}
              >
                <option value="">結束 (無分支)</option>
                {allNodes.filter(n => n.id !== node.id).map(target => (
                  <option key={target.id} value={target.id}>
                    [T{target.tier + 1}-C{target.column + 1}] {target.name.length > 16 ? target.name.slice(0, 16) + '...' : target.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fail Branch Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
              <span style={{ color: 'var(--color-nerv-red)', fontWeight: 700, width: '80px', flexShrink: 0, fontFamily: 'var(--font-family-mono)' }}>
                ● 失敗 (FAIL):
              </span>
              <select
                value={node.failNextId || ''}
                onChange={(e) => onUpdateNode(node.id, 'failNextId', e.target.value || null)}
                onMouseDown={handleInputMouseDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: 0,
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255, 0, 51, 0.4)',
                  color: '#fff',
                  padding: '3px 6px',
                  fontSize: '0.75rem',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-family-mono)'
                }}
              >
                <option value="">結束 (無分支)</option>
                {allNodes.filter(n => n.id !== node.id).map(target => (
                  <option key={target.id} value={target.id}>
                    [T{target.tier + 1}-C{target.column + 1}] {target.name.length > 16 ? target.name.slice(0, 16) + '...' : target.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default function TaskTreeEditor({ nodes, totalDurationMinutes = 60, onSaveNodes, onClose }) {
  const [editedNodes, setEditedNodes] = useState(() => {
    return JSON.parse(JSON.stringify(nodes)).map(n => ({
      ...n,
      column: n.column !== undefined ? n.column : 0
    }));
  });

  const [tierCount, setTierCount] = useState(() => {
    const maxT = Math.max(3, ...nodes.map(n => n.tier !== undefined ? n.tier : 0));
    return maxT + 1;
  });

  const [columnCount, setColumnCount] = useState(() => {
    const maxCol = Math.max(0, ...nodes.map(n => n.column !== undefined ? n.column : 0));
    return Math.min(5, Math.max(1, maxCol + 1));
  });

  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [globalExpanded, setGlobalExpanded] = useState(false);

  // Critical Path Analysis: Calculate continuous primary success path minutes
  const primaryPathMinutes = useMemo(() => {
    if (!editedNodes || editedNodes.length === 0) return 0;
    const roots = editedNodes.filter(n => !editedNodes.some(p => p.successNextId === n.id || p.failNextId === n.id));
    const startNode = roots.length > 0
      ? roots.reduce((min, n) => (n.tier < min.tier ? n : min), roots[0])
      : editedNodes[0];

    if (!startNode) return 0;

    let total = 0;
    let curr = startNode;
    const visited = new Set();

    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      const mins = parseInt(curr.allocatedMinutes, 10) || 0;
      total += mins;
      if (curr.successNextId) {
        curr = editedNodes.find(n => n.id === curr.successNextId);
      } else {
        break;
      }
    }
    return total;
  }, [editedNodes]);

  const currentMaxTier = Math.max(tierCount - 1, ...editedNodes.map(n => n.tier || 0));
  const effectiveTierCount = Math.max(tierCount, currentMaxTier + 1);
  const tiers = Array.from({ length: effectiveTierCount }, (_, i) => i);
  const columns = Array.from({ length: columnCount }, (_, i) => i);

  const handleAddTier = () => {
    setTierCount(prev => prev + 1);
    playBeep(700, 'sine', 0.1);
  };

  const handleInsertTier = (afterTierIndex) => {
    setEditedNodes(prev => prev.map(n => n.tier > afterTierIndex ? { ...n, tier: n.tier + 1 } : n));
    setTierCount(prev => prev + 1);
    playBeep(700, 'sine', 0.1);
  };

  const handleRemoveTier = (tierIndex) => {
    const nodesInTier = editedNodes.filter(n => n.tier === tierIndex);
    if (nodesInTier.length > 0) {
      const tierDisplayNum = (tierIndex + 1) < 10 ? `0${tierIndex + 1}` : tierIndex + 1;
      alert(`TIER ${tierDisplayNum} 仍有 ${nodesInTier.length} 個任務，請先移開卡片後再刪除！`);
      return;
    }
    if (effectiveTierCount > 1) {
      setEditedNodes(prev => prev.map(n => n.tier > tierIndex ? { ...n, tier: n.tier - 1 } : n));
      setTierCount(prev => Math.max(1, prev - 1));
      playBeep(400, 'sawtooth', 0.1);
    }
  };

  const handleAddColumn = () => {
    if (columnCount < 5) {
      setColumnCount(prev => prev + 1);
      playBeep(700, 'sine', 0.1);
    } else {
      alert('最多擴充至 5 個平行欄位！');
    }
  };

  const handleRemoveColumn = (colIndex) => {
    const nodesInCol = editedNodes.filter(n => n.column === colIndex);
    if (nodesInCol.length > 0) {
      alert(`欄位 ${colIndex + 1} 仍有 ${nodesInCol.length} 個任務，請先移開卡片後再刪除！`);
      return;
    }
    if (columnCount > 1) {
      setEditedNodes(prev => prev.map(n => n.column > colIndex ? { ...n, column: n.column - 1 } : n));
      setColumnCount(prev => prev - 1);
      playBeep(400, 'sawtooth', 0.1);
    }
  };

  const handleAddNode = useCallback((tier = 0, col = 0) => {
    const newId = `node-${Date.now()}`;
    const newNode = {
      id: newId,
      name: '新任務卡片',
      allocatedMinutes: 10,
      description: '',
      status: 'pending',
      tier: tier,
      column: col,
      successNextId: null,
      failNextId: null
    };
    setEditedNodes(prev => [...prev, newNode]);
    playBeep(750, 'sine', 0.12);
  }, []);

  const handleDuplicateNode = useCallback((id) => {
    const source = editedNodes.find(n => n.id === id);
    if (!source) return;
    const newId = `node-${Date.now()}`;
    const duplicate = {
      ...source,
      id: newId,
      name: `${source.name} (副本)`,
      status: 'pending'
    };
    setEditedNodes(prev => [...prev, duplicate]);
    playBeep(800, 'sine', 0.12);
  }, [editedNodes]);

  const handleDeleteNode = useCallback((id) => {
    setEditedNodes(prev => {
      return prev.filter(n => n.id !== id).map(n => ({
        ...n,
        successNextId: n.successNextId === id ? null : n.successNextId,
        failNextId: n.failNextId === id ? null : n.failNextId
      }));
    });
    playBeep(350, 'sawtooth', 0.15);
  }, []);

  const handleUpdateNode = useCallback((id, field, value) => {
    setEditedNodes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));
  }, []);

  const handleDragStart = useCallback((e, id) => {
    setDraggedNodeId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback((e, targetTier, targetCol) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData('text/plain') || draggedNodeId;
    if (!nodeId) return;

    setEditedNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, tier: targetTier, column: targetCol };
      }
      return n;
    }));

    setDraggedNodeId(null);
    playBeep(650, 'sine', 0.1);
  }, [draggedNodeId]);

  const handleSave = () => {
    const cleanedNodes = editedNodes.map(n => ({
      ...n,
      allocatedMinutes: n.allocatedMinutes === '' || isNaN(n.allocatedMinutes) ? 0 : parseInt(n.allocatedMinutes, 10)
    }));
    onSaveNodes(cleanedNodes);
    playBeep(850, 'sine', 0.15);
    onClose();
  };

  const marginMinutes = totalDurationMinutes - primaryPathMinutes;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(4, 3, 3, 0.95)',
      backdropFilter: 'blur(24px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1200px',
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--color-nerv-orange)',
        boxShadow: '0 0 30px rgba(255, 85, 0, 0.25)'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-nerv-orange)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(20, 10, 5, 0.9)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-family-display)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-nerv-amber)', letterSpacing: '1px' }}>
              <Layers size={20} color="var(--color-nerv-orange)" /> [ WRO 戰術流程編輯器 ]
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-family-mono)' }}>
              可自由拖拽任務卡至對應的階層列 (TIER) 與平行欄位。
            </p>
          </div>

          {/* Critical Path & Time Analysis Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(12, 8, 4, 0.85)',
            border: '1px solid var(--color-nerv-orange)',
            padding: '6px 14px',
            fontFamily: 'var(--font-family-mono)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-nerv-amber)' }}>
              <Clock size={15} />
              <span>主線預估耗時: <strong>{primaryPathMinutes}</strong> 分</span>
            </div>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <div style={{ color: marginMinutes >= 0 ? 'var(--color-nerv-green)' : 'var(--color-nerv-red)' }}>
              {marginMinutes >= 0 ? `寬裕剩餘: +${marginMinutes} 分` : `超標風險: ${marginMinutes} 分`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn-glass"
              style={{ padding: '8px 12px', fontSize: '0.82rem' }}
              onClick={() => setGlobalExpanded(!globalExpanded)}
            >
              <Sliders size={15} color="var(--color-nerv-amber)" /> {globalExpanded ? '精簡模式' : '展開完整細節'}
            </button>

            <button
              className="btn-glass"
              style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: 'var(--color-nerv-orange)' }}
              onClick={handleAddTier}
            >
              <Plus size={16} color="var(--color-nerv-amber)" /> 新增階層列 ({effectiveTierCount})
            </button>

            <button
              className="btn-glass"
              style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: 'var(--color-nerv-orange)' }}
              onClick={handleAddColumn}
              disabled={columnCount >= 5}
            >
              <Plus size={16} color="var(--color-nerv-amber)" /> 新增平行欄位 ({columnCount}/5)
            </button>

            <button
              className="btn-glass btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => handleAddNode(0, 0)}
            >
              <Plus size={16} /> 新增任務卡片
            </button>

            <button className="btn-glass" style={{ padding: '8px' }} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Grid Canvas */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
            padding: '24px',
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 85, 0, 0.08) 0%, rgba(4, 3, 3, 0.95) 100%)'
          }}
        >
          {/* Column Headers Container - Aligned with Grid Cells */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
            {/* Corner spacer for Tier column offset */}
            <div style={{ width: '88px', flexShrink: 0 }} />

            {columns.map(c => (
              <div
                key={`col-header-${c}`}
                style={{
                  flex: 1,
                  minWidth: '280px',
                  maxWidth: '340px',
                  background: 'rgba(30, 18, 8, 0.8)',
                  border: '1px solid var(--color-nerv-orange)',
                  padding: '8px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: 'var(--color-nerv-amber)',
                  fontFamily: 'var(--font-family-display)',
                  letterSpacing: '1px'
                }}
              >
                <span>[ 欄位 0{c + 1} - 平行路線 ]</span>
                {columnCount > 1 && (
                  <button
                    className="btn-glass"
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      color: 'var(--color-nerv-red)',
                      borderColor: 'rgba(255, 0, 51, 0.4)',
                      background: 'rgba(255, 0, 51, 0.15)'
                    }}
                    onClick={() => handleRemoveColumn(c)}
                    title="刪除此平行欄位"
                  >
                    <Trash2 size={12} /> 刪除欄
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Row (Tier) & Cell Grid Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tiers.map(t => {
              const displayTierNum = (t + 1) < 10 ? `0${t + 1}` : t + 1;
              return (
                <div key={`tier-row-${t}`} style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
                  {/* Row Header */}
                  <div style={{
                    width: '88px',
                    background: 'rgba(20, 12, 5, 0.9)',
                    border: '1px solid var(--color-nerv-orange)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: '10px 6px',
                    fontFamily: 'var(--font-family-display)'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-nerv-amber)', letterSpacing: '1px' }}>
                      TIER {displayTierNum}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px', fontFamily: 'var(--font-family-mono)' }}>
                      階段 {t + 1}
                    </span>

                    {/* Action buttons directly below TIER label */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px', width: '100%', alignItems: 'center' }}>
                      <button
                        className="btn-glass"
                        style={{
                          padding: '3px 4px',
                          fontSize: '0.65rem',
                          color: 'var(--color-nerv-amber)',
                          borderColor: 'var(--color-nerv-orange)',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                        onClick={() => handleInsertTier(t)}
                        title="在下方插入新的 TIER 列"
                      >
                        <Plus size={10} /> 插入列
                      </button>

                      {effectiveTierCount > 1 && (
                        <button
                          className="btn-glass"
                          style={{
                            padding: '3px 4px',
                            fontSize: '0.65rem',
                            color: 'var(--color-nerv-red)',
                            borderColor: 'rgba(255, 0, 51, 0.4)',
                            background: 'rgba(255, 0, 51, 0.15)',
                            width: '100%',
                            justifyContent: 'center'
                          }}
                          onClick={() => handleRemoveTier(t)}
                          title="刪除此 TIER 列"
                        >
                          <Trash2 size={10} /> 刪除列
                        </button>
                      )}
                    </div>
                  </div>

                {/* Grid Cells across Columns */}
                {columns.map(c => {
                  const cellNodes = editedNodes.filter(n => n.tier === t && n.column === c);

                  return (
                    <div
                      key={`cell-${t}-${c}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, t, c)}
                      style={{
                        flex: 1,
                        minWidth: '280px',
                        maxWidth: '340px',
                        minHeight: cellNodes.length > 0 ? 'auto' : '90px',
                        background: 'rgba(12, 8, 4, 0.5)',
                        border: '1px dashed rgba(255, 102, 0, 0.25)',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        position: 'relative',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      {cellNodes.length === 0 && (
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-dim)',
                          fontSize: '0.75rem',
                          gap: '6px',
                          pointerEvents: 'none',
                          padding: '8px 0',
                          fontFamily: 'var(--font-family-mono)'
                        }}>
                          <span>[ 可將任務卡片拖拽至此處 ]</span>
                          <button
                            className="btn-glass"
                            style={{ padding: '4px 10px', fontSize: '0.72rem', pointerEvents: 'auto' }}
                            onClick={() => handleAddNode(t, c)}
                          >
                            <Plus size={12} /> 在此新增
                          </button>
                        </div>
                      )}

                      {cellNodes.map(node => (
                        <EditorTaskCard
                          key={node.id}
                          node={node}
                          allNodes={editedNodes}
                          onUpdateNode={handleUpdateNode}
                          onDeleteNode={handleDeleteNode}
                          onDuplicateNode={handleDuplicateNode}
                          onDragStart={handleDragStart}
                          forceExpand={globalExpanded ? true : undefined}
                          hoveredNodeId={hoveredNodeId}
                          setHoveredNodeId={setHoveredNodeId}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
          </div>
        </div>

        {/* Footer Toolbar */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--color-nerv-orange)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          background: 'rgba(20, 10, 5, 0.9)'
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>
            系統說明：可拖拽卡片至不同階層與欄位，點擊卡片選單按鈕可展開設定說明與分支路徑。
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-glass" onClick={onClose}>[ 取消 ]</button>
            <button className="btn-glass btn-primary" onClick={handleSave}>
              <Save size={16} /> [ 儲存並套用 ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

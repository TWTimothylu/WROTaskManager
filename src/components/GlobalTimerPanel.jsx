import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ExternalLink, FolderOpen, Edit3, ShieldAlert, Award, Clock, Volume2, VolumeX, Keyboard, X } from 'lucide-react';
import { playBeep } from '../utils/audio';

export default function GlobalTimerPanel({
  globalSeconds,
  initialTotalSeconds,
  isRunning,
  onStart,
  onPause,
  onReset,
  onUpdateTotalDuration,
  onOpenPip,
  onOpenTemplates,
  onOpenTreeEditor,
  hasActivePip,
  isMuted,
  onToggleMute
}) {
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(Math.floor(initialTotalSeconds / 60));

  const formatTime = (totalSec) => {
    const isNeg = totalSec < 0;
    const abs = Math.abs(totalSec);
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (h > 0) {
      return `${isNeg ? '-' : ''}${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${isNeg ? '-' : ''}${pad(m)}:${pad(s)}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, ((initialTotalSeconds - globalSeconds) / initialTotalSeconds) * 100)
  );

  const handleApplyDuration = () => {
    const mins = parseInt(customMinutes, 10) || 0;
    onUpdateTotalDuration(mins * 60);
    setIsEditingDuration(false);
    playBeep(600, 'sine', 0.1);
  };

  return (
    <aside className="glass-panel" style={{
      width: 'var(--timeline-left-width)',
      height: 'calc(100vh - 32px)',
      margin: '16px',
      padding: '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px',
      zIndex: 20,
      flexShrink: 0
    }}>
      {/* App Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 85, 0, 0.1)',
              border: '1px solid rgba(255, 85, 0, 0.6)',
              boxShadow: '0 0 14px rgba(255, 85, 0, 0.35)',
              flexShrink: 0
            }}>
              <img src="./icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-family-display)', fontSize: '1.1rem', fontWeight: 900, letterSpacing: '1.2px', color: 'var(--color-nerv-amber)', textTransform: 'uppercase' }}>
                WRO 戰術系統
              </h1>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '1px', fontFamily: 'var(--font-family-mono)', textTransform: 'uppercase' }}>
                戰術監控儀表板
              </span>
            </div>
          </div>

          {/* Sound Mute Toggle */}
          <button
            className="btn-glass"
            style={{
              padding: '6px 8px',
              borderColor: isMuted ? 'var(--color-nerv-red)' : 'var(--glass-border)',
              color: isMuted ? 'var(--color-nerv-red)' : 'var(--color-nerv-amber)'
            }}
            onClick={onToggleMute}
            title={isMuted ? "音效已靜音 (點擊開啟)" : "音效開啟中 (點擊靜音)"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <hr style={{ border: 'none', height: '1px', background: 'var(--glass-border)', margin: '12px 0' }} />

        {/* Global Timer Box */}
        <div style={{
          background: 'rgba(12, 8, 4, 0.95)',
          border: '1px solid var(--color-nerv-orange)',
          boxShadow: '0 0 20px rgba(255, 85, 0, 0.2), inset 0 0 10px rgba(255, 85, 0, 0.1)',
          padding: '16px 14px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-nerv-amber)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'var(--font-family-display)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            <Clock size={14} color="var(--color-nerv-amber)" />
            [ 總剩餘時間 ]
          </div>

          <div className="display-time" style={{
            fontSize: '3.2rem',
            fontFamily: 'var(--font-family-digital)',
            fontWeight: 700,
            letterSpacing: '2px',
            color: globalSeconds < 300 ? 'var(--color-nerv-red)' : 'var(--color-nerv-amber)',
            textShadow: globalSeconds < 300 ? '0 0 25px rgba(255, 0, 51, 0.8)' : '0 0 20px rgba(255, 170, 0, 0.5)',
            margin: '2px 0'
          }}>
            {formatTime(globalSeconds)}
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 102, 0, 0.15)',
            marginTop: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 102, 0, 0.3)'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: globalSeconds < 300 ? 'linear-gradient(90deg, #ff0033, #ff5500)' : 'linear-gradient(90deg, #ff5500, #ffaa00)',
              boxShadow: '0 0 10px rgba(255, 170, 0, 0.8)',
              transition: 'width 0.5s ease'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-family-mono)' }}>
            <span>已消耗: {Math.floor(progressPercent)}%</span>
            <span>總時間: {Math.floor(initialTotalSeconds / 60)} 分鐘</span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {!isRunning ? (
            <button className="btn-glass btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} onClick={onStart}>
              <Play size={16} fill="currentColor" /> [ 開始計時 ]
            </button>
          ) : (
            <button className="btn-glass btn-danger" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} onClick={onPause}>
              <Pause size={16} fill="currentColor" /> [ 暫停計時 ]
            </button>
          )}

          <button className="btn-glass" title="重置計時器 (清空 Session)" style={{ padding: '10px' }} onClick={onReset}>
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Quick Set Duration */}
        <div style={{ marginTop: '12px' }}>
          {!isEditingDuration ? (
            <button
              className="btn-glass"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
              onClick={() => setIsEditingDuration(true)}
            >
              修改競賽時間 ({Math.floor(initialTotalSeconds / 60)} 分鐘)
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                inputMode="numeric"
                value={customMinutes === '' ? '' : customMinutes}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setCustomMinutes('');
                  } else {
                    const parsed = parseInt(val, 10);
                    setCustomMinutes(isNaN(parsed) ? '' : Math.max(0, parsed));
                  }
                }}
                onBlur={() => {
                  if (customMinutes === '' || isNaN(customMinutes)) {
                    setCustomMinutes(0);
                  }
                }}
                style={{
                  width: '70px',
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid var(--color-nerv-orange)',
                  color: '#fff',
                  padding: '5px 8px',
                  fontFamily: 'var(--font-family-mono)'
                }}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>分</span>
              <button className="btn-glass btn-success" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={handleApplyDuration}>
                套用
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-nerv-amber)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-family-display)' }}>
          [ 系統選單與工具 ]
        </div>

        <button
          className="btn-glass"
          style={{
            justifyContent: 'flex-start',
            borderColor: hasActivePip ? 'var(--color-nerv-amber)' : 'var(--glass-border)',
            background: hasActivePip ? 'rgba(255, 170, 0, 0.2)' : 'rgba(30, 18, 8, 0.8)'
          }}
          onClick={onOpenPip}
        >
          <ExternalLink size={16} color="var(--color-nerv-amber)" />
          {hasActivePip ? '懸浮視窗運作中' : '開啟懸浮視窗'}
        </button>

        <button className="btn-glass" style={{ justifyContent: 'flex-start' }} onClick={onOpenTemplates}>
          <FolderOpen size={16} color="var(--color-nerv-amber)" />
          戰術範本庫
        </button>

        <button className="btn-glass" style={{ justifyContent: 'flex-start' }} onClick={onOpenTreeEditor}>
          <Edit3 size={16} color="var(--color-nerv-green)" />
          編輯戰術流程樹
        </button>

        <button className="btn-glass" style={{ justifyContent: 'flex-start' }} onClick={() => setShowShortcutHelp(!showShortcutHelp)}>
          <Keyboard size={16} color="var(--color-nerv-cyan)" />
          鍵盤快捷鍵指南
        </button>
      </div>

      {/* System Badge */}
      <div style={{
        fontSize: '0.72rem',
        color: 'var(--color-nerv-amber)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(20, 10, 5, 0.9)',
        border: '1px solid rgba(255, 102, 0, 0.3)',
        padding: '8px 12px',
        fontFamily: 'var(--font-family-mono)'
      }}>
        <ShieldAlert size={14} color="var(--color-nerv-green)" />
        狀態: 系統正常 (斷電防護中)
      </div>

      {/* Shortcut Help Modal */}
      {showShortcutHelp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '24px',
            border: '1px solid var(--color-nerv-cyan)',
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-nerv-cyan)', fontFamily: 'var(--font-family-display)', fontWeight: 800 }}>
                <Keyboard size={18} /> [ 戰術全域快捷鍵 ]
              </div>
              <button className="btn-glass" style={{ padding: '6px' }} onClick={() => setShowShortcutHelp(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', fontFamily: 'var(--font-family-mono)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)' }}>開始 / 暫停總計時</span>
                <span style={{ background: 'rgba(255, 170, 0, 0.2)', padding: '3px 8px', border: '1px solid var(--color-nerv-amber)', color: 'var(--color-nerv-amber)', fontWeight: 700 }}>Space</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)' }}>當前焦點任務：達成主線 (成功)</span>
                <span style={{ background: 'rgba(0, 255, 102, 0.2)', padding: '3px 8px', border: '1px solid var(--color-nerv-green)', color: 'var(--color-nerv-green)', fontWeight: 700 }}>1 或 Y</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)' }}>當前焦點任務：執行備援 (失敗)</span>
                <span style={{ background: 'rgba(255, 0, 51, 0.2)', padding: '3px 8px', border: '1px solid var(--color-nerv-red)', color: 'var(--color-nerv-red)', fontWeight: 700 }}>2 或 N</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-main)' }}>視角平滑回彈居中 (Recenter)</span>
                <span style={{ background: 'rgba(0, 229, 255, 0.2)', padding: '3px 8px', border: '1px solid var(--color-nerv-cyan)', color: 'var(--color-nerv-cyan)', fontWeight: 700 }}>R</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--glass-border)', paddingTop: '10px' }}>
              提示：在表單或輸入框輸入文字時，全域快捷鍵會自動安全鎖定。
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

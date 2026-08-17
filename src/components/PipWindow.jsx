import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

function PipContent({
  globalSeconds,
  activeNodes,
  taskTimers,
  onCompleteSuccess,
  onCompleteFail,
  isRunning,
  onToggleRunning
}) {
  const formatTime = (sec) => {
    const isNeg = sec < 0;
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${isNeg ? '-' : ''}${pad(m)}:${pad(s)}`;
  };

  return (
    <div style={{
      padding: '14px',
      color: '#fff3e6',
      fontFamily: "'Chakra Petch', 'Zen Old Mincho', 'Noto Sans TC', sans-serif",
      background: '#040303',
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '10px'
    }}>
      {/* Header with Play/Pause and Global Timer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,102,0,0.35)',
        paddingBottom: '8px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#ffaa00', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Orbitron, sans-serif', fontWeight: 800 }}>
            [ WRO HUD ]
          </span>
          <button
            onClick={onToggleRunning}
            style={{
              background: isRunning ? 'rgba(255, 0, 51, 0.25)' : 'rgba(255, 170, 0, 0.25)',
              border: isRunning ? '1px solid #ff0033' : '1px solid #ffaa00',
              color: isRunning ? '#ff6677' : '#ffaa00',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.5px'
            }}
          >
            {isRunning ? '⏸ 暫停' : '▶ 開始'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#ffaa00', fontWeight: 700, letterSpacing: '1px' }}>
            總剩餘
          </span>
          <span className="display-time" style={{
            fontFamily: 'var(--font-family-digital), DS-Digital, Share Tech Mono, monospace',
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: globalSeconds < 300 ? '#ff0033' : '#ffaa00',
            textShadow: globalSeconds < 300 ? '0 0 15px rgba(255, 0, 51, 0.8)' : '0 0 15px rgba(255, 170, 0, 0.5)',
            lineHeight: 1
          }}>
            {formatTime(globalSeconds)}
          </span>
        </div>
      </div>

      {/* Active Task Info */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignItems: 'stretch',
        paddingBottom: '4px'
      }}>
        {activeNodes.length > 0 ? (
          activeNodes.map(node => (
            <div key={node.id} style={{
              background: 'rgba(20, 10, 5, 0.95)',
              border: '1px solid #ff5500',
              boxShadow: '0 0 15px rgba(255, 85, 0, 0.3)',
              padding: '12px',
              flex: activeNodes.length > 1 ? '0 0 280px' : '1',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.68rem', color: '#ffaa00', fontWeight: 700, marginBottom: '4px', fontFamily: 'Orbitron, sans-serif', letterSpacing: '1px' }}>
                    [ 當前執行任務 ]
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                    {node.name}
                  </div>
                  {node.description && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#d99b6c',
                      marginBottom: '4px',
                      borderLeft: '2px solid #ff5500',
                      paddingLeft: '6px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {node.description}
                    </div>
                  )}
                </div>

                {/* Right side: Task Timer */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0, paddingLeft: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#ffaa00', fontWeight: 700, letterSpacing: '1px', marginBottom: '2px' }}>
                    任務剩餘時間
                  </span>
                  <div className="display-time" style={{
                    fontSize: '2.4rem',
                    fontFamily: 'var(--font-family-digital), DS-Digital, Share Tech Mono, monospace',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    color: (taskTimers[node.id] || 0) < 0 ? '#ff0033' : '#ffaa00',
                    textShadow: (taskTimers[node.id] || 0) < 0 ? '0 0 15px rgba(255, 0, 51, 0.8)' : '0 0 15px rgba(255, 170, 0, 0.5)',
                    lineHeight: 1
                  }}>
                    {formatTime(taskTimers[node.id] !== undefined ? taskTimers[node.id] : node.allocatedMinutes * 60)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  style={{
                    flex: 1,
                    background: 'rgba(0, 255, 102, 0.2)',
                    border: '1px solid #00ff66',
                    color: '#00ff66',
                    padding: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '1px'
                  }}
                  onClick={() => {
                    const remSec = taskTimers[node.id] !== undefined ? taskTimers[node.id] : node.allocatedMinutes * 60;
                    onCompleteSuccess(node.id, remSec);
                  }}
                >
                  [ 達成主線 (成功) ]
                </button>
                <button
                  style={{
                    flex: 1,
                    background: 'rgba(255, 0, 51, 0.2)',
                    border: '1px solid #ff0033',
                    color: '#ff0033',
                    padding: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '1px'
                  }}
                  onClick={() => {
                    const remSec = taskTimers[node.id] !== undefined ? taskTimers[node.id] : node.allocatedMinutes * 60;
                    onCompleteFail(node.id, remSec);
                  }}
                >
                  [ 執行備援 (失敗) ]
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ flex: 1, padding: '20px', textAlign: 'center', color: '#805633', fontSize: '0.85rem', fontFamily: 'Share Tech Mono, monospace' }}>
            [ 無執行中任務 ]
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipWindow({
  isOpen,
  onClose,
  globalSeconds,
  activeNodes,
  taskTimers,
  onCompleteSuccess,
  onCompleteFail,
  isRunning,
  onToggleRunning
}) {
  const pipWindowRef = useRef(null);
  const pipRootRef = useRef(null);

  // Keep latest props in ref for render
  const propsRef = useRef({
    globalSeconds,
    activeNodes,
    taskTimers,
    onCompleteSuccess,
    onCompleteFail,
    isRunning,
    onToggleRunning
  });

  useEffect(() => {
    propsRef.current = {
      globalSeconds,
      activeNodes,
      taskTimers,
      onCompleteSuccess,
      onCompleteFail,
      isRunning,
      onToggleRunning
    };
  }, [globalSeconds, activeNodes, taskTimers, onCompleteSuccess, onCompleteFail, isRunning, onToggleRunning]);

  const renderPipContent = () => {
    if (pipRootRef.current) {
      pipRootRef.current.render(
        <PipContent
          globalSeconds={propsRef.current.globalSeconds}
          activeNodes={propsRef.current.activeNodes}
          taskTimers={propsRef.current.taskTimers}
          onCompleteSuccess={propsRef.current.onCompleteSuccess}
          onCompleteFail={propsRef.current.onCompleteFail}
          isRunning={propsRef.current.isRunning}
          onToggleRunning={propsRef.current.onToggleRunning}
        />
      );
    }
  };

  useEffect(() => {
    if (isOpen && 'documentPictureInPicture' in window) {
      const openPipWindow = async () => {
        try {
          const pipWin = await window.documentPictureInPicture.requestWindow({
            width: 480,
            height: 300
          });
          pipWindowRef.current = pipWin;

          const container = pipWin.document.createElement('div');
          pipWin.document.body.style.margin = '0';
          pipWin.document.body.style.background = '#040303';
          pipWin.document.body.appendChild(container);

          // Copy current document styles to PIP window
          [...document.styleSheets].forEach((styleSheet) => {
            try {
              const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
              const style = document.createElement('style');
              style.textContent = cssRules;
              pipWin.document.head.appendChild(style);
            } catch (e) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media;
              link.href = styleSheet.href;
              pipWin.document.head.appendChild(link);
            }
          });

          pipRootRef.current = createRoot(container);
          renderPipContent();

          pipWin.addEventListener('pagehide', () => {
            if (pipRootRef.current) {
              try {
                pipRootRef.current.unmount();
              } catch (e) {}
              pipRootRef.current = null;
            }
            onClose();
          });
        } catch (e) {
          console.error('Failed to open Document Picture-in-Picture window:', e);
          alert('開啟懸浮視窗失敗，請確認使用最新版 Chrome 瀏覽器。');
          onClose();
        }
      };

      openPipWindow();
    } else if (!isOpen && pipWindowRef.current) {
      if (pipRootRef.current) {
        try {
          pipRootRef.current.unmount();
        } catch (e) {}
        pipRootRef.current = null;
      }
      try {
        pipWindowRef.current.close();
      } catch (e) {}
      pipWindowRef.current = null;
    }

    return () => {
      if (pipRootRef.current) {
        try {
          pipRootRef.current.unmount();
        } catch (e) {}
        pipRootRef.current = null;
      }
      if (pipWindowRef.current) {
        try {
          pipWindowRef.current.close();
        } catch (e) {}
        pipWindowRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (pipRootRef.current) {
      renderPipContent();
    }
  }, [globalSeconds, activeNodes, taskTimers, onCompleteSuccess, onCompleteFail, isRunning, onToggleRunning]);

  return null;
}


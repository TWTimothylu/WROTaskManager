import React, { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 480, height: 280 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const formatTime = (sec) => {
    const isNeg = sec < 0;
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${isNeg ? '-' : ''}${pad(m)}:${pad(s)}`;
  };

  // Base reference window dimensions: 480 x 270
  const scaleW = size.width / 480;
  const scaleH = size.height / 270;
  const scale = Math.min(scaleW, scaleH);
  const effectiveScale = Math.max(0.4, Math.min(scale, 2.5));

  // Sizing helper based on scaling factor
  const s = (base, min = 0) => Math.max(min, Math.round(base * effectiveScale));
  const isTight = size.height < 210 || size.width < 340;

  return (
    <div
      ref={containerRef}
      style={{
        padding: `${s(10, 4)}px`,
        color: '#fff3e6',
        fontFamily: "'Chakra Petch', 'Zen Old Mincho', 'Noto Sans TC', sans-serif",
        background: '#040303',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: `${s(6, 2)}px`,
        overflow: 'hidden'
      }}
    >
      {/* Header with Play/Pause and Global Timer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,102,0,0.35)',
        paddingBottom: `${s(6, 2)}px`,
        gap: `${s(6, 2)}px`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${s(6, 2)}px`, minWidth: 0 }}>
          <img
            src="./icon.png"
            alt="WRO"
            style={{
              width: `${s(18, 12)}px`,
              height: `${s(18, 12)}px`,
              objectFit: 'contain',
              borderRadius: '3px',
              flexShrink: 0
            }}
          />
          <span style={{
            fontSize: `${s(12, 8)}px`,
            color: '#ffaa00',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 800,
            whiteSpace: 'nowrap'
          }}>
            [ WRO HUD ]
          </span>
          <button
            onClick={onToggleRunning}
            style={{
              background: isRunning ? 'rgba(255, 0, 51, 0.25)' : 'rgba(255, 170, 0, 0.25)',
              border: isRunning ? '1px solid #ff0033' : '1px solid #ffaa00',
              color: isRunning ? '#ff6677' : '#ffaa00',
              padding: `${s(3, 1)}px ${s(8, 4)}px`,
              fontSize: `${s(11, 8)}px`,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}
          >
            {isRunning ? '⏸ 暫停' : '▶ 開始'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: `${s(6, 2)}px`, flexShrink: 0 }}>
          <span style={{
            fontSize: `${s(11, 7)}px`,
            color: '#ffaa00',
            fontWeight: 700,
            letterSpacing: '1px',
            whiteSpace: 'nowrap'
          }}>
            總剩餘
          </span>
          <span className="display-time" style={{
            fontFamily: 'var(--font-family-digital), DS-Digital, Share Tech Mono, monospace',
            fontSize: `${s(30, 15)}px`,
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
        minHeight: 0,
        overflowX: activeNodes.length > 1 ? 'auto' : 'hidden',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        gap: `${s(8, 3)}px`,
        alignItems: 'stretch'
      }}>
        {activeNodes.length > 0 ? (
          activeNodes.map(node => (
            <div key={node.id} style={{
              background: 'rgba(20, 10, 5, 0.95)',
              border: '1px solid #ff5500',
              boxShadow: '0 0 15px rgba(255, 85, 0, 0.3)',
              padding: `${s(10, 4)}px`,
              flex: activeNodes.length > 1 ? `0 0 ${s(260, 140)}px` : '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: `${s(8, 4)}px`,
                flex: 1,
                minHeight: 0
              }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{
                    fontSize: `${s(10, 7)}px`,
                    color: '#ffaa00',
                    fontWeight: 700,
                    marginBottom: `${s(2, 1)}px`,
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '1px'
                  }}>
                    [ 當前執行任務 ]
                  </div>
                  <div style={{
                    fontSize: `${s(15, 9)}px`,
                    fontWeight: 800,
                    marginBottom: `${s(3, 1)}px`,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: '#fff'
                  }}>
                    {node.name}
                  </div>
                  {node.description && !isTight && (
                    <div style={{
                      fontSize: `${s(11, 7)}px`,
                      color: '#d99b6c',
                      borderLeft: '2px solid #ff5500',
                      paddingLeft: `${s(6, 2)}px`,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: `${s(36, 14)}px`,
                      overflowY: 'auto',
                      lineHeight: 1.2
                    }}>
                      {node.description}
                    </div>
                  )}
                </div>

                {/* Right side: Task Timer */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  flexShrink: 0,
                  paddingLeft: `${s(6, 2)}px`
                }}>
                  <span style={{
                    fontSize: `${s(11, 7)}px`,
                    color: '#ffaa00',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    marginBottom: `${s(2, 1)}px`,
                    whiteSpace: 'nowrap'
                  }}>
                    任務剩餘時間
                  </span>
                  <div className="display-time" style={{
                    fontSize: `${s(34, 16)}px`,
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

              <div style={{
                display: 'flex',
                gap: `${s(6, 3)}px`,
                marginTop: `${s(6, 2)}px`,
                flexShrink: 0
              }}>
                <button
                  style={{
                    flex: 1,
                    background: 'rgba(0, 255, 102, 0.2)',
                    border: '1px solid #00ff66',
                    color: '#00ff66',
                    padding: `${s(6, 2)}px ${s(6, 2)}px`,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: `${s(11, 7)}px`,
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
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
                    padding: `${s(6, 2)}px ${s(6, 2)}px`,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: `${s(11, 7)}px`,
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
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
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${s(10, 4)}px`,
            textAlign: 'center',
            color: '#805633',
            fontSize: `${s(13, 9)}px`,
            fontFamily: 'Share Tech Mono, monospace'
          }}>
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
          pipWin.document.documentElement.style.width = '100%';
          pipWin.document.documentElement.style.height = '100%';
          pipWin.document.documentElement.style.margin = '0';
          pipWin.document.documentElement.style.padding = '0';
          pipWin.document.documentElement.style.overflow = 'hidden';

          pipWin.document.body.style.width = '100%';
          pipWin.document.body.style.height = '100%';
          pipWin.document.body.style.margin = '0';
          pipWin.document.body.style.padding = '0';
          pipWin.document.body.style.overflow = 'hidden';
          pipWin.document.body.style.background = '#040303';

          container.style.width = '100%';
          container.style.height = '100%';
          container.style.boxSizing = 'border-box';
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


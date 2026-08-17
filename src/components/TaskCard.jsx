import React, { useEffect, memo } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Zap, Play, GitMerge } from 'lucide-react';
import { playOvertimeAlert, playSuccessSound, playFailSound } from '../utils/audio';

function TaskCard({
  node,
  isActive,
  isTicking = false,
  isPast,
  isFuture,
  taskSecondsRemaining,
  onCompleteSuccess,
  onCompleteFail,
  isParallel,
  isRunning,
  totalParentsCount = 0,
  completedParentsCount = 0
}) {
  const isOvertime = taskSecondsRemaining < 0;
  const isWaitingParents = isFuture && totalParentsCount > 1 && completedParentsCount < totalParentsCount;

  useEffect(() => {
    if ((isActive || isTicking) && isRunning && isOvertime && taskSecondsRemaining % 10 === 0) {
      playOvertimeAlert();
    }
  }, [isActive, isTicking, isRunning, isOvertime, taskSecondsRemaining]);

  const formatTaskTimer = (sec) => {
    const isNeg = sec < 0;
    const absSec = Math.abs(sec);
    const m = Math.floor(absSec / 60);
    const s = absSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${isNeg ? '-' : ''}${pad(m)}:${pad(s)}`;
  };

  // Styling calculation
  let cardBorder = '1px solid var(--glass-border)';
  let cardShadow = '0 0 10px rgba(255, 85, 0, 0.15)';
  let animationStyle = 'none';
  let opacityVal = 1;

  if (isPast) {
    opacityVal = 0.6;
    cardBorder = node.status === 'success'
      ? '1px solid var(--color-nerv-green)'
      : '1px solid var(--color-nerv-red)';
  } else if (isActive) {
    if (isOvertime) {
      animationStyle = 'flashRedBorder 1.2s infinite ease-in-out';
      cardBorder = '1px solid var(--color-nerv-red)';
      cardShadow = 'var(--glow-rose)';
    } else {
      animationStyle = isRunning ? 'pulseGlow 2s infinite ease-in-out' : 'none';
      cardBorder = '1px solid var(--color-nerv-amber)';
      cardShadow = 'var(--glow-cyan)';
    }
  } else if (isTicking) {
    opacityVal = 0.9;
    if (isOvertime) {
      animationStyle = 'flashRedBorder 1.5s infinite ease-in-out';
      cardBorder = '1px dashed var(--color-nerv-red)';
    } else {
      cardBorder = '1px dashed var(--color-nerv-orange)';
    }
  } else if (isFuture) {
    opacityVal = 0.85;
  }

  return (
    <div
      id={`task-node-${node.id}`}
      className="glass-card"
      style={{
        width: '100%',
        minHeight: '170px',
        padding: '18px 20px',
        position: 'relative',
        animation: animationStyle,
        border: cardBorder,
        boxShadow: cardShadow,
        opacity: opacityVal,
        background: isActive
          ? isOvertime ? 'rgba(60, 0, 10, 0.85)' : 'rgba(25, 14, 5, 0.95)'
          : isTicking ? 'rgba(20, 12, 6, 0.85)'
          : isPast ? 'rgba(12, 8, 4, 0.65)' : 'rgba(18, 12, 5, 0.85)',
        backdropFilter: 'blur(12px)',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
      }}
    >
      {/* Top Header Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isParallel && (
            <span style={{
              fontSize: '0.68rem',
              padding: '2px 8px',
              background: 'rgba(170, 0, 255, 0.25)',
              border: '1px solid var(--color-nerv-purple)',
              color: '#e0a0ff',
              fontWeight: 700,
              fontFamily: 'var(--font-family-display)',
              letterSpacing: '1px'
            }}>
              [ 平行測試路線 ]
            </span>
          )}

          <span style={{
            fontSize: '0.7rem',
            padding: '3px 10px',
            background: isActive
              ? isOvertime ? 'rgba(255, 0, 51, 0.35)' : 'rgba(255, 170, 0, 0.35)'
              : isTicking ? 'rgba(255, 136, 0, 0.2)' : 'rgba(255,255,255,0.06)',
            border: isActive
              ? isOvertime ? '1px solid var(--color-nerv-red)' : '1px solid var(--color-nerv-amber)'
              : isTicking ? '1px dashed var(--color-nerv-orange)' : '1px solid var(--glass-border)',
            color: isActive ? '#ffffff' : isTicking ? 'var(--color-nerv-amber)' : 'var(--text-dim)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-family-display)',
            letterSpacing: '1px'
          }}>
            {(isActive || isTicking) && (isRunning ? <Zap size={12} className="pulse" color="var(--color-nerv-amber)" /> : <Play size={12} />)}
            {isPast ? (node.status === 'success' ? '主線達成 (成功)' : '備援觸發 (失敗)')
              : (isActive ? (isRunning ? '狀態: 進行中' : '狀態: 就緒')
              : (isTicking ? (isRunning ? '狀態: 倒數中 (等待父任務)' : '狀態: 倒數中')
              : '狀態: 待命'))}
          </span>
        </div>

        {/* Task Timer Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={15} color={isOvertime ? 'var(--color-nerv-red)' : 'var(--color-nerv-amber)'} />
          <span className="display-time" style={{
            fontSize: (isActive || isTicking) ? '1.5rem' : '1.2rem',
            fontFamily: 'var(--font-family-digital)',
            fontWeight: 700,
            letterSpacing: '1px',
            color: isOvertime
              ? 'var(--color-nerv-red)'
              : (isActive || isTicking) ? 'var(--color-nerv-amber)' : 'var(--text-muted)'
          }}>
            {(isActive || isTicking || isPast) ? formatTaskTimer(taskSecondsRemaining) : `${node.allocatedMinutes} 分鐘`}
          </span>
        </div>
      </div>

      {/* Task Name & Description */}
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 800,
        fontFamily: 'var(--font-family-sans)',
        color: isPast ? 'var(--text-muted)' : 'var(--text-main)',
        marginBottom: '6px',
        lineHeight: 1.3,
        letterSpacing: '0.5px'
      }}>
        {node.name}
      </h3>

      {node.description && (
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          marginBottom: '16px',
          borderLeft: '2px solid var(--color-nerv-orange)',
          paddingLeft: '8px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {node.description}
        </p>
      )}

      {/* Overtime Alert Banner */}
      {isActive && isOvertime && (
        <div style={{
          background: 'rgba(255, 0, 51, 0.3)',
          border: '1px solid var(--color-nerv-red)',
          padding: '8px 12px',
          margin: '10px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          color: '#ffffff',
          fontFamily: 'var(--font-family-display)',
          letterSpacing: '1px'
        }}>
          <AlertTriangle size={16} color="var(--color-nerv-red)" />
          <span>[ 超時警報 ] 超時秒數將於完成後自動扣除。</span>
        </div>
      )}

      {/* Action Buttons for Active Node */}
      {isActive && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button
            className="btn-glass btn-success"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '10px' }}
            onClick={() => {
              playSuccessSound();
              onCompleteSuccess(node.id, taskSecondsRemaining);
            }}
          >
            <CheckCircle2 size={16} /> [ 達成主線 (成功) ]
          </button>

          <button
            className="btn-glass btn-danger"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '10px' }}
            onClick={() => {
              playFailSound();
              onCompleteFail(node.id, taskSecondsRemaining);
            }}
          >
            <XCircle size={16} /> [ 執行備援 (失敗) ]
          </button>
        </div>
      )}

      {/* Past Completed Status Indicator */}
      {isPast && (
        <div style={{
          marginTop: '10px',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-family-mono)',
          color: node.status === 'success' ? 'var(--color-nerv-green)' : 'var(--color-nerv-red)'
        }}>
          {node.status === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{node.status === 'success' ? '執行分支: 主線成功' : '執行分支: 備援路線'}</span>
        </div>
      )}
    </div>
  );
}

export default memo(TaskCard);

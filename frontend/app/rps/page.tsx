'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Hand = 'scissors' | 'rock' | 'paper';
type Mode = 'opponent' | 'me' | 'random';
type Side = 'me' | 'opponent';
type GamePhase = 'menu' | 'playing';
type RoundResult = 'success' | 'failure';

const HANDS: Hand[] = ['scissors', 'rock', 'paper'];

const KEY_TO_HAND: Record<string, Hand> = {
  ArrowLeft: 'scissors',
  ArrowDown: 'rock',
  ArrowRight: 'paper',
};

const MODE_LABELS: Record<Mode, string> = {
  opponent: '상대 선공',
  me: '나 선공',
  random: '랜덤',
};

const PROMPT_HINT: Record<Side, string> = {
  opponent: '상대가 냈습니다 → 이기는 손을 선택하세요',
  me: '내가 냈습니다 → 상대가 지는 손을 선택하세요',
};

const HAND_DISPLAY: Record<Hand, string> = {
  scissors: '✌️ 가위',
  rock: '✊ 바위',
  paper: '🖐 보',
};

function randomHand(exclude?: Hand | null): Hand {
  const pool = exclude ? HANDS.filter((hand) => hand !== exclude) : HANDS;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function winsAgainst(hand: Hand): Hand {
  const mapping: Record<Hand, Hand> = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock',
  };
  return mapping[hand];
}

function losesTo(hand: Hand): Hand {
  const mapping: Record<Hand, Hand> = {
    rock: 'paper',
    paper: 'scissors',
    scissors: 'rock',
  };
  return mapping[hand];
}

function beats(a: Hand, b: Hand): boolean {
  return winsAgainst(a) === b;
}

type PlayerPanelProps = {
  name: string;
  imageSrc: string;
  fallbackLabel: string;
  hand: Hand | null;
  isPrompt: boolean;
  imageError: boolean;
  onImageError: () => void;
};

function PlayerPanel({
  name,
  imageSrc,
  fallbackLabel,
  hand,
  isPrompt,
  imageError,
  onImageError,
}: PlayerPanelProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '28px 16px',
        borderRadius: '20px',
        border: `3px solid ${isPrompt ? '#fbbf24' : '#334155'}`,
        background: isPrompt ? 'rgba(251, 191, 36, 0.08)' : 'rgba(15, 23, 42, 0.6)',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}
      >
        {name}
      </div>
      <div
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '18px',
          overflow: 'hidden',
          background: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageError ? (
          <div
            style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              textAlign: 'center',
              padding: '12px',
            }}
          >
            {fallbackLabel}
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={name}
            width={160}
            height={160}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
            onError={onImageError}
            priority
          />
        )}
      </div>
      <div
        style={{
          fontSize: '1.8rem',
          fontWeight: 600,
          color: '#f1f5f9',
          minHeight: '2.5rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {hand ? HAND_DISPLAY[hand] : '❔'}
      </div>
    </div>
  );
}

export default function RpsPage() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu');
  const [mode, setMode] = useState<Mode | null>(null);
  const [promptSide, setPromptSide] = useState<Side | null>(null);
  const [promptHand, setPromptHand] = useState<Hand | null>(null);
  const [meHand, setMeHand] = useState<Hand | null>(null);
  const [opponentHand, setOpponentHand] = useState<Hand | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [pigImageError, setPigImageError] = useState(false);
  const [wolfImageError, setWolfImageError] = useState(false);
  const nextRoundTimerRef = useRef<number | null>(null);
  const previousPromptHandRef = useRef<Hand | null>(null);

  const clearNextRoundTimer = useCallback(() => {
    if (nextRoundTimerRef.current !== null) {
      window.clearTimeout(nextRoundTimerRef.current);
      nextRoundTimerRef.current = null;
    }
  }, []);

  const startRound = useCallback(
    (explicitMode?: Mode) => {
      const activeMode = explicitMode ?? mode;
      if (!activeMode) {
        return;
      }

      clearNextRoundTimer();

      const nextPromptSide: Side =
        activeMode === 'random'
          ? Math.random() < 0.5
            ? 'me'
            : 'opponent'
          : activeMode === 'me'
          ? 'me'
          : 'opponent';

      const nextPromptHand = randomHand(previousPromptHandRef.current);
      previousPromptHandRef.current = nextPromptHand;

      setPromptSide(nextPromptSide);
      setPromptHand(nextPromptHand);
      if (nextPromptSide === 'me') {
        setMeHand(nextPromptHand);
        setOpponentHand(null);
      } else {
        setOpponentHand(nextPromptHand);
        setMeHand(null);
      }
      setRoundResult(null);
    },
    [mode, clearNextRoundTimer]
  );

  const beginMode = useCallback(
    (nextMode: Mode) => {
      setMode(nextMode);
      setGamePhase('playing');
      previousPromptHandRef.current = null;
      startRound(nextMode);
    },
    [startRound]
  );

  const scheduleNextRound = useCallback(() => {
    clearNextRoundTimer();
    nextRoundTimerRef.current = window.setTimeout(() => {
      startRound();
    }, 200);
  }, [clearNextRoundTimer, startRound]);

  const handleHandSelection = useCallback(
    (hand: Hand) => {
      if (gamePhase !== 'playing' || !promptSide || roundResult) {
        return;
      }

      let isSuccess = false;

      if (promptSide === 'opponent') {
        if (!opponentHand) {
          return;
        }
        const expected = losesTo(opponentHand);
        isSuccess = hand === expected || beats(hand, opponentHand);
        setMeHand(hand);
      } else {
        if (!meHand) {
          return;
        }
        const expected = winsAgainst(meHand);
        isSuccess = hand === expected || beats(meHand, hand);
        setOpponentHand(hand);
      }

      setRoundResult(isSuccess ? 'success' : 'failure');
      if (isSuccess) {
        setSuccessCount((prev) => prev + 1);
      } else {
        setFailureCount((prev) => prev + 1);
      }

      scheduleNextRound();
    },
    [gamePhase, promptSide, roundResult, opponentHand, meHand, scheduleNextRound]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clearNextRoundTimer();
        setGamePhase('menu');
        setMode(null);
        setPromptSide(null);
        setPromptHand(null);
        setMeHand(null);
        setOpponentHand(null);
        setRoundResult(null);
        previousPromptHandRef.current = null;
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setSuccessCount(0);
        setFailureCount(0);
        return;
      }

      if (gamePhase !== 'playing') {
        return;
      }

      const mappedHand = KEY_TO_HAND[event.key];
      if (mappedHand) {
        event.preventDefault();
        handleHandSelection(mappedHand);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, roundResult, handleHandSelection, startRound, clearNextRoundTimer]);

  useEffect(() => {
    return () => {
      clearNextRoundTimer();
    };
  }, [clearNextRoundTimer]);

  const resultBanner = useMemo(() => {
    if (!roundResult) {
      return (
        <div
          style={{
            fontSize: '1rem',
            color: '#cbd5f5',
          }}
        >
          방향키로 손을 선택하세요 | Esc → 모드 선택 | R → 카운터 초기화
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: 'center',
        }}
        >
        <span
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: roundResult === 'success' ? '#4ade80' : '#f87171',
          }}
        >
          {roundResult === 'success' ? '성공' : '실패'}
        </span>
        <span style={{ fontSize: '1.1rem', color: '#cbd5f5' }}>다음 라운드로 이동합니다</span>
      </div>
    );
  }, [roundResult]);

  const expectedHandText = useMemo(() => {
    if (!promptSide || !promptHand || !roundResult) {
      return null;
    }

    const isOpponentPrompt = promptSide === 'opponent';
    const answerHand = isOpponentPrompt
      ? losesTo(promptHand)
      : winsAgainst(promptHand);
    const prefix = roundResult === 'success' ? '정답: ' : '정답은 ';
    const label = isOpponentPrompt ? '이기는 손' : '상대가 지는 손';
    return `${prefix}${label} ${HAND_DISPLAY[answerHand]}`;
  }, [promptSide, promptHand, roundResult]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #1f2937 0%, #0f172a 60%, #020617 100%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 24px',
        boxSizing: 'border-box',
        gap: '32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>가위 · 바위 · 보 훈련</div>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            fontSize: '1rem',
          }}
        >
          <span style={{ color: '#4ade80', fontWeight: 600 }}>성공: {successCount}</span>
          <span style={{ color: '#f87171', fontWeight: 600 }}>실패: {failureCount}</span>
        </div>
      </div>

      {gamePhase === 'menu' ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '2.2rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            모드를 선택하세요
          </div>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {(
              [
                {
                  mode: 'opponent' as Mode,
                  label: '상대 선공',
                  description: '상대가 먼저 내고, 나는 이기는 손을 키보드로 선택',
                },
                {
                  mode: 'me' as Mode,
                  label: '나 선공',
                  description: '내가 먼저 내고, 상대가 지도록 손을 선택',
                },
                {
                  mode: 'random' as Mode,
                  label: '랜덤',
                  description: '라운드마다 먼저 내는 쪽이 바뀌며 규칙을 그대로 따름',
                },
              ]
            ).map(({ mode: optionMode, label, description }) => (
              <button
                key={optionMode}
                type='button'
                onClick={() => beginMode(optionMode)}
                style={{
                  width: '220px',
                  padding: '24px 18px',
                  borderRadius: '18px',
                  border: '2px solid #2563eb',
                  background: '#1d4ed8',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 12px 30px rgba(37, 99, 235, 0.25)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseDown={(event) => {
                  const target = event.currentTarget;
                  target.style.transform = 'scale(0.97)';
                }}
                onMouseUp={(event) => {
                  const target = event.currentTarget;
                  target.style.transform = 'scale(1)';
                }}
                onMouseLeave={(event) => {
                  const target = event.currentTarget;
                  target.style.transform = 'scale(1)';
                }}
              >
                <div>{label}</div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 400,
                    marginTop: '8px',
                    color: '#e0e7ff',
                  }}
                >
                  {description}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              borderRadius: '16px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              backdropFilter: 'blur(6px)',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>모드: {mode ? MODE_LABELS[mode] : '---'}</div>
            <div style={{ fontSize: '1rem', color: '#dbeafe' }}>
              {promptSide ? PROMPT_HINT[promptSide] : '라운드 준비 중'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <PlayerPanel
              name='나 (Me)'
              imageSrc='/pig.webp'
              fallbackLabel='pig.webp'
              hand={meHand}
              isPrompt={promptSide === 'me'}
              imageError={pigImageError}
              onImageError={() => setPigImageError(true)}
            />
            <PlayerPanel
              name='상대 (Opponent)'
              imageSrc='/wolf.png'
              fallbackLabel='wolf.png'
              hand={opponentHand}
              isPrompt={promptSide === 'opponent'}
              imageError={wolfImageError}
              onImageError={() => setWolfImageError(true)}
            />
          </div>

          <div
            style={{
              padding: '22px 24px',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {expectedHandText && (
              <div style={{ color: '#e0f2fe', fontSize: '0.95rem' }}>{expectedHandText}</div>
            )}
            {resultBanner}
          </div>
        </div>
      )}
    </div>
  );
}

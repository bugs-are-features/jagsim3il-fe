import { todayApiDateKST, daysLeft, formatDate } from './date';

// 챌린지 status → 홈 카드 UI 설정
// preparing | active | ended (백엔드 Challenge.status)
export function getChallengeCardDisplay(challenge) {
  const status = challenge?.status ?? 'preparing';

  if (status === 'ended') {
    return {
      status: 'ended',
      badgeLabel: '종료',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-ink-faint',
      cardBg: 'bg-gray-50',
      cardBorder: 'border border-gray-200',
      titleClass: 'text-ink-muted',
      descClass: 'text-ink-faint',
      dateText:
        challenge?.startAt && challenge?.endAt
          ? `${formatDate(challenge.startAt)} ~ ${formatDate(challenge.endAt)}`
          : null,
      dateIconColor: '#D1D5DB',
      statusHint: '챌린지가 종료되었어요',
    };
  }

  if (status === 'active') {
    const left = challenge?.endAt ? daysLeft(challenge.endAt) : null;
    const badgeLabel =
      left == null ? '진행 중' : left >= 0 ? `D-${left}` : '종료';
    const isOver = left != null && left < 0;

    return {
      status: 'active',
      badgeLabel,
      badgeBg: isOver ? 'bg-gray-100' : 'bg-primary-light',
      badgeText: isOver ? 'text-ink-faint' : 'text-primary',
      cardBg: 'bg-white',
      cardBorder: 'border border-primary/10',
      titleClass: 'text-ink',
      descClass: 'text-ink-muted',
      dateText:
        challenge?.startAt && challenge?.endAt
          ? `${formatDate(challenge.startAt)} ~ ${formatDate(challenge.endAt)}`
          : challenge?.startAt
            ? `${formatDate(challenge.startAt)} ~`
            : null,
      dateIconColor: '#9CA3AF',
      statusHint: null,
    };
  }

  // preparing (기본)
  return {
    status: 'preparing',
    badgeLabel: '준비 중',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    cardBg: 'bg-white',
    cardBorder: 'border border-amber-100',
    titleClass: 'text-ink',
    descClass: 'text-ink-muted',
    dateText:
      challenge?.startAt && challenge?.endAt
        ? `${formatDate(challenge.startAt)} ~ ${formatDate(challenge.endAt)}`
        : null,
    dateIconColor: '#9CA3AF',
    statusHint: '방장이 시작 일정을 설정 중이에요',
  };
}

// 홈 목록 정렬: 종료된 챌린지는 하단으로 (나머지는 API 순서 유지)
export function sortChallengesForHome(challenges) {
  return [...challenges].sort((a, b) => {
    const aEnded = a?.status === 'ended' ? 1 : 0;
    const bEnded = b?.status === 'ended' ? 1 : 0;
    return aEnded - bEnded;
  });
}

// KST 기준 시작일 → 오늘까지 경과 일수 (시작 당일 = 0일차)
export function challengeDayKST(startAt) {
  if (!startAt) return null;
  const startStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(startAt));
  const todayStr = todayApiDateKST();
  const startMs = new Date(`${startStr}T00:00:00+09:00`).getTime();
  const todayMs = new Date(`${todayStr}T00:00:00+09:00`).getTime();
  const diff = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

// 일차별 조언/상태 문구 (필요 시 항목 추가)
const STATUS_BY_DAY = {
  0: {
    title: '챌린지가 시작되었습니다!',
    subtitle: '분명 목표를 이룰 수 있을거예요.',
  },
  1: {
    title: '좋은 시작이에요!',
    subtitle: '어제 이어 오늘도 약속을 지켜봐요.',
  },
  2: {
    title: '습관이 만들어지고 있어요',
    subtitle: '작은 성공이 쌓이면 목표에 더 가까워져요.',
  },
  3: {
    title: '벌써 3일째!',
    subtitle: '꾸준함이 실력이 되는 중이에요.',
  },
  7: {
    title: '1주일을 채웠어요!',
    subtitle: '지금까지 잘하고 있어요. 계속 가볼까요?',
  },
};

const DEFAULT_STATUS = {
  title: '오늘도 약속한 대로!',
  subtitle: '한 걸음씩 목표에 다가가고 있어요.',
};

export function getChallengeStatus(day) {
  if (day == null || day < 0) return null;
  const msg = STATUS_BY_DAY[day] ?? DEFAULT_STATUS;
  return { day, ...msg };
}

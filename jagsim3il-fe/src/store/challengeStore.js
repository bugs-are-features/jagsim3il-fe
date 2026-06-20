// 챌린지(Challenge) 상태관리 (zustand) — 실제 백엔드 연동
import { create } from 'zustand';
import { useAuthStore } from './authStore';
import {
  listChallenges,
  createChallenge,
  getChallenge,
  updateChallenge as updateChallengeApi,
  startChallenge as startChallengeApi,
  joinChallenge as joinChallengeApi,
  leaveChallenge as leaveChallengeApi,
  listMembers,
  listPromises,
  getMyPromise,
  upsertMyPromise,
} from '../api/challenges';
import { toApiDate, toApiTime } from '../utils/date';

// 현재 로그인 토큰
const tk = () => useAuthStore.getState().token;

export const useChallengeStore = create((set, get) => ({
  // state
  challenges: [],
  loading: false,
  refreshing: false,

  // 상세
  currentChallenge: null,
  members: [],
  myPromise: null, // 내 약속(목표). 없으면 아직 미입장(목표 미설정)
  detailLoading: false,

  // ── 홈: 목록 ─────────────────────────────────────────────
  loadChallenges: async (role = 'all') => {
    set({ loading: true });
    try {
      const challenges = await listChallenges(tk(), role);
      set({ challenges, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  refreshChallenges: async (role = 'all') => {
    set({ refreshing: true });
    try {
      const challenges = await listChallenges(tk(), role);
      set({ challenges, refreshing: false });
    } catch {
      set({ refreshing: false });
    }
  },

  // 생성: { title, description }
  addChallenge: async ({ title, description }) => {
    const newChallenge = await createChallenge(tk(), {
      title,
      desc: description ?? '',
    });
    if (newChallenge) {
      set((state) => ({ challenges: [newChallenge, ...state.challenges] }));
    }
    return newChallenge;
  },

  // 수정: { title?, description?, penalty? } → PATCH { title?, desc?, penalty_desc? }
  updateChallenge: async (chalId, { title, description, penalty } = {}) => {
    const patch = {};
    if (title != null) patch.title = title;
    if (description != null) patch.desc = description;
    if (penalty != null) patch.penalty_desc = penalty;
    const updated = await updateChallengeApi(tk(), chalId, patch);
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === chalId ? { ...c, ...updated } : c
      ),
      currentChallenge:
        state.currentChallenge?.id === chalId
          ? { ...state.currentChallenge, ...updated }
          : state.currentChallenge,
    }));
    return updated;
  },

  // 시작: Date 객체 두 개 → YYMMDD/HHMM 변환 후 POST /start
  startChallenge: async (chalId, startDate, endDate) => {
    await startChallengeApi(tk(), chalId, {
      start_dt: toApiDate(startDate),
      start_tm: toApiTime(startDate),
      end_dt: toApiDate(endDate),
      end_tm: toApiTime(endDate),
    });
  },

  // 가입(코드 입력): { joinCd, authCd? }
  joinByCode: async (chalId, joinCd, authCd) => {
    await joinChallengeApi(tk(), {
      chal_id: chalId,
      join_cd: joinCd,
      auth_cd: authCd || undefined,
    });
  },

  leaveChallenge: async (chalId) => {
    await leaveChallengeApi(tk(), chalId);
  },

  // ── 상세 ─────────────────────────────────────────────────
  loadChallengeDetail: async (chalId) => {
    set({ detailLoading: true });
    const token = tk();
    try {
      const [challenge, members, promises, myPromise] = await Promise.all([
        getChallenge(token, chalId),
        listMembers(token, chalId).catch(() => []),
        listPromises(token, chalId).catch(() => []),
        getMyPromise(token, chalId).catch(() => null),
      ]);
      // 약속(desc)을 멤버에 병합해 목표로 표시
      const byUser = {};
      promises.forEach((p) => {
        if (p?.userId) byUser[p.userId] = p;
      });
      const merged = members.map((m) => ({
        ...m,
        goal: m.goal || byUser[m.userId]?.desc || '',
      }));
      set({
        currentChallenge: challenge,
        members: merged,
        myPromise: myPromise?.desc ? myPromise : null,
        detailLoading: false,
      });
    } catch {
      set({ detailLoading: false });
    }
  },

  // 내 약속(목표) 생성/수정: desc + certDays({mon..sun})
  upsertPromise: async (chalId, desc, certDays) => {
    const promise = await upsertMyPromise(tk(), chalId, {
      desc,
      cert_days: certDays,
    });
    set({ myPromise: promise });
    return promise;
  },

  // 인증 미디어(로컬 전용): 백엔드에 미디어 업로드 엔드포인트가 없어
  // 현재는 화면 상태에만 반영한다(텍스트 인증 createCert와 별개).
  setMemberMedia: async (chalId, memberId, asset) => {
    const media = {
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'image',
    };
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, media } : m
      ),
    }));
  },
}));

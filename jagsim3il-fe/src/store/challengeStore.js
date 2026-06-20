// 방(Challenge) 상태관리 (zustand)
import { create } from 'zustand';
import { fetchChallenges, createChallenge, fetchChallengeDetail } from '../api/challenges';
import { submitGoal, uploadMedia } from '../api/members';

export const useChallengeStore = create((set, get) => ({
  // state
  challenges: [], // 홈 화면 방 리스트
  loading: false,
  refreshing: false,

  // 방 화면 상세 (현재 보고 있는 방)
  currentChallenge: null,
  members: [],
  detailLoading: false,

  // challengeId -> boolean : 해당 방에 이미 목표를 설정하고 입장했는지
  joinedChallenges: {},

  // ── 홈 화면 ──────────────────────────────────────────────
  loadChallenges: async () => {
    set({ loading: true });
    const challenges = await fetchChallenges();
    set({ challenges, loading: false });
  },

  refreshChallenges: async () => {
    set({ refreshing: true });
    const challenges = await fetchChallenges();
    set({ challenges, refreshing: false });
  },

  addChallenge: async (form) => {
    const newChallenge = await createChallenge(form);
    set((state) => ({ challenges: [newChallenge, ...state.challenges] }));
    return newChallenge;
  },

  // ── 방 상세 ──────────────────────────────────────────────
  loadChallengeDetail: async (challengeId) => {
    set({ detailLoading: true });
    const { challenge, members } = await fetchChallengeDetail(challengeId);
    set({ currentChallenge: challenge, members, detailLoading: false });
  },

  hasJoined: (challengeId) => !!get().joinedChallenges[challengeId],

  // 처음 입장: 목표 등록 후 입장 처리
  joinChallenge: async (challengeId, goal) => {
    const me = await submitGoal(challengeId, goal);
    set((state) => {
      // 이미 멤버 목록에 내가 있으면 목표만 갱신, 없으면 추가
      const exists = state.members.some((m) => m.userId === me.userId);
      const members = exists
        ? state.members.map((m) =>
            m.userId === me.userId ? { ...m, goal: me.goal } : m
          )
        : [me, ...state.members];
      return {
        members,
        joinedChallenges: { ...state.joinedChallenges, [challengeId]: true },
      };
    });
  },

  // 멤버 카드 미디어 업로드
  setMemberMedia: async (challengeId, memberId, asset) => {
    const { media } = await uploadMedia(challengeId, memberId, asset);
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, media } : m
      ),
    }));
  },
}));

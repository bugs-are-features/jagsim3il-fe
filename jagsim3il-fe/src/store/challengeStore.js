// 챌린지(Challenge) 상태관리 (zustand) — 실제 백엔드 연동
import { create } from 'zustand';
import { useAuthStore } from './authStore';
import {
  listChallenges,
  createChallenge,
  getChallenge,
  lookupChallenge,
  updateChallenge as updateChallengeApi,
  startChallenge as startChallengeApi,
  joinChallenge as joinChallengeApi,
  leaveChallenge as leaveChallengeApi,
  listMembers,
  listPromises,
  getMyPromise,
  upsertMyPromise,
  upsertJoinInfo,
  regenerateJoinCd,
  listAllCerts,
  getMyPenalty,
  createCert,
  updateCert as updateCertApi,
} from '../api/challenges';
import { toApiDate, toApiTime, todayApiDateKST } from '../utils/date';

// status가 preparing이 아니면 시작된(active/ended) 챌린지로 본다.
function isStarted(challenge) {
  return (
    !!challenge?.startedAt ||
    (!!challenge?.status && challenge.status !== 'preparing')
  );
}

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
  myPenalty: null, // 내 패널티 집계 { missedCount, uploadedCount, penaltyDesc } — 시작 후에만
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
    await updateChallengeApi(tk(), chalId, patch);
    // 변경한 필드만 로컬 상태에 반영한다.
    // PATCH 응답 전체로 덮어쓰면 joinCd/members/isOwner 등 응답에 없는 값이 사라진다.
    const localPatch = {};
    if (title != null) localPatch.title = title;
    if (description != null) localPatch.description = description;
    if (penalty != null) localPatch.penalty = penalty;
    set((state) => ({
      challenges: state.challenges.map((c) =>
        c.id === chalId ? { ...c, ...localPatch } : c
      ),
      currentChallenge:
        state.currentChallenge?.id === chalId
          ? { ...state.currentChallenge, ...localPatch }
          : state.currentChallenge,
    }));
    return localPatch;
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

  // 가입 전 조회(미리보기): join_cd로 비멤버가 챌린지 정보를 조회
  previewChallenge: async (chalId, joinCd) => {
    return getChallenge(tk(), chalId, joinCd);
  },

  // 가입 코드만으로 챌린지 미리보기 조회(chal_id 불필요).
  // 응답의 authYn으로 인증 코드 입력 필요 여부를 판단한다.
  lookupByCode: async (joinCd) => {
    return lookupChallenge(tk(), joinCd);
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

  // 가입 코드 설정(방장): { authYn: 'Y'|'N', authCd? } → 생성된 join_cd 반환
  setJoinInfo: async (chalId, { authYn, authCd }) => {
    const data = await upsertJoinInfo(tk(), chalId, {
      auth_yn: authYn,
      auth_cd: authYn === 'Y' ? authCd : undefined,
    });
    get()._mergeJoinCd(chalId, data?.join_cd);
    return data;
  },

  // 가입 코드 재발급(방장)
  regenerateJoinCode: async (chalId) => {
    const data = await regenerateJoinCd(tk(), chalId);
    get()._mergeJoinCd(chalId, data?.join_cd);
    return data;
  },

  // 가입 코드를 현재 챌린지 상태에 반영
  _mergeJoinCd: (chalId, joinCd) => {
    if (!joinCd) return;
    set((state) =>
      state.currentChallenge?.id === chalId
        ? { currentChallenge: { ...state.currentChallenge, joinCd } }
        : {}
    );
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
      // 약속(desc)을 멤버에 병합해 목표로 표시.
      // 멤버와 약속의 공통키는 로그인ID(member.loginId ↔ promise.loginId).
      const byUser = {};
      promises.forEach((p) => {
        if (p?.loginId != null) byUser[String(p.loginId)] = p;
      });
      const myLoginId = useAuthStore.getState().user?.username ?? null;
      let merged = members.map((m) => {
        const key = m.loginId != null ? String(m.loginId) : null;
        let goal = m.goal || (key && byUser[key]?.desc) || '';
        // 전체 약속 목록이 비어도 내 카드는 내 약속(/me)으로 채운다
        if (!goal && myLoginId && key === String(myLoginId) && myPromise?.desc) {
          goal = myPromise.desc;
        }
        return { ...m, goal, todayCert: null };
      });

      // 인증/패널티: 시작된(active/ended) 챌린지에서만 조회한다.
      // (preparing 상태는 패널티 API가 막혀 있고 인증도 불가)
      let myPenalty = null;
      if (isStarted(challenge)) {
        const today = todayApiDateKST();
        const [allCerts, penalty] = await Promise.all([
          listAllCerts(token, chalId, today, today).catch(() => []),
          getMyPenalty(token, chalId).catch(() => null),
        ]);
        // loginId → 오늘 인증
        const certByUser = {};
        allCerts.forEach((row) => {
          const key = row.member?.loginId != null ? String(row.member.loginId) : null;
          if (!key) return;
          certByUser[key] =
            row.certs.find((c) => c.certDate === today) ?? row.certs[0] ?? null;
        });
        merged = merged.map((m) => {
          const key = m.loginId != null ? String(m.loginId) : null;
          return { ...m, todayCert: key ? certByUser[key] ?? null : null };
        });
        myPenalty = penalty;
      }

      set({
        currentChallenge: challenge,
        members: merged,
        myPromise: myPromise?.desc ? myPromise : null,
        myPenalty,
        detailLoading: false,
      });
    } catch {
      set({ detailLoading: false });
    }
  },

  // 오늘 인증 생성/수정 (텍스트 메모, 1~500자)
  // 이미 오늘 uploaded 인증이 있으면 PATCH, 없으면 POST.
  submitCert: async (chalId, content) => {
    const today = todayApiDateKST();
    const myLoginId = useAuthStore.getState().user?.username ?? null;
    const me = get().members.find(
      (m) => myLoginId != null && String(m.loginId) === String(myLoginId)
    );
    const hasToday = me?.todayCert?.status === 'uploaded';
    if (hasToday) {
      await updateCertApi(tk(), chalId, today, content);
    } else {
      await createCert(tk(), chalId, content);
    }
    // 인증 상태/패널티 갱신을 위해 상세를 다시 불러온다.
    await get().loadChallengeDetail(chalId);
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
      width: asset.width ?? null,
      height: asset.height ?? null,
    };
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, media } : m
      ),
    }));
  },
}));

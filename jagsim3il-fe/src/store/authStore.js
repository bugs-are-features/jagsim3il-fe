// 인증 상태관리 (zustand)
import { create } from 'zustand';
import {
  loginRequest,
  signupRequest,
  getMeRequest,
  passwordReset as passwordResetRequest,
  logout as logoutRequest,
} from '../api/auth';

export const useAuthStore = create((set, get) => ({
  // state
  user: null, // 백엔드 /user/ 응답 사용자 객체
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // actions
  // 로그인: identifier(아이디 또는 이메일) + 비밀번호
  // 실패 시 false를 반환하고, 사유 메시지를 error에 담는다.
  login: async (identifier, pw) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await loginRequest({ identifier, pw });
      if (!token) throw new Error('로그인에 실패했습니다.');
      set({ user, token, isAuthenticated: true, loading: false });
      return true;
    } catch (e) {
      set({ error: e.message, loading: false });
      return false;
    }
  },

  // 회원가입: { id, pw, alias, email }
  // 가입 성공 후 이메일 인증이 필요하므로 자동 로그인하지 않는다.
  // 성공 시 true, 실패 시 false (error에 사유 메시지).
  signup: async (payload) => {
    set({ loading: true, error: null });
    try {
      await signupRequest(payload);
      set({ loading: false });
      return true;
    } catch (e) {
      set({ error: e.message, loading: false });
      return false;
    }
  },

  // 현재 토큰으로 회원 정보 재조회 (설정 화면 등에서 보강용)
  loadMe: async () => {
    const { token, user } = get();
    if (!token || user) return; // 토큰 없거나 이미 있으면 스킵
    try {
      const me = await getMeRequest(token);
      if (me) set({ user: me });
    } catch {
      // 조회 실패는 조용히 무시 (로그인 상태 자체는 유지)
    }
  },

  // 세션(토큰) 유효성 검사 + 회원 정보 갱신
  // GET /api/v1/user 가 401/403이면 토큰이 만료/무효이므로 로그아웃한다.
  // (네트워크 일시 오류 등 인증 외 실패는 로그인 상태를 유지한다.)
  validateSession: async () => {
    const { token, user } = get();
    if (!token) return;
    try {
      const me = await getMeRequest(token);
      if (me) {
        // /user 응답에는 email이 없으므로 로그인 시 보완해 둔 email은 보존
        set({ user: { ...me, email: me.email ?? user?.email ?? null } });
      }
    } catch (e) {
      if (e?.code === 401 || e?.code === 403) {
        get().logout(); // 세션 만료 → _layout guard가 로그인 화면으로 리다이렉트
      }
    }
  },

  // 비밀번호 재설정 메일 발송 요청
  // API: POST /api/v1/user/password-reset  body: { email }
  // 반환: { ok, message } — 실패 시 서버 응답 메시지를 그대로 전달.
  passwordReset: async (email) => {
    set({ error: null });
    try {
      await passwordResetRequest(email);
      return { ok: true, message: '비밀번호 재설정 메일을 발송하였습니다.' };
    } catch (e) {
      set({ error: e.message });
      return { ok: false, message: e.message };
    }
  },

  // 로그아웃: 서버에 무효화 요청을 보내되, 성공/실패와 무관하게
  // 로컬 세션은 항상 비운다(그래야 401/네트워크 오류에도 화면이 빠져나간다).
  logout: async () => {
    const { token } = get();
    let result = { ok: true, message: '로그아웃되었습니다.' };
    try {
      if (token) {
        const message = await logoutRequest(token);
        if (message) result = { ok: true, message };
      }
    } catch (e) {
      // 서버 로그아웃 실패해도 로컬 세션은 아래에서 정리한다.
      result = { ok: false, message: e.message };
    } finally {
      set({ user: null, token: null, isAuthenticated: false, error: null });
    }
    return result;
  },

  clearError: () => set({ error: null }),
}));

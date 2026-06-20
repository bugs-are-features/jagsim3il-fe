// 방(Room) 상태관리 (zustand)
import { create } from 'zustand';
import { fetchRooms, createRoom, fetchRoomDetail } from '../api/rooms';
import { submitGoal, uploadMedia } from '../api/members';

export const useRoomStore = create((set, get) => ({
  // state
  rooms: [], // 홈 화면 방 리스트
  loading: false,
  refreshing: false,

  // 방 화면 상세 (현재 보고 있는 방)
  currentRoom: null,
  members: [],
  detailLoading: false,

  // roomId -> boolean : 해당 방에 이미 목표를 설정하고 입장했는지
  joinedRooms: {},

  // ── 홈 화면 ──────────────────────────────────────────────
  loadRooms: async () => {
    set({ loading: true });
    const rooms = await fetchRooms();
    set({ rooms, loading: false });
  },

  refreshRooms: async () => {
    set({ refreshing: true });
    const rooms = await fetchRooms();
    set({ rooms, refreshing: false });
  },

  addRoom: async (form) => {
    const newRoom = await createRoom(form);
    set((state) => ({ rooms: [newRoom, ...state.rooms] }));
    return newRoom;
  },

  // ── 방 상세 ──────────────────────────────────────────────
  loadRoomDetail: async (roomId) => {
    set({ detailLoading: true });
    const { room, members } = await fetchRoomDetail(roomId);
    set({ currentRoom: room, members, detailLoading: false });
  },

  hasJoined: (roomId) => !!get().joinedRooms[roomId],

  // 처음 입장: 목표 등록 후 입장 처리
  joinRoom: async (roomId, goal) => {
    const me = await submitGoal(roomId, goal);
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
        joinedRooms: { ...state.joinedRooms, [roomId]: true },
      };
    });
  },

  // 멤버 카드 미디어 업로드
  setMemberMedia: async (roomId, memberId, asset) => {
    const { media } = await uploadMedia(roomId, memberId, asset);
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, media } : m
      ),
    }));
  },
}));

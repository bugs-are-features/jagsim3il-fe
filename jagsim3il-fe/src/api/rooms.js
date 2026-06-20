// 방(Room) 관련 API (Mock)
import { mockResponse } from './client';
import { mockRooms } from '../mocks/rooms';
import { mockRoomMembers } from '../mocks/members';
import { currentUser } from '../mocks/users';

// 참여 중인 방 리스트 조회
// 예상 API: GET /api/rooms (내가 참여 중인 방)
// response: Room[]
export async function fetchRooms() {
  return mockResponse(mockRooms);
}

// 방 생성
// 예상 API: POST /api/rooms
// request:  { startAt, endAt, penalty, title?, description? }
// response: Room
export async function createRoom({ title, description, startAt, endAt, penalty }) {
  const newRoom = {
    id: `r${Date.now()}`,
    title: title || '새로운 방',
    description: description || '함께 목표를 달성해요',
    startAt,
    endAt,
    penalty,
    memberCount: 1,
    members: [
      {
        id: currentUser.id,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
      },
    ],
  };
  return mockResponse(newRoom, 400);
}

// 방 상세 + 멤버 리스트 조회
// 예상 API: GET /api/rooms/:roomId
// response: { room: Room, members: RoomMember[] }
export async function fetchRoomDetail(roomId) {
  const room = mockRooms.find((r) => r.id === roomId) || mockRooms[0];
  const members = mockRoomMembers[roomId] || [];
  return mockResponse({ room, members });
}

// 방 멤버(목표/인증 미디어) 관련 API (Mock)
import { mockResponse } from './client';
import { currentUser } from '../mocks/users';

// 처음 입장 시 목표 등록(방 참여 등록)
// 예상 API: POST /api/rooms/:roomId/join
// request:  { goal }
// response: RoomMember
export async function submitGoal(roomId, goal) {
  const member = {
    id: `rm${Date.now()}`,
    userId: currentUser.id,
    nickname: currentUser.nickname,
    avatar: currentUser.avatar,
    goal,
    media: null,
  };
  return mockResponse(member, 400);
}

// 인증 이미지/동영상 업로드
// 예상 API: POST /api/rooms/:roomId/members/:memberId/media  (multipart/form-data)
// request:  FormData { file: { uri, name, type } }
// response: { media: { uri, type } }
//
// 실제 연동 시 expo-image-picker 결과(asset)를 FormData로 변환하는 예시는
// ARCHITECTURE.md "향후 실제 API 연동 시 가이드"를 참고하세요.
export async function uploadMedia(roomId, memberId, asset) {
  const media = {
    uri: asset.uri,
    type: asset.type === 'video' ? 'video' : 'image',
  };
  return mockResponse({ media }, 500);
}

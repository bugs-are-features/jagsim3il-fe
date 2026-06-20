// 방(Challenge) 관련 API (Mock)
import { mockResponse } from './client';
import { mockChallenges } from '../mocks/challenges';
import { mockChallengeMembers } from '../mocks/members';
import { currentUser } from '../mocks/users';

// 참여 중인 방 리스트 조회
// 예상 API: GET /api/challenges (내가 참여 중인 방)
// response: Challenge[]
export async function fetchChallenges() {
  return mockResponse(mockChallenges);
}

// 방 생성
// 예상 API: POST /api/challenges
// request:  { startAt, endAt, penalty, title?, description? }
// response: Challenge
export async function createChallenge({ title, description, startAt, endAt, penalty }) {
  const newChallenge = {
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
  return mockResponse(newChallenge, 400);
}

// 방 상세 + 멤버 리스트 조회
// 예상 API: GET /api/challenges/:challengeId
// response: { challenge: Challenge, members: ChallengeMember[] }
export async function fetchChallengeDetail(challengeId) {
  const challenge = mockChallenges.find((r) => r.id === challengeId) || mockChallenges[0];
  const members = mockChallengeMembers[challengeId] || [];
  return mockResponse({ challenge, members });
}

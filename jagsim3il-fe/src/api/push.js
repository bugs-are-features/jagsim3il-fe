// 푸시 토큰 등록/삭제 API
import { request } from './client';

// PUT /api/v1/user/push-token (Bearer 인증)
// body: { expo_push_token, device_id, platform: 'ios' | 'android' }
export async function registerPushTokenRequest(token, { expoPushToken, deviceId, platform }) {
  await request('PUT', '/api/v1/user/push-token', {
    token,
    body: {
      expo_push_token: expoPushToken,
      device_id: deviceId,
      platform,
    },
  });
  return true;
}

// DELETE /api/v1/user/push-token?expo_push_token=... (Bearer 인증)
export async function deletePushTokenRequest(token, expoPushToken) {
  await request('DELETE', '/api/v1/user/push-token', {
    token,
    params: { expo_push_token: expoPushToken },
  });
  return true;
}

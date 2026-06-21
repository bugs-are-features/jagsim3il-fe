import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { MediaUploader } from './MediaUploader';
import { isCertDayToday, todayWeekdayKeyKST } from '../src/utils/date';
import { AUTH_TP } from '../src/api/challenges';

const DAY_LABELS = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// 인증 타입 표시 메타
const TYPE_META = {
  [AUTH_TP.TEXT]: { icon: 'document-text-outline', label: '텍스트', kind: 'text' },
  [AUTH_TP.IMAGE]: { icon: 'image-outline', label: '사진', kind: 'image' },
  [AUTH_TP.VIDEO]: { icon: 'videocam-outline', label: '영상', kind: 'video' },
};

function formatCertDays(certDays) {
  if (!certDays) return '';
  const on = DAY_ORDER.filter((k) => certDays[k]);
  if (on.length === 0) return '';
  if (on.length === 7) return '매일 인증할께요';
  if (on.length === 2 && certDays.sat && certDays.sun) return '주말마다 인증할께요';
  if (on.length === 5 && ['mon', 'tue', 'wed', 'thu', 'fri'].every((k) => certDays[k])) {
    return '평일마다 인증할께요';
  }
  return `${on.map((k) => DAY_LABELS[k]).join(',')}마다 인증할께요`;
}

function CertStatsRow({ stats }) {
  if (!stats) return null;
  return (
    <View className="flex-row rounded-xl bg-gray-50 px-3 py-2.5">
      <View className="flex-1 flex-row items-center">
        <Ionicons name="checkmark-circle-outline" size={16} color="#FF6A3D" />
        <Text className="font-gowunDodum ml-1.5 text-sm text-ink">
          인증 <Text className="font-bold text-primary">{stats.uploadedCount ?? 0}</Text>회
        </Text>
      </View>
      <View className="flex-1 flex-row items-center">
        <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
        <Text className="font-gowunDodum ml-1.5 text-sm text-ink">
          미인증 <Text className="font-bold text-red-500">{stats.missedCount ?? 0}</Text>회
        </Text>
      </View>
    </View>
  );
}

// 인증 타입별 라벨 헤더 (아이콘 + 이름 + 필수/제출 표시)
function CertTypeHeader({ authTp, required, submitted }) {
  const meta = TYPE_META[authTp];
  if (!meta) return null;
  return (
    <View className="mb-1.5 flex-row items-center">
      <Ionicons name={meta.icon} size={14} color="#FF6A3D" />
      <Text className="font-gowunDodum ml-1 text-sm font-semibold text-ink">{meta.label} 인증</Text>
      {required ? (
        <View className="ml-1.5 rounded-full bg-red-50 px-1.5 py-0.5">
          <Text className="text-[10px] font-semibold text-red-500">필수</Text>
        </View>
      ) : (
        <View className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5">
          <Text className="text-[10px] font-semibold text-ink-faint">선택</Text>
        </View>
      )}
      {submitted ? (
        <Ionicons name="checkmark-circle" size={14} color="#FF6A3D" style={{ marginLeft: 6 }} />
      ) : null}
    </View>
  );
}

// 인증 타입별 입력/미리보기 블록
function CertTypeBlock({ authTp, required, cert, editable, isMe, onWriteText, onPickMedia }) {
  const meta = TYPE_META[authTp];
  if (!meta) return null;

  // 텍스트 인증
  if (meta.kind === 'text') {
    const text = cert?.text;
    return (
      <View className="mt-3">
        <CertTypeHeader authTp={authTp} required={required} submitted={!!text} />
        {text ? (
          <View className="rounded-xl border border-primary/30 bg-primary-light/30 px-3 py-2.5">
            <Text className="font-gowunDodum text-sm leading-5 text-ink">
              {text.content || '인증 완료'}
            </Text>
            {editable ? (
              <Pressable onPress={onWriteText} hitSlop={8} className="mt-1.5 flex-row items-center self-start">
                <Ionicons name="pencil" size={13} color="#FF6A3D" />
                <Text className="ml-1 text-xs font-semibold text-primary">인증 수정</Text>
              </Pressable>
            ) : null}
          </View>
        ) : editable ? (
          <Pressable
            onPress={onWriteText}
            className="flex-row items-center justify-center rounded-xl border border-dashed border-primary/40 bg-primary-light/40 py-3"
          >
            <Ionicons name="create-outline" size={18} color="#FF6A3D" />
            <Text className="font-gowunDodum ml-1.5 text-md font-semibold text-primary">
              텍스트 인증하기
            </Text>
          </Pressable>
        ) : (
          <View className="flex-row items-center rounded-xl bg-gray-50 px-3 py-2.5">
            <Ionicons name="hourglass-outline" size={16} color="#9CA3AF" />
            <Text className="font-gowunDodum ml-1.5 text-sm text-ink-faint">인증 대기 중</Text>
          </View>
        )}
      </View>
    );
  }

  // 이미지/비디오 인증
  const part = meta.kind === 'video' ? cert?.video : cert?.image;
  const media = part?.url
    ? { uri: part.url, type: meta.kind === 'video' ? 'video' : 'image', remote: true }
    : null;
  return (
    <View className="mt-3">
      <CertTypeHeader authTp={authTp} required={required} submitted={!!media} />
      <MediaUploader
        media={media}
        editable={editable}
        kind={meta.kind}
        onPicked={(asset) => onPickMedia?.(asset)}
      />
    </View>
  );
}

export function MemberCard({
  member,
  isMe,
  onPickMedia,
  started = false,
  status = 'preparing',
  authSet,
  onWriteCert,
  canEditPromise = false,
  onEditPromise,
  onShowHistory,
}) {
  const cert = member.todayCert;
  const uploaded = cert?.status === 'uploaded';
  const isActive = status === 'active';
  const certDaysLabel = formatCertDays(member.certDays);
  const todayKey = todayWeekdayKeyKST();
  const isCertDay = isCertDayToday(member.certDays, todayKey);
  const stats = member.certStats;

  // 인증 방식: 설정이 없으면 텍스트 기본값으로 폴백
  const types =
    Array.isArray(authSet) && authSet.length
      ? authSet
      : [{ authTp: AUTH_TP.TEXT, required: false }];

  // 내 카드 · 진행 중 · 인증 요일이면 입력 가능
  const editable = isMe && isActive && isCertDay;

  const cardBody = (
    <>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Avatar
            uri={member.avatar}
            nickname={member.nickname}
            id={member.loginId ?? member.id}
            size={20}
          />
          <Text className="font-gowunDodum ml-1.5 text-lg text-ink-faint" numberOfLines={1}>
            {member.nickname}
            {isMe ? ' (나)' : ''}
          </Text>
        </View>
        {isMe && canEditPromise ? (
          <Pressable
            onPress={() => onEditPromise?.()}
            hitSlop={8}
            className="flex-row items-center rounded-full bg-primary-light px-2.5 py-1"
          >
            <Ionicons name="pencil" size={13} color="#FF6A3D" />
            <Text className="ml-1 text-xs font-semibold text-primary">약속 수정</Text>
          </Pressable>
        ) : started && uploaded && isCertDay ? (
          <View className="flex-row items-center rounded-full bg-primary-light px-2 py-0.5">
            <Ionicons name="checkmark-circle" size={14} color="#FF6A3D" />
            <Text className="ml-1 text-xs font-semibold text-primary">오늘 인증 완료</Text>
          </View>
        ) : null}
      </View>

      {member.goal?.trim() ? (
        <Text className="font-jua mt-1.5 text-lg font-semibold leading-5 text-ink" numberOfLines={3}>
          {member.goal}
        </Text>
      ) : (
        <Text className="font-jua mt-3 text-lg font-semibold leading-5 text-gray-400">
          목표 설정 중
        </Text>
      )}

      {!started && certDaysLabel ? (
        <View className="mt-1.5 flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#FF6A3D" />
          <Text className="font-gowunDodum ml-1 text-sm font-semibold text-primary">
            {certDaysLabel}
          </Text>
        </View>
      ) : null}

      {started ? (
        !isCertDay ? (
          // 오늘 인증 요일 아님 — 인증 입력 없이 집계만 표시
          <View className="mt-2">
            <View className="mb-2 flex-row items-center">
              <Ionicons name="cafe-outline" size={16} color="#9CA3AF" />
              <Text className="font-gowunDodum ml-1.5 text-sm text-ink-faint">
                {isMe ? '오늘은 인증 요일이 아니에요' : '오늘은 인증 요일이 아님'}
              </Text>
            </View>
            <CertStatsRow stats={stats} />
          </View>
        ) : (
          // 인증 요일 — 인증 방식별 입력/미리보기
          <View>
            {types.map((t) => (
              <CertTypeBlock
                key={t.authTp}
                authTp={t.authTp}
                required={t.required}
                cert={cert}
                editable={editable}
                isMe={isMe}
                onWriteText={() => onWriteCert?.(member)}
                onPickMedia={(asset) => onPickMedia?.(member.id, asset)}
              />
            ))}
          </View>
        )
      ) : null}

      {started ? (
        <Text className="font-gowunDodum mt-3 text-center text-xs text-ink-faint">
          탭하여 인증 내역 보기
        </Text>
      ) : null}
    </>
  );

  const cardStyle = {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  };

  if (started && onShowHistory) {
    return (
      <Pressable
        onPress={() => onShowHistory(member)}
        className="w-full rounded-2xl bg-white p-3 active:opacity-90"
        style={cardStyle}
      >
        {cardBody}
      </Pressable>
    );
  }

  return (
    <View className="w-full rounded-2xl bg-white p-3" style={cardStyle}>
      {cardBody}
    </View>
  );
}

import {
  StyleSheet, View, Text, Pressable, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { Brand } from '@/constants/Colors';
import { Avatar } from '@/components/ui/Avatar';
import { useSchedule } from '@/constants/ScheduleContext';

const currentUser = '김강래';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTimeStr(): string {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h >= 12 ? '오후' : '오전'} ${h > 12 ? h - 12 : h}:${m}`;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderColor: string;
  text?: string;
  imageUri?: string;
  time: string;
  isMe: boolean;
  isSystem?: boolean;
}

// 데모 메시지 생성
function getDemoMessages(roomName: string): ChatMessage[] {
  const isWorship = roomName.includes('예배');
  const isPart = roomName.includes('파트');

  const base: ChatMessage[] = [
    {
      id: 'sys-1', sender: '', senderColor: '', time: '',
      text: `${roomName} 채팅방이 생성되었습니다.`,
      isMe: false, isSystem: true,
    },
  ];

  if (isWorship) {
    return [
      ...base,
      { id: '1', sender: '최이삭', senderColor: '#43B89C', text: '이번주 셋리스트 올라왔나요?', time: '오전 9:12', isMe: false },
      { id: '2', sender: currentUser, senderColor: Brand.primary, text: '네 방금 올렸습니다! 확인해주세요', time: '오전 9:15', isMe: true },
      { id: '3', sender: '소유진', senderColor: '#0984E3', text: '확인했어요 👍', time: '오전 9:20', isMe: false },
      { id: '4', sender: '이승완', senderColor: '#E84393', text: '리허설 몇시인가요?', time: '오전 9:22', isMe: false },
      { id: '5', sender: currentUser, senderColor: Brand.primary, text: '토요일 오후 3시에 만나요!', time: '오전 9:25', isMe: true },
      { id: '6', sender: '최이삭', senderColor: '#43B89C', text: '넵 알겠습니다~', time: '오전 9:26', isMe: false },
      { id: '7', sender: '소유진', senderColor: '#0984E3', text: '사운드체크 일찍 해야 할 것 같은데 2시 반은 어때요?', time: '오전 10:05', isMe: false },
      { id: '8', sender: currentUser, senderColor: Brand.primary, text: '좋아요 그러면 2시 반으로 할게요', time: '오전 10:08', isMe: true },
      { id: '9', sender: '이승완', senderColor: '#E84393', text: '저도 ㅇㅋ', time: '오전 10:10', isMe: false },
    ];
  }

  if (isPart) {
    return [
      ...base,
      { id: '1', sender: '최기현', senderColor: '#5A52D5', text: '다음주 순서 확인 부탁드려요', time: '오후 1:00', isMe: false },
      { id: '2', sender: currentUser, senderColor: Brand.primary, text: '넵 확인했습니다', time: '오후 1:05', isMe: true },
      { id: '3', sender: '심재원', senderColor: '#A5A0FF', text: '저 10일은 불가예요 ㅠ', time: '오후 2:10', isMe: false },
      { id: '4', sender: currentUser, senderColor: Brand.primary, text: '네 반영할게요!', time: '오후 2:12', isMe: true },
      { id: '5', sender: '임한', senderColor: '#7B73FF', text: '이번주 곡 키가 어떻게 되나요?', time: '오후 3:30', isMe: false },
      { id: '6', sender: currentUser, senderColor: Brand.primary, text: '첫번째 곡 G, 두번째 곡 A 입니다', time: '오후 3:33', isMe: true },
    ];
  }

  // 전체 공지방
  return [
    ...base,
    { id: '1', sender: currentUser, senderColor: Brand.primary, text: '이번 주 셋리스트 확인해주세요!', time: '오후 3:20', isMe: true },
    { id: '2', sender: '정병혁', senderColor: '#FF6584', text: '확인했습니다 🙏', time: '오후 3:22', isMe: false },
    { id: '3', sender: '소유진', senderColor: '#0984E3', text: '넵!', time: '오후 3:24', isMe: false },
  ];
}

export default function ChatRoomScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const roomName = name || '채팅';
  const roomId = (id as string) || '';
  const isWorshipRoom = roomId.startsWith('worship-');

  const { checkIn, isCheckedIn, getAttendanceEntry, setMeetingTime, getMeetingTime } = useSchedule();
  const contextChecked = isCheckedIn(currentUser, roomId);
  const [localChecked, setLocalChecked] = useState(false);
  const isChecked = contextChecked || localChecked;
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(9);
  const [pickerMin, setPickerMin] = useState(0);

  const meetingTime = getMeetingTime(roomId);
  const meetingTimeStr = meetingTime != null
    ? `${Math.floor(meetingTime / 60) > 12 ? '오후' : '오전'} ${Math.floor(meetingTime / 60) > 12 ? Math.floor(meetingTime / 60) - 12 : Math.floor(meetingTime / 60)}:${String(meetingTime % 60).padStart(2, '0')}`
    : null;

  const [messages, setMessages] = useState<ChatMessage[]>(() => getDemoMessages(roomName));
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  function getNowMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  const handleCheckIn = () => {
    if (isChecked) return;
    setLocalChecked(true);
    const todayStr = toLocalDateStr(new Date());
    const timeStr = getTimeStr();
    const nowMin = getNowMinutes();
    const isLate = meetingTime != null && nowMin > meetingTime;

    checkIn({
      memberName: currentUser,
      checkedAt: timeStr,
      checkedAtRaw: nowMin,
      roomId,
      roomName,
      date: todayStr,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: `checkin-${Date.now()}`,
        sender: '', senderColor: '', time: '',
        text: isLate
          ? `⚠️ ${currentUser}님이 지각 출석했습니다. (${timeStr})`
          : `✅ ${currentUser}님이 출석체크 했습니다. (${timeStr})`,
        isMe: false, isSystem: true,
      },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handleSetMeetingTime = () => {
    const totalMin = pickerHour * 60 + pickerMin;
    setMeetingTime(roomId, totalMin);
    setShowTimePicker(false);

    const label = `${pickerHour > 12 ? '오후' : '오전'} ${pickerHour > 12 ? pickerHour - 12 : pickerHour}:${String(pickerMin).padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      {
        id: `meeting-${Date.now()}`,
        sender: '', senderColor: '', time: '',
        text: `⏰ 모임시간이 ${label}로 설정되었습니다. 이후 출석은 지각 처리됩니다.`,
        isMe: false, isSystem: true,
      },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const timeStr = getTimeStr();

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: currentUser,
        senderColor: Brand.primary,
        text,
        time: timeStr,
        isMe: true,
      },
    ]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const timeStr = getTimeStr();
      setMessages((prev) => [
        ...prev,
        {
          id: `img-${Date.now()}`,
          sender: currentUser,
          senderColor: Brand.primary,
          imageUri: result.assets[0].uri,
          time: timeStr,
          isMe: true,
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  // 연속 메시지 그룹핑 (같은 사람이 연속으로 보내면 아바타/이름 숨김)
  const shouldShowSender = (msg: ChatMessage, idx: number) => {
    if (msg.isMe || msg.isSystem) return false;
    if (idx === 0) return true;
    return messages[idx - 1].sender !== msg.sender || messages[idx - 1].isSystem;
  };

  const shouldShowTime = (msg: ChatMessage, idx: number) => {
    if (msg.isSystem) return false;
    if (idx === messages.length - 1) return true;
    const next = messages[idx + 1];
    return next.sender !== msg.sender || next.time !== msg.time;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: roomName,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 16 },
          headerBackTitle: '채팅',
        }}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Attendance Check Banner */}
        {isWorshipRoom && (
          <Pressable
            onPress={handleCheckIn}
            disabled={isChecked}
            style={[
              styles.checkInBanner,
              {
                backgroundColor: isChecked ? `${Brand.accent}15` : `${Brand.primary}12`,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <FontAwesome
              name={isChecked ? 'check-circle' : 'hand-pointer-o'}
              size={20}
              color={isChecked ? Brand.accent : Brand.primary}
            />
            <View style={styles.checkInTextWrap}>
              <Text style={[styles.checkInTitle, { color: isChecked ? Brand.accent : colors.text }]}>
                {isChecked ? '출석 완료!' : '출석체크'}
              </Text>
              <Text style={[styles.checkInDesc, { color: colors.textSecondary }]}>
                {isChecked
                  ? `${currentUser}님이 출석 체크했습니다`
                  : '탭하여 오늘 예배 출석을 체크하세요'}
              </Text>
            </View>
            {!isChecked && (
              <View style={[styles.checkInBtn, { backgroundColor: Brand.primary }]}>
                <Text style={styles.checkInBtnText}>출석</Text>
              </View>
            )}
          </Pressable>
        )}

        {/* Meeting Time Bar */}
        {isWorshipRoom && (
          <View style={[styles.meetingBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <FontAwesome name="clock-o" size={16} color={meetingTimeStr ? Brand.accent : colors.textSecondary} />
            {meetingTimeStr ? (
              <Text style={[styles.meetingTimeText, { color: colors.text }]}>
                모임시간 <Text style={{ color: Brand.accent, fontWeight: '800' }}>{meetingTimeStr}</Text>
                {' '}· 이후 출석은 지각
              </Text>
            ) : (
              <Text style={[styles.meetingTimeText, { color: colors.textSecondary }]}>
                모임시간 미설정
              </Text>
            )}
            <Pressable
              onPress={() => setShowTimePicker(!showTimePicker)}
              style={[styles.meetingSetBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.meetingSetBtnText, { color: Brand.primary }]}>
                {meetingTimeStr ? '변경' : '설정'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <View style={[styles.timePickerWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.timePickerRow}>
              <View style={styles.timePickerCol}>
                <Pressable onPress={() => setPickerHour((h) => Math.min(23, h + 1))} style={styles.timeArrow}>
                  <FontAwesome name="chevron-up" size={14} color={colors.textSecondary} />
                </Pressable>
                <Text style={[styles.timePickerNum, { color: colors.text }]}>
                  {String(pickerHour).padStart(2, '0')}
                </Text>
                <Pressable onPress={() => setPickerHour((h) => Math.max(0, h - 1))} style={styles.timeArrow}>
                  <FontAwesome name="chevron-down" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
              <Text style={[styles.timePickerColon, { color: colors.text }]}>:</Text>
              <View style={styles.timePickerCol}>
                <Pressable onPress={() => setPickerMin((m) => m >= 50 ? 0 : m + 10)} style={styles.timeArrow}>
                  <FontAwesome name="chevron-up" size={14} color={colors.textSecondary} />
                </Pressable>
                <Text style={[styles.timePickerNum, { color: colors.text }]}>
                  {String(pickerMin).padStart(2, '0')}
                </Text>
                <Pressable onPress={() => setPickerMin((m) => m <= 0 ? 50 : m - 10)} style={styles.timeArrow}>
                  <FontAwesome name="chevron-down" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
              <Pressable onPress={handleSetMeetingTime} style={[styles.timeConfirmBtn, { backgroundColor: Brand.primary }]}>
                <Text style={styles.timeConfirmText}>확인</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg, idx) => {
            if (msg.isSystem) {
              return (
                <View key={msg.id} style={styles.systemMsg}>
                  <Text style={[styles.systemMsgText, { color: colors.textSecondary }]}>
                    {msg.text}
                  </Text>
                </View>
              );
            }

            const showSender = shouldShowSender(msg, idx);
            const showTime = shouldShowTime(msg, idx);

            if (msg.isMe) {
              return (
                <View key={msg.id} style={styles.myRow}>
                  {showTime && (
                    <Text style={[styles.msgTime, { color: colors.textSecondary }]}>{msg.time}</Text>
                  )}
                  <View style={[styles.myBubble, { backgroundColor: Brand.primary }]}>
                    {msg.text && <Text style={styles.myBubbleText}>{msg.text}</Text>}
                    {msg.imageUri && (
                      <Image source={{ uri: msg.imageUri }} style={styles.chatImage} resizeMode="cover" />
                    )}
                  </View>
                </View>
              );
            }

            return (
              <View key={msg.id} style={[styles.otherRow, !showSender && { marginLeft: 46 }]}>
                {showSender && (
                  <Avatar name={msg.sender} color={msg.senderColor} size={36} />
                )}
                <View style={styles.otherContent}>
                  {showSender && (
                    <Text style={[styles.senderName, { color: colors.textSecondary }]}>{msg.sender}</Text>
                  )}
                  <View style={styles.otherBubbleRow}>
                    <View style={[styles.otherBubble, { backgroundColor: colors.surface }]}>
                      {msg.text && <Text style={[styles.otherBubbleText, { color: colors.text }]}>{msg.text}</Text>}
                      {msg.imageUri && (
                        <Image source={{ uri: msg.imageUri }} style={styles.chatImage} resizeMode="cover" />
                      )}
                    </View>
                    {showTime && (
                      <Text style={[styles.msgTime, styles.msgTimeLeft, { color: colors.textSecondary }]}>
                        {msg.time}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable onPress={pickImage} style={styles.inputAction}>
            <FontAwesome name="image" size={22} color={colors.textSecondary} />
          </Pressable>
          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceSecondary }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="메시지를 입력하세요"
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
            />
          </View>
          <Pressable
            onPress={sendMessage}
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.4 }]}
            disabled={!inputText.trim()}
          >
            <FontAwesome name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Check-in Banner
  checkInBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  checkInTextWrap: { flex: 1 },
  checkInTitle: { fontSize: 15, fontWeight: '700' },
  checkInDesc: { fontSize: 12, marginTop: 2 },
  checkInBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20,
  },
  checkInBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Meeting Time
  meetingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  meetingTimeText: { fontSize: 13, flex: 1 },
  meetingSetBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1,
  },
  meetingSetBtnText: { fontSize: 12, fontWeight: '700' },
  timePickerWrap: {
    paddingVertical: 16, paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  timePickerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 12,
  },
  timePickerCol: { alignItems: 'center', gap: 4 },
  timeArrow: { padding: 8 },
  timePickerNum: { fontSize: 32, fontWeight: '800', width: 50, textAlign: 'center' },
  timePickerColon: { fontSize: 28, fontWeight: '800' },
  timeConfirmBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, marginLeft: 16,
  },
  timeConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Message List
  messageList: { flex: 1 },
  messageListContent: { padding: 16, paddingBottom: 8 },

  // System
  systemMsg: { alignItems: 'center', marginVertical: 16 },
  systemMsgText: { fontSize: 12, fontWeight: '500', textAlign: 'center' },

  // My Messages
  myRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginBottom: 4, gap: 6 },
  myBubble: {
    maxWidth: '70%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomRightRadius: 4,
    overflow: 'hidden',
  },
  myBubbleText: { color: '#fff', fontSize: 15, lineHeight: 22 },

  // Other Messages
  otherRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, gap: 8 },
  otherContent: { flex: 1 },
  senderName: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginLeft: 2 },
  otherBubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  otherBubble: {
    maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4,
    overflow: 'hidden',
  },
  otherBubbleText: { fontSize: 15, lineHeight: 22 },

  // Time
  msgTime: { fontSize: 10, marginBottom: 2 },
  msgTimeLeft: {},

  // Image
  chatImage: { width: 200, height: 200, borderRadius: 12, marginTop: 4 },

  // Input Bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 10, paddingVertical: 8,
    borderTopWidth: 1, gap: 8,
  },
  inputAction: { padding: 8, paddingBottom: 10 },
  inputWrap: {
    flex: 1, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    maxHeight: 100,
  },
  input: { fontSize: 15, lineHeight: 20, padding: 0 },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Brand.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});

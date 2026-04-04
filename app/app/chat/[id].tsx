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

const currentUser = '김강래';

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

  const [messages, setMessages] = useState<ChatMessage[]>(() => getDemoMessages(roomName));
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const now = new Date();
    const timeStr = `${now.getHours() > 12 ? '오후' : '오전'} ${now.getHours() > 12 ? now.getHours() - 12 : now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

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
      const now = new Date();
      const timeStr = `${now.getHours() > 12 ? '오후' : '오전'} ${now.getHours() > 12 ? now.getHours() - 12 : now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

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

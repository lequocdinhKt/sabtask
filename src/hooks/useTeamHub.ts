/**
 * File: hooks/useTeamHub.ts
 * Mục đích: Custom hook cung cấp dữ liệu và nghiệp vụ cho màn Team Hub.
 * Hook tải danh sách kênh cùng tin nhắn từ Supabase, lắng nghe Realtime để đồng bộ thay đổi giữa các người dùng,
 * và cho phép gửi tin nhắn (kèm tin nhắn AI), tạo/xóa kênh, cập nhật trạng thái tham gia voice ở phía client.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Channel, ChatMessage, User } from '../types';

/**
 * Chuyển một dòng bảng `channels` của Supabase thành đối tượng Channel dùng trong UI.
 * @param row Dữ liệu thô lấy từ database.
 * @returns Channel với danh sách người đang ở voice để trống, vì trạng thái này chỉ quản lý ở client.
 */
const mapChannel = (row: Record<string, unknown>): Channel => ({
  id: String(row.id),
  name: String(row.name),
  type: row.type as Channel['type'],
  connectedUserIds: [],
});

/**
 * Chuyển một dòng bảng `messages` của Supabase thành đối tượng ChatMessage dùng trong UI.
 * @param row Dữ liệu thô lấy từ database.
 * @returns ChatMessage đã chuẩn hóa tên trường, gán userId là 'ai' cho tin nhắn của bot và dựng lại thông tin tệp đính kèm nếu có.
 */
const mapMessage = (row: Record<string, unknown>): ChatMessage => ({
  id: String(row.id),
  channelId: String(row.channel_id),
  userId: row.is_ai ? 'ai' : String(row.user_id ?? ''),
  text: String(row.text || ''),
  createdAt: String(row.created_at),
  isAi: Boolean(row.is_ai),
  attachment:
    row.attachment_url
      ? {
          type: (row.attachment_type === 'image' ? 'image' : 'file') as 'image' | 'file',
          url: String(row.attachment_url),
          name: String(row.attachment_name || 'file'),
        }
      : undefined,
});

/**
 * Hook quản lý state và các thao tác của Team Hub.
 * @param isAuth Cờ cho biết người dùng đã đăng nhập; nếu chưa thì không truy vấn và không lắng nghe Realtime.
 * @param user Người dùng hiện tại, dùng làm tác giả của tin nhắn và kênh được tạo.
 * @returns Danh sách kênh, tin nhắn, cờ loading và các hàm gửi tin nhắn, tạo/xóa kênh, cập nhật voice, tải lại dữ liệu.
 */
export const useTeamHub = (isAuth: boolean, user: User) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  /** Tải song song toàn bộ kênh và tin nhắn từ Supabase theo thứ tự thời gian tạo, dùng cho lần khởi tạo và khi cần refetch. */
  const fetchAll = useCallback(async () => {
    if (!isAuth) return;
    setLoading(true);
    try {
      const [{ data: channelRows }, { data: messageRows }] = await Promise.all([
        supabase.from('channels').select('*').order('created_at', { ascending: true }),
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
      ]);
      if (channelRows) setChannels(channelRows.map(mapChannel));
      if (messageRows) setMessages(messageRows.map(mapMessage));
    } catch (e) {
      console.error('Failed to load Team Hub', e);
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  /** Nạp dữ liệu Team Hub ngay khi hook được dùng và mỗi khi hàm fetchAll thay đổi (tức khi trạng thái đăng nhập đổi). */
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /**
   * Đăng ký kênh Realtime của Supabase để đồng bộ dữ liệu khi người dùng khác thao tác:
   * thêm/sửa/xóa kênh và thêm/xóa tin nhắn đều được cập nhật trực tiếp vào state (có kiểm tra trùng id).
   * Chỉ chạy khi đã đăng nhập; khi unmount hoặc trạng thái đăng nhập đổi thì hủy đăng ký kênh Realtime.
   */
  useEffect(() => {
    if (!isAuth) return;

    const channel = supabase
      .channel('team-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const c = mapChannel(payload.new as Record<string, unknown>);
          setChannels((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));
        } else if (payload.eventType === 'DELETE') {
          const id = String((payload.old as Record<string, unknown>).id);
          setChannels((prev) => prev.filter((c) => c.id !== id));
        } else if (payload.eventType === 'UPDATE') {
          const c = mapChannel(payload.new as Record<string, unknown>);
          setChannels((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...c } : x)));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = mapMessage(payload.new as Record<string, unknown>);
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        const id = String((payload.old as Record<string, unknown>).id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuth]);

  /**
   * Gửi tin nhắn của người dùng hiện tại vào một kênh theo cơ chế optimistic update:
   * hiển thị ngay trên UI rồi mới ghi xuống bảng `messages`, nếu lỗi thì gỡ tin nhắn vừa thêm.
   * @param channelId Kênh nhận tin nhắn.
   * @param text Nội dung tin nhắn.
   * @param attachment Tệp hoặc ảnh đính kèm (không bắt buộc).
   * @returns Tin nhắn đã gửi, hoặc null nếu ghi database thất bại.
   */
  const sendMessage = async (
    channelId: string,
    text: string,
    attachment?: ChatMessage['attachment']
  ): Promise<ChatMessage | null> => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const optimistic: ChatMessage = {
      id,
      channelId,
      userId: user.id,
      text,
      attachment,
      createdAt,
    };
    setMessages((prev) => [...prev, optimistic]);

    const { error } = await supabase.from('messages').insert({
      id,
      channel_id: channelId,
      user_id: user.id,
      text,
      attachment_url: attachment?.url || null,
      attachment_name: attachment?.name || null,
      attachment_type: attachment?.type || null,
      is_ai: false,
      created_at: createdAt,
    });

    if (error) {
      console.error(error);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      return null;
    }
    return optimistic;
  };

  /**
   * Thêm câu trả lời của trợ lý AI vào kênh: hiện ngay trên UI rồi lưu vào bảng `messages` với cờ is_ai,
   * user_id vẫn là người đang đăng nhập để thỏa ràng buộc dữ liệu. Nếu lưu lỗi thì gỡ tin nhắn khỏi UI.
   * @param channelId Kênh nhận câu trả lời.
   * @param text Nội dung do AI sinh ra.
   */
  const sendAiMessage = async (channelId: string, text: string): Promise<void> => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const bot: ChatMessage = {
      id,
      channelId,
      userId: 'ai',
      text,
      createdAt,
      isAi: true,
    };
    setMessages((prev) => [...prev, bot]);

    const { error } = await supabase.from('messages').insert({
      id,
      channel_id: channelId,
      user_id: user.id,
      text,
      is_ai: true,
      created_at: createdAt,
    });
    if (error) {
      console.error(error);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  };

  /**
   * Tạo kênh chat mới trong database và thêm vào danh sách đang hiển thị.
   * @param name Tên kênh.
   * @param type Loại kênh: TEXT (chat chữ) hoặc VOICE (phòng thoại).
   * @returns Kênh vừa tạo, hoặc null nếu ghi database thất bại.
   */
  const createChannel = async (name: string, type: 'TEXT' | 'VOICE'): Promise<Channel | null> => {
    const id = crypto.randomUUID();
    const channel: Channel = { id, name, type, connectedUserIds: [] };
    const { error } = await supabase.from('channels').insert({
      id,
      name,
      type,
      created_by: user.id,
    });
    if (error) {
      console.error(error);
      return null;
    }
    setChannels((prev) => [...prev, channel]);
    return channel;
  };

  /**
   * Xóa một kênh khỏi database, đồng thời loại kênh đó và mọi tin nhắn của nó khỏi state.
   * @param id Mã kênh cần xóa.
   * @returns true nếu xóa thành công, false nếu database báo lỗi.
   */
  const deleteChannel = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (error) {
      console.error(error);
      return false;
    }
    setChannels((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => prev.filter((m) => m.channelId !== id));
    return true;
  };

  /**
   * Cập nhật trạng thái tham gia phòng voice của chính người dùng hiện tại, đảm bảo mỗi lúc chỉ ở trong một kênh voice.
   * Trạng thái này chỉ lưu trong state ở máy người dùng (chưa đồng bộ qua database hay WebRTC), nên các thành viên khác không thấy được.
   * @param channelId Kênh voice liên quan.
   * @param connected true khi tham gia, false khi rời phòng.
   */
  const setVoiceConnectedLocal = (channelId: string, connected: boolean) => {
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id !== channelId) {
          return {
            ...c,
            connectedUserIds: (c.connectedUserIds || []).filter((id) => id !== user.id),
          };
        }
        const ids = new Set(c.connectedUserIds || []);
        if (connected) ids.add(user.id);
        else ids.delete(user.id);
        return { ...c, connectedUserIds: [...ids] };
      })
    );
  };

  return {
    channels,
    messages,
    loading,
    sendMessage,
    sendAiMessage,
    createChannel,
    deleteChannel,
    setVoiceConnectedLocal,
    refetch: fetchAll,
  };
};

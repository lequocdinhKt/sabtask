/**
 * File: useTeamHub.ts
 * Trách nhiệm: Fetch/persist channels + messages qua Supabase + Realtime.
 * Liên quan: TeamHub.tsx, supabase_schema.sql (channels, messages).
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Channel, ChatMessage, User } from '../types';

const mapChannel = (row: Record<string, unknown>): Channel => ({
  id: String(row.id),
  name: String(row.name),
  type: row.type as Channel['type'],
  connectedUserIds: [],
});

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

export const useTeamHub = (isAuth: boolean, user: User) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

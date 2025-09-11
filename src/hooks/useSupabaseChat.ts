import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export const useSupabaseChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch chat messages from Supabase
  const fetchChatMessages = async () => {
    if (!user) {
      setChatMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        message: msg.message,
        isUser: msg.is_user,
        timestamp: new Date(msg.timestamp)
      }));

      setChatMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add chat message to Supabase
  const addChatMessage = async (message: string, isUser: boolean) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message,
          is_user: isUser,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: ChatMessage = {
        id: data.id,
        message: data.message,
        isUser: data.is_user,
        timestamp: new Date(data.timestamp)
      };

      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error adding chat message:', error);
      toast({
        title: "Error",
        description: "Failed to save chat message",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChatMessages();
  }, [user]);

  return {
    chatMessages,
    loading,
    addChatMessage,
    refetch: fetchChatMessages
  };
};
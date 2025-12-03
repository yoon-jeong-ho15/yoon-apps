import type { User } from "../../types/user";
import type { Message } from "../../types/message";
import { useState, useEffect, useCallback } from "react";
import { fetchAllMessages } from "../../lib/data/message";
import { fetchUsersByGroup } from "../../lib/data/user";
import { useAuth } from "../../contexts";
import { useMessageForm } from "./useMessageForm";
import { useMessageList } from "./useMessageList";

export function useAdminMessage(){
    const {user} = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [messageCount, setMessageCount] = useState<Map<string, number>>(
    new Map()
    );

    const loadUsers = useCallback(async () => {
        const allUsers = await fetchUsersByGroup(user!.username);
        setUsers(allUsers);
    }, [user]);

    const loadMessages = useCallback(async () =>{
        const fetchedMessages = await fetchAllMessages();
        setAllMessages(fetchedMessages);

        // Calculate message count for each user
        const counts = new Map<string, number>();
        users.forEach(u => {
            const count = fetchedMessages.filter(
                msg => msg.author.id === u.id || msg.recipient.id === u.id
            ).length;
            counts.set(u.id, count);
        });
        setMessageCount(counts);
    }, [users]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const handleUserClick = (newSelectedUser: User) => {
    // Toggle: if clicking the same user, deselect them
        if (selectedUser?.id === newSelectedUser.id) {
            setSelectedUser(null);
            setMessages([]);
        } else {
            setSelectedUser(newSelectedUser);
            const userMessages = allMessages.filter(
                msg => msg.author.id === newSelectedUser.id ||
                       msg.recipient.id === newSelectedUser.id
            );
            setMessages(userMessages);
        }
    };

    // Use message form hook
    const messageForm = useMessageForm({
        currentUserId: user!.id,
        recipientId: selectedUser?.id,
        onMessageSent: loadMessages,
    });

    // Use message list hook
    const messageList = useMessageList(messages);

    return{
        userListProps:{users, selectedUser, handleUserClick, messageCount},
        messageListProps: {messages, messageDivRef: messageList.messageDivRef},
        messageFormProps:{
            message: messageForm.message,
            setMessage: messageForm.setMessage,
            isSubmitting: messageForm.isSubmitting,
            textareaRef: messageForm.textareaRef,
            handleSubmit: messageForm.handleSubmit,
            handleKeyDown: messageForm.handleKeyDown,
        },
    }
}
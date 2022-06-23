import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import cookie from "js-cookie";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { Segment, Header, Divider, Comment, Grid, Icon } from "semantic-ui-react";
import Chat from "../components/Chats/Chat";
import ChatListSearch from "../components/Chats/ChatListSearch";
import { NoMessages } from "../components/Layout/NoData";
import Message from "../components/Messages/Message";
import Banner from "../components/Messages/Banner";

const setMessageToUnread = async () => {
    await axios.post(
        `${baseUrl}/api/chats`,
        {},
        { headers: { Authorization: cookie.get("token") } }
    );
};

function Messages({ chatsData, user }) {
    const [chats, setChats] = useState(chatsData)
    const router = useRouter()

    const socket = useRef();
    const [connectedUsers, setConnectedUsers] = useState([]);

    const [messages, setMessages] = useState([])
    const [bannerData, setBannerData] = useState({ name: "", profilePicUrl: "" })

    // This ref is for persisting the state of query string in url throughout re-renders. This ref is the value of query string inside url
    const openChatId = useRef("");

    //CONNECTION useEffect
    useEffect(() => {
        if (user.unreadMessage) setMessageToUnread();

        if (!socket.current) {
            socket.current = io(baseUrl);
        }

        if (socket.current) {
            socket.current.emit("join", { userId: user._id });

            socket.current.on("connectedUsers", ({ users }) => {
                users.length > 0 && setConnectedUsers(users);
            });

            if (chats.length > 0 && !router.query.message) {
                router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
                    shallow: true
                });
            }
        }
    }, []);

    // LOAD MESSAGES useEffect
    useEffect(() => {
        const loadMessages = () => {
            socket.current.emit("loadMessages", {
                userId: user._id,
                messagesWith: router.query.message
            });

            socket.current.on("messagesLoaded", async ({ chat }) => {
                setMessages(chat.messages);
                setBannerData({
                    name: chat.messagesWith.name,
                    profilePicUrl: chat.messagesWith.profilePicUrl
                });

                openChatId.current = chat.messagesWith._id;
            });
        };

        if (socket.current) {
            loadMessages();
        }
    }, [router.query.message]);

    const deleteChat = async messagesWith => {
        try {
            await axios.delete(`${baseUrl}/api/chats/${messagesWith}`, {
                headers: { Authorization: cookie.get("token") }
            });

            setChats(prev => prev.filter(chat => chat.messagesWith !== messagesWith));
            router.push("/messages", undefined, { shallow: true });
            openChatId.current = "";
        } catch (error) {
            alert("Error deleting chat");
        }
    };

    return (
        <>
            <Segment padded basic size="large" style={{ marginTop: "5px" }}>
                <Header
                    icon="home"
                    content="Go Back!"
                    onClick={() => router.push("/")}
                    style={{ cursor: "pointer" }}
                />
                <Divider hidden />

                <div style={{ marginBottom: "10px" }}>
                    <ChatListSearch chats={chats} setChats={setChats} />
                </div>

                {chats.length > 0 ? (
                    <>
                        <Grid stackable>
                            <Grid.Column width={4}>
                                <Comment.Group size="big">
                                    <Segment raised style={{ overflow: "auto", maxHeight: "32rem" }}>
                                        {chats.map(chat => (
                                            <Chat
                                                key={chat.messagesWith}
                                                chat={chat}
                                                connectedUsers={connectedUsers}
                                                deleteChat={deleteChat}
                                            />
                                        ))}
                                    </Segment>
                                </Comment.Group>
                            </Grid.Column>

                            <Grid.Column width={12}>
                                {router.query.message && (
                                    <>
                                        <div
                                            style={{
                                                overflow: "auto",
                                                overflowX: "hidden",
                                                maxHeight: "35rem",
                                                height: "35rem",
                                                backgroundColor: "whitesmoke"
                                            }}
                                        >
                                            <>
                                                {messages.length > 0 && (
                                                    <>
                                                        <div style={{ position: "sticky", top: "0" }}>
                                                            <Banner bannerData={bannerData} />
                                                        </div>
                                                        {messages.map((message, i) => (
                                                            <Message
                                                                key={i}
                                                                message={message}
                                                                user={user}
                                                                setMessages={setMessages}
                                                                messagesWith={openChatId.current}
                                                            />
                                                        ))}
                                                    </>
                                                )}
                                            </>
                                        </div>
                                    </>
                                )}
                            </Grid.Column>
                        </Grid>
                    </>
                ) : (
                    <NoMessages />
                )}
            </Segment>
        </>
    );
}

export const getServerSideProps = async ctx => {
    try {
        const { token } = parseCookies(ctx);

        const res = await axios.get(`${baseUrl}/api/chats`, {
            headers: { Authorization: token }
        });

        return { props: { chatsData: res.data } };
    } catch (error) {
        return { props: { errorLoading: true } };
    }
};

export default Messages;
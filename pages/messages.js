import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { Segment, Header, Divider, Comment, Grid } from "semantic-ui-react";
import Chat from "../components/Chats/Chat";
import { NoMessages } from "../components/Layout/NoData";

function Messages({ chatsData }) {
    const [chats, setChats] = useState(chatsData)
    const router = useRouter()

    const socket = useRef();
    const [connectedUsers, setConnectedUsers] = useState([]);

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
            </Segment>
        </>
    )

    Messages.getInitialProps = async ctx => {
        try {
            const { token } = parseCookies(ctx);

            const res = await axios.get(`${baseUrl}/api/chats`, {
                headers: { Authorization: token }
            });

            return { chatsData: res.data };
        } catch (error) {
            return { errorLoading: true };
        }
    };

    export default Messages;
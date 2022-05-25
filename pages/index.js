import React, { useState, useEffect } from 'react'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import CreatePost from '../components/Post/CreatePost'
import CardPost from '../components/Post/CardPost'
import { Segment } from 'semantic-ui-react'
import { parseCookies } from 'nookies'
import { NoPosts } from '../components/Layout/NoData'
import { PostDeleteToastr } from "../components/Layout/Toastr";

function Index({ user, postsData }) {
    const [posts, setPosts] = useState(postsData || []);

    useEffect(() => {
        document.title = `Welcome, ${user.name.split(" ")[0]}`
    }, [])

    return (
        <>
            <Segment>
                <CreatePost user={user} setPosts={setPosts} />
                {posts.map(post => (
                    <CardPost
                        key={post._id}
                        post={post}
                        user={user}
                        setPosts={setPosts}
                    />
                ))}
            </Segment>
        </>
    )
}

Index.getInitialProps = async ctx => {
    try {
        const { token } = parseCookies(ctx)

        const res = await axios.get(`${baseUrl}/api/posts`, {
            headers: { Authorization: token }
        })

        return { postData: res.data }
    } catch (error) {
        return { errorLoading: true }
    }
}

export default Index
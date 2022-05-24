import React, { useEffect } from 'react'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import CreatePost from '../components/Post/CreatePost'
import CardPost from '../components/Post/CardPost'
import { Segment } from 'semantic-ui-react'
import { parseCookies } from 'nookies'
import { NoPosts } from '../components/Layout/NoData'

function Index({ user }) {

    useEffect(() => {
        document.title = `Welcome, ${user.name.split(" ")[0]}`
    }, [])

    return <div>Homepage</div>
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

import React from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import { parseCookies } from 'nookies'
import { NoProfile } from '../components/Layout/NoData'
import cookie from 'js-cookie'
import { Grid } from 'semantic-ui-react'
import ProfileMenuTabs from '../components/Profile/ProfileMenuTabs'
import CardPost from "../components/Post/CardPost"
import { PlaceHolderPosts } from '../components/Layout/PlaceHolderGroup'
import { PostDeleteToastr } from '../components/Layout/Toastr'

function ProfilePage({
    profile,
    followersLength,
    followingLength,
    errorLoading,
    user,
    userFollowStats
}) {
    const router = useRouter();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showToastr, setShowToastr] = useState(false);

    const [activeItem, setActiveItem] = useState("profile");
    const handleItemClick = clickedTab => setActiveItem(clickedTab);

    const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);

    const ownAccount = profile.user._id === user._id;

    if (errorLoading) return <NoProfile />

    useEffect(() => {
        const getPosts = async () => {
            setLoading(true);
            try {
                const { username } = router.query
                const token = cookie.get("token")

                const res = await axios.get(`${baseUrl}/api/profile/posts/${username}`, {
                    headers: { Authorization: token }
                });

                setPosts(res.data);
            } catch (error) {
                alert("Error loading posts")
            }
            setLoading(false);
        }

        getPosts();
    }, []);

    useEffect(() => {
        showToastr && setTimeout(() => setShowToastr(false), 4000);
    }, [showToastr]);

    return (
        <>
            {showToastr && <PostDeleteToastr />}
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column>
                        <ProfileMenuTabs
                            activeItem={activeItem}
                            handleItemClick={handleItemClick}
                            followersLength={followersLength}
                            followingLength={followingLength}
                            ownAccount={ownAccount}
                            loggedUserFollowStats={loggedUserFollowStats}
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </>
    )
}

ProfilePage.getInitialProps = async (ctx) => {
    try {
        const { username } = ctx.query;
        const { token } = parseCookies(ctx);

        const res = await axios.get(`${baseUrl}/api/profile/${username}`, {
            headers: { Authorization: token }
        });
        const { profile, followersLength, followingLength } = res.data;

        return { props: { profile, followersLength, followingLength } };
    } catch (error) {
        return { props: { errorLoading: true } };
    }
};

export default ProfilePage;
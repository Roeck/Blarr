import React from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import baseUrl from '../utils/baseUrl'
import { parseCookies } from 'nookies'
import { NoProfile } from '../components/Layout/NoData'
import cookie from 'js-cookie'
import { Grid } from 'semantic-ui-react'
import ProfileMenuTabs from '../components/Profile/ProfileMenuTabs'

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

    const [activeItem, setActiveItem] = useState("profile");
    const handleItemClick = clickedTab => setActiveItem(clickedTab);

    const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);

    const ownAccount = profile.user._id === user._id;

    if (errorLoading) return <NoProfile />

    useEffect(() => {
        (async () => {
            setLoading(true);

            try {
                const { username } = router.query;
                const res = await Axios.get(`/posts/${username}`);

                setPosts(res.data);
            } catch (error) {
                alert("Error Loading Posts");
            }

            setLoading(false);
        })();
    }, [router.query.username]);
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
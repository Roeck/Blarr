import { useState } from "react";
import {
    Card,
    Icon,
    Image,
    Divider,
    Segment,
    Button,
    Popup,
    Header,
    Modal
} from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";
import Link from "next/link";
import { deletePost } from "../../utils/postActions";

function CardPost({ post, user, setPosts }) {

    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const addPropsToModal = {
        post,
        user,
    };

    return (
        <>
            <Segment basic>
                <Card color="teal" fluid>
                    {post.picUrl && (
                        <Image
                            src={post.picUrl}
                            style={{ cursor: "pointer" }}
                            floated="left"
                            wrapped
                            ui={false}
                            alt="PostImage"
                            onClick={() => setShowModal(true)}
                        />
                    )}

                    <Card.Content>
                        <Image floated="left" src={post.user.profilePicUrl} avatar circular />

                        {(user.role === "root" || post.user._id === user._id) && (
                            <>
                                <Popup
                                    on="click"
                                    position="top right"
                                    trigger={
                                        <Image
                                            src="/deleteIcon.svg"
                                            style={{ cursor: "pointer" }}
                                            size="mini"
                                            floated="right"
                                        />
                                    }
                                >
                                    <Header as="h4" content="Are you sure?" />
                                    <p>This action is irreversible!</p>

                                    <Button
                                        color="red"
                                        icon="trash"
                                        content="Delete"
                                        onClick={() => deletePost(post._id, setPosts)}
                                    />
                                </Popup>
                            </>
                        )}

                        <Card.Header>
                            <Link href={`/${post.user.username}`}>
                                <a>{post.user.name}</a>
                            </Link>
                        </Card.Header>

                        <Card.Meta>{calculateTime(post.createdAt)}</Card.Meta>

                        {post.location && <Card.Meta content={post.location} />}

                        <Card.Description
                            style={{
                                fontSize: "17px",
                                letterSpacing: "0.1px",
                                wordSpacing: "0.35px"
                            }}
                        >
                            {post.text}
                        </Card.Description>
                    </Card.Content>
                </Card>
            </Segment>
            <Divider hidden />
        </>
    );
}

export default CardPost;
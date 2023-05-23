import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Button,
	TouchableOpacity,
	Platform,
	Image,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function FullscreenPicture(props) {
	const [post, setPost] = useState(null);
	const [user, setUser] = useState(null);
	const [comments, setComments] = useState([]);
	const [likes, setLikes] = useState([]);
	const [roles, setRoles] = useState("");

	const fetchLikedUserIds = async () => {
		try {
			const likesSnapshot = await firebase
				.firestore()
				.collection("posts")
				.doc(props.route.params.uid)
				.collection("userPosts")
				.doc(props.route.params.postId)
				.collection("likes")
				.get();
			const likedUserIds = likesSnapshot.docs.map((doc) => doc.id);
			setLikes(likedUserIds);
		} catch (error) {
			console.log("Error fetching liked user IDs:", error);
		}
	};

	useEffect(() => {
		const fetchPostData = async () => {
			try {
				const postSnapshot = await firebase
					.firestore()
					.collection("posts")
					.doc(props.route.params.uid)
					.collection("userPosts")
					.doc(props.route.params.postId)
					.get();
				const postData = postSnapshot.data();
				if (postData) {
					setPost(postData);
				}

				const userSnapshot = await firebase
					.firestore()
					.collection("users")
					.doc(props.route.params.uid)
					.get();
				const userData = userSnapshot.data();
				if (userData) {
					setUser(userData);
				}

				const userRoleSnapshot = await firebase
					.firestore()
					.collection("users")
					.doc(firebase.auth().currentUser.uid)
					.get();
				const roleData = userRoleSnapshot.data();
				if (roleData) {
					setRoles(roleData.role);
				}

				const commentsSnapshot = await firebase
					.firestore()
					.collection("posts")
					.doc(props.route.params.uid)
					.collection("userPosts")
					.doc(props.route.params.postId)
					.collection("comments")
					.get();
				const commentsData = commentsSnapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					return { id, ...data };
				});
				setComments(commentsData);
			} catch (error) {
				console.log("Error fetching post data:", error);
			}
		};

		fetchPostData();
		fetchLikedUserIds();
	}, [props.route.params.uid, props.route.params.postId]);

	const onLikePress = () => {
		try {
			const updatedLikes = [...likes, firebase.auth().currentUser.uid];
			setLikes(updatedLikes);
			firebase
				.firestore()
				.collection("posts")
				.doc(props.route.params.uid)
				.collection("userPosts")
				.doc(props.route.params.postId)
				.collection("likes")
				.doc(firebase.auth().currentUser.uid)
				.set({});
		} catch (error) {
			console.log("Error liking post:", error);
		}
	};

	const onDislikePress = () => {
		try {
			const updatedLikes = likes.filter(
				(userId) => userId !== firebase.auth().currentUser.uid
			);
			setLikes(updatedLikes);
			firebase
				.firestore()
				.collection("posts")
				.doc(props.route.params.uid)
				.collection("userPosts")
				.doc(props.route.params.postId)
				.collection("likes")
				.doc(firebase.auth().currentUser.uid)
				.delete();
		} catch (error) {
			console.log("Error disliking post:", error);
		}
	};
	const onDeletePost = () => {
		firebase
			.firestore()
			.collection("posts")
			.doc(props.route.params.uid)
			.collection("userPosts")
			.doc(props.route.params.postId)
			.delete();
	};

	if (!post || !user) {
		return null;
	}

	let currentUserLike = false;

	likes.forEach((user) => {
		if (user === firebase.auth().currentUser.uid) {
			currentUserLike = true;
		}
	});

	return (
		<View style={styles.container}>
			<View style={styles.postContainer}>
				<View style={styles.postHeader}>
					<Image
						style={styles.profilePicture}
						source={{ uri: user.profilePic }}
					/>
					<Text style={styles.userName}>{user.name}</Text>
				</View>
				<Image
					style={[
						styles.image,
						Platform.OS === "web" && styles.webImage, // Apply different style for web image
					]}
					source={{ uri: post.downloadURL }}
				/>
				<View style={styles.postFooter}>
					{props.route.params.uid === firebase.auth().currentUser.uid ||
					roles === "admin" ? (
						<TouchableOpacity
							onPress={() => onDeletePost(post.id)}
							style={styles.deleteButton}
						>
							<MaterialCommunityIcons
								name="trash-can-outline"
								size={24}
								color="#303030"
							/>
						</TouchableOpacity>
					) : null}
					<TouchableOpacity
						onPress={async () => {
							likes.includes(firebase.auth().currentUser.uid)
								? onDislikePress()
								: onLikePress();
						}}
					>
						<MaterialCommunityIcons
							name={
								likes.includes(firebase.auth().currentUser.uid)
									? "heart"
									: "heart-outline"
							}
							color={
								likes.includes(firebase.auth().currentUser.uid)
									? "#FF0000"
									: "#333333"
							}
							size={26}
						/>
					</TouchableOpacity>

					<Text style={styles.likesCount}>{likes.length}</Text>
					<TouchableOpacity
						onPress={() =>
							props.navigation.navigate("Comment", {
								postId: props.route.params.postId,
								uid: props.route.params.uid,
							})
						}
					>
						<MaterialCommunityIcons
							name="comment-outline"
							color="#007AFF"
							size={26}
						/>
					</TouchableOpacity>
				</View>
				<Text style={styles.caption}>{post.caption}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 20,
		alignItems: "center",
		backgroundColor: "#333",
		paddingHorizontal: 20,
	},
	image: {
		aspectRatio: 1 / 1,
		resizeMode: "cover",
		width: 650,
		width: "100%",
	},
	deleteButton: {
		position: "absolute",
		right: 10,
	},
	postHeader: {
		padding: 16,
		paddingLeft: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	userName: {
		fontSize: 16,
		fontWeight: "bold",
		paddingLeft: 10,
		color: "#FFFFFF",
	},
	postContainer: {
		maxWidth: 650,
		width: "100%",
		marginBottom: 12,
		marginHorizontal: 16,
		borderRadius: 8,
		backgroundColor: "#424242",
		shadowColor: "#000000",
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
		justifyContent: "center",
	},
	postImage: {
		width: "100%",
		aspectRatio: 1,
		resizeMode: "cover",
		marginBottom: 10,
	},
	caption: {
		paddingHorizontal: 16,
		paddingBottom: 8,
		fontSize: 14,
		color: "#FFFFFF",
	},
	commentsContainer: {
		flex: 1,
	},
	postFooter: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
	likesCount: {
		fontSize: 14,
		color: "#777777",
		marginLeft: 3,
		marginRight: 20,
	},
	profilePicture: {
		aspectRatio: 1,
		resizeMode: "cover",
		width: 50,
		height: 50,
		borderRadius: 8,
		backgroundColor: "#FFFFFF",
	},
});

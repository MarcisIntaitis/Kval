import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	FlatList,
	Image,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default function Comment(props) {
	const [comments, setComments] = useState([]);
	const [postId, setPostId] = useState("");
	const [postImage, setPostImage] = useState("");
	const [caption, setCaption] = useState("");
	const [username, setUsername] = useState("");

	useEffect(() => {
		if (props.route.params.postId !== postId) {
			firebase
				.firestore()
				.collection("posts")
				.doc(props.route.params.uid)
				.collection("userPosts")
				.doc(props.route.params.postId)
				.get()
				.then((snapshot) => {
					const postData = snapshot.data();
					if (postData) {
						setPostImage(postData.downloadURL);
						setCaption(postData.caption);
					}
				})
				.catch((error) => {
					console.log("Error fetching post:", error);
				});

			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.get()
				.then((snapshot) => {
					const userData = snapshot.data();
					if (userData) {
						setUsername(userData.username);
					}
				})
				.catch((error) => {
					console.log("Error fetching user:", error);
				});

			firebase
				.firestore()
				.collection("posts")
				.doc(props.route.params.uid)
				.collection("userPosts")
				.doc(props.route.params.postId)
				.collection("comments")
				.get()
				.then((snapshot) => {
					let comments = snapshot.docs.map((doc) => {
						const data = doc.data();
						const id = doc.id;
						return { id, ...data };
					});
					setComments(comments);
				})
				.catch((error) => {
					console.log("Error fetching comments:", error);
				});

			setPostId(props.route.params.postId);
		}
	}, [props.route.params.postId]);

	return (
		<View style={styles.container}>
			<View style={styles.postContainer}>
				<Text style={styles.username}>{username}</Text>
				<Image source={{ uri: postImage }} style={styles.postImage} />
				<Text style={styles.caption}>{caption}</Text>
				<View style={styles.postFooter}>
					<TouchableOpacity
						onPress={() => {
							// Handle like/dislike logic here
						}}
					>
						<MaterialCommunityIcons
							name={"heart-outline"}
							color={"#333333"}
							size={26}
						/>
					</TouchableOpacity>
					<Text style={styles.likesCount}>{comments.length} likes</Text>
					<TouchableOpacity
						onPress={() =>
							props.navigation.navigate("Comment", {
								postId: postId,
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
	postContainer: {
		borderRadius: 12,
		maxWidth: 650,
		paddingTop: 40,
		backgroundColor: "#424242",
		width: "100%",
		marginBottom: 20,
	},
	postImage: {
		width: "100%",
		aspectRatio: 1,
		resizeMode: "cover",
		marginBottom: 10,
	},
	caption: {
		fontSize: 16,
		fontWeight: "bold",
	},
	commentsContainer: {
		flex: 1,
	},
	commentsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	commentContainer: {
		marginBottom: 10,
	},
	commentUsername: {
		fontWeight: "bold",
		marginBottom: 5,
	},
	commentText: {
		fontSize: 14,
	},
	viewComments: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		fontSize: 14,
		color: "#007AFF",
	},
});

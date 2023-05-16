import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Button,
	FlatList,
	TextInput,
	Image,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

export default function Comment(props) {
	const [comments, setComments] = useState([]);
	const [postId, setPostId] = useState("");
	const [postImage, setPostImage] = useState("");
	const [caption, setCaption] = useState("");

	useEffect(() => {
		if (props.route.params.postId !== postId) {
			// Fetch post data
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

			// Fetch comments data
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
		<View>
			<Image source={{ uri: postImage }} style={styles.postImage} />
			<Text>{caption}</Text>
			<Text
				onPress={() =>
					props.navigation.navigate("Comment", {
						postId: postId,
						uid: props.route.params.uid,
					})
				}
			>
				View Comments...
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	postImage: {
		aspectRatio: 1 / 1,
	},
});

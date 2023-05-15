import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, FlatList } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { TextInput } from "react-native-paper";

export default function Comment(props) {
	const [comments, setComments] = useState([]);
	const [postId, setPostId] = useState("");
	const [text, setText] = useState("");

	useEffect(() => {
		if (props.route.params.postId !== postId) {
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
				});
			setPostId(props.route.params.postId);
		}
	}, [props.route.params.postId]);

	const onCommentSend = () => {
		firebase
			.firestore()
			.collection("posts")
			.doc(props.route.params.uid)
			.collection("userPosts")
			.doc(props.route.params.postId)
			.collection("comments")
			.add({ creator: firebase.auth().currentUser.uid, text });
	};

	return (
		<View>
			<FlatList
				numColumns={1}
				horizontal={false}
				data={comments}
				renderItem={({ item }) => (
					<View>
						<Text>{item.text}</Text>
					</View>
				)}
			/>

			<View>
				<TextInput
					placeholder="write a comment"
					onChangeText={(text) => setText(text)}
				/>
				<Button onPress={() => onCommentSend()} title="Send" />
			</View>
		</View>
	);
}

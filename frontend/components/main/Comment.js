import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUsersData } from "../../redux/actions/index";

import {
	StyleSheet,
	Text,
	View,
	Button,
	TouchableOpacity,
	FlatList,
	TextInput,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Comment = (props) => {
	const [comments, setComments] = useState([]);
	const [postId, setPostId] = useState("");
	const [text, setText] = useState("");

	useEffect(() => {
		const matchUserToComment = (comments) => {
			if (props.users === undefined) {
				// Handle the case when props.users is undefined
				return;
			}

			for (let i = 0; i < comments.length; i++) {
				if (comments[i].hasOwnProperty("user")) {
					continue;
				}

				const user = props.users.find((x) => x.uid === comments[i].creator);
				if (user === undefined) {
					props.fetchUsersData(comments[i].creator, false);
				} else {
					comments[i].user = user;
				}
			}
			setComments(comments);
		};

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
					matchUserToComment(comments);
				});
			setPostId(props.route.params.postId);
		} else {
			matchUserToComment(comments);
		}
	}, [props.route.params.postId, props.users]);

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

	const onDeleteComment = (commentId) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(props.route.params.uid)
			.collection("userPosts")
			.doc(props.route.params.postId)
			.collection("comments")
			.doc(commentId)
			.delete();
	};

	return (
		<View style={styles.container}>
			<View style={styles.commentSectionContainer}>
				<FlatList
					numColumns={1}
					horizontal={false}
					data={comments}
					renderItem={({ item }) => (
						<View style={styles.commentContainer}>
							{item.user !== undefined ? (
								<Text style={styles.userName}>{item.user.name}</Text>
							) : null}
							<Text style={styles.commentText}>{item.text}</Text>
							{item.creator === firebase.auth().currentUser.uid ? (
								<TouchableOpacity
									onPress={() => onDeleteComment(item.id)}
									style={styles.deleteButton}
								>
									<MaterialCommunityIcons
										name="trash-can-outline"
										size={24}
										color="#303030"
									/>
								</TouchableOpacity>
							) : null}
						</View>
					)}
				/>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Write a comment"
						onChangeText={(text) => setText(text)}
					/>
					<TouchableOpacity
						style={styles.buttonStyle}
						onPress={() => onCommentSend()}
						title="Send"
					>
						<Text style={styles.buttonText}>Post</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#333",
		paddingHorizontal: 16,
		alignItems: "center",
		paddingTop: 16,
		paddingBottom: 16,
	},
	commentSectionContainer: {
		paddingTop: 10,
		borderRadius: 12,
		maxWidth: 650,
		backgroundColor: "#424242",
		height: "100%",
		width: "100%",
	},
	commentContainer: {
		marginBottom: 12,
		backgroundColor: "#525252",
		paddingHorizontal: 16,
		paddingVertical: 10,
		marginHorizontal: 10,
		borderRadius: 5,
	},
	deleteButton: {
		position: "absolute",
		right: 10,
	},
	buttonText: {
		color: "#333",
		fontWeight: "400",
	},
	buttonStyle: {
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		width: 80,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	userName: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 4,
	},
	commentText: {
		color: "#fff",
		fontSize: 14,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 16,
		marginHorizontal: 16,
	},
	input: {
		borderRadius: 12,
		flex: 1,
		height: 40,
		backgroundColor: "#525252",
		borderRadius: 4,
		paddingHorizontal: 10,
		marginRight: 8,
		color: "#333",
	},
});

const mapStateToProps = (store) => ({
	users: store.usersState.users,
});

const mapDispatchToProps = (dispatch) =>
	bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Comment);

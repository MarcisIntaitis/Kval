import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, FlatList, Button } from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";

function Feed(props) {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		if (
			props.usersFollowingLoaded === props.following.length &&
			props.following.length !== 0
		) {
			props.feed.sort(function (x, y) {
				return y.creation - x.creation;
			});
			setPosts(props.feed);
		}
	}, [props.usersFollowingLoaded, props.feed]);

	const onLikePress = (userId, postId) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(userId)
			.collection("userPosts")
			.doc(postId)
			.collection("likes")
			.doc(firebase.auth().currentUser.uid)
			.set({});
	};

	const onDislikePress = (userId, postId) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(userId)
			.collection("userPosts")
			.doc(postId)
			.collection("likes")
			.doc(firebase.auth().currentUser.uid)
			.delete();
	};

	return (
		<View style={styles.container}>
			<View style={styles.container}>
				<FlatList
					numColumns={1}
					horizontal={false}
					data={posts}
					renderItem={({ item }) => (
						<View>
							<Text>{item.user && item.user.name}</Text>
							<Image style={styles.image} source={{ uri: item.downloadURL }} />
							<Text>{item.likesCount}</Text>
							{item.currentUserLike ? (
								<Button
									title="dislike"
									onPress={() => onDislikePress(item.user.uid, item.id)}
								/>
							) : (
								<Button
									title="like"
									onPress={() => onLikePress(item.user.uid, item.id)}
								/>
							)}
							<Text>{item.caption}</Text>
							<Text
								onPress={() =>
									props.navigation.navigate("Comment", {
										postId: item.id,
										uid: item.user.uid,
									})
								}
							>
								View Comments...
							</Text>
						</View>
					)}
				/>
			</View>
		</View>
	);
}

const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	feed: store.usersState.feed,
	usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	containerInfo: {
		flex: 1,
	},
	image: {
		flex: 1,
		aspectRatio: 1,
	},
	containerImage: {
		flex: 1,
	},
});

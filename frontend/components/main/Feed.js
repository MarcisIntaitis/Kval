import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	FlatList,
	TouchableOpacity,
	Platform,
	Dimensions,
} from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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

	const renderPost = ({ item }) => (
		<View style={styles.postContainer}>
			<View style={styles.postHeader}>
				<Image style={styles.profilePicture} source={item.user.profilePic} />
				<Text style={styles.userName}>{item.user && item.user.name}</Text>
			</View>
			<Image
				style={[
					styles.image,
					Platform.OS === "web" && styles.webImage, // Apply different style for web image
				]}
				source={{ uri: item.downloadURL }}
			/>
			<View style={styles.postFooter}>
				<TouchableOpacity
					onPress={() => {
						item.currentUserLike
							? onDislikePress(item.user.uid, item.id, (item.likesCount -= 1))
							: onLikePress(
									item.user.uid,
									item.id,
									item.likesCount === undefined
										? (item.likesCount = 1)
										: (item.likesCount += 1)
							  );
					}}
				>
					<MaterialCommunityIcons
						name={item.currentUserLike ? "heart" : "heart-outline"}
						color={item.currentUserLike ? "#FF0000" : "#333333"}
						size={26}
					/>
				</TouchableOpacity>
				<Text style={styles.likesCount}>{item.likesCount}</Text>
				<TouchableOpacity
					onPress={() =>
						props.navigation.navigate("Comment", {
							postId: item.id,
							uid: item.user.uid,
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
			<Text style={styles.caption}>{item.caption}</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={posts}
				renderItem={renderPost}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.feed}
			/>
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

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
	container: {
		paddingTop: 20,
		flex: 1,
		backgroundColor: "#333", // Set the background color to dark
	},
	feed: {
		paddingBottom: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	postContainer: {
		maxWidth: 1100,
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
	postHeader: {
		padding: 16,
	},
	userName: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	profilePicture: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
		backgroundColor: "black",
	},
	image: {
		aspectRatio: 1,
		resizeMode: "cover",
		width: "100%",
		height: 380,
	},
	webImage: {
		width: windowWidth - 32,
		height: "auto",
		maxWidth: 650,
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
	caption: {
		paddingHorizontal: 16,
		paddingBottom: 8,
		fontSize: 14,
		color: "#FFFFFF",
	},
});

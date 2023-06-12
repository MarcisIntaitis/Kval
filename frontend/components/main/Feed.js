import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	ScrollView,
	TouchableOpacity,
	Platform,
	Dimensions,
} from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

function Feed(props) {
	const [visiblePosts, setVisiblePosts] = useState([]);
	const [allPosts, setAllPosts] = useState([]);

	useEffect(() => {
		if (
			props.usersFollowingLoaded === props.following.length &&
			props.following.length !== 0
		) {
			props.feed.sort(function (x, y) {
				return y.creation - x.creation;
			});
			setAllPosts(props.feed);
			setVisiblePosts(props.feed.slice(0, 2)); // Initially show 10 posts
		}
	}, [props.usersFollowingLoaded, props.feed]);

	const loadMorePosts = () => {
		const currentVisibleCount = visiblePosts.length;
		const nextPosts = allPosts.slice(
			currentVisibleCount,
			currentVisibleCount + 2
		);
		setVisiblePosts((prevPosts) => [...prevPosts, ...nextPosts]);
	};

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

	const renderPost = (item) => (
		<View style={styles.postContainer} key={item.id}>
			<TouchableOpacity
				style={styles.postHeader}
				onPress={() =>
					props.navigation.navigate("Profile", { uid: item.user.uid })
				}
			>
				<Image
					style={styles.profilePicture}
					source={{ uri: item.user.profilePic }}
				/>
				<Text style={styles.userName}>{item.user && item.user.name}</Text>
			</TouchableOpacity>
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
			<ScrollView
				contentContainerStyle={styles.feed}
				onScroll={(event) => {
					const offsetY = event.nativeEvent.contentOffset.y;
					const contentHeight = event.nativeEvent.contentSize.height;
					if (offsetY >= contentHeight - 2 * Dimensions.get("window").height) {
						loadMorePosts();
					}
				}}
				scrollEventThrottle={400}
			>
				{visiblePosts.map(renderPost)}
			</ScrollView>
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
		backgroundColor: "#333",
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
	profilePicture: {
		aspectRatio: 1,
		resizeMode: "cover",
		width: 50,
		height: 50,
		borderRadius: 8,
		backgroundColor: "#FFFFFF",
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

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
	RefreshControl,
} from "react-native";
import { connect } from "react-redux";
import firebase from "firebase/compat/app";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Feed = ({ following, feed, usersFollowingLoaded, navigation }) => {
	const [visiblePosts, setVisiblePosts] = useState([]);
	const [allPosts, setAllPosts] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [likes, setLikes] = useState([]);

	const fetchLikedUserIds = async (userId, postId) => {
		try {
			const likesSnapshot = await firebase
				.firestore()
				.collection("posts")
				.doc(userId)
				.collection("userPosts")
				.doc(postId)
				.collection("likes")
				.get();
			const likedUserIds = likesSnapshot.docs.map((doc) => doc.id);
			setLikes(likedUserIds);
		} catch (error) {
			console.log("Error fetching liked user IDs:", error);
		}
	};
	fetchLikedUserIds();

	useEffect(() => {
		if (usersFollowingLoaded === following.length && following.length !== 0) {
			feed.sort((x, y) => y.creation - x.creation);
			setAllPosts(feed);
			setVisiblePosts(feed.slice(0, 2)); // Initially show 2 posts
		}
	}, [usersFollowingLoaded, feed]);

	const loadMorePosts = () => {
		const currentVisibleCount = visiblePosts.length;
		const nextPosts = allPosts.slice(
			currentVisibleCount,
			currentVisibleCount + 2
		);
		setVisiblePosts((prevPosts) => [...prevPosts, ...nextPosts]);
	};

	const onLikePress = (userId, postId) => {
		try {
			const updatedLikes = [...likes, firebase.auth().currentUser.uid];
			setLikes(updatedLikes);
			firebase
				.firestore()
				.collection("posts")
				.doc(userId)
				.collection("userPosts")
				.doc(postId)
				.collection("likes")
				.doc(firebase.auth().currentUser.uid)
				.set({});
		} catch (error) {
			console.log("Error liking post:", error);
		}
	};

	const onDislikePress = (userId, postId) => {
		try {
			const updatedLikes = likes.filter(
				(userId) => userId !== firebase.auth().currentUser.uid
			);
			setLikes(updatedLikes);
			firebase
				.firestore()
				.collection("posts")
				.doc(userId)
				.collection("userPosts")
				.doc(postId)
				.collection("likes")
				.doc(firebase.auth().currentUser.uid)
				.delete();
		} catch (error) {
			console.log("Error disliking post:", error);
		}
	};

	const refreshFeed = () => {
		setRefreshing(true);
		fetchNewPosts().then((newPosts) => {
			setAllPosts(newPosts);
			setVisiblePosts(newPosts.slice(0, 2));
			setRefreshing(false);
		});
	};

	const fetchNewPosts = async () => {
		try {
			const postsRef = firebase.firestore().collection("posts");

			const querySnapshot = await postsRef.get();

			const newPosts = [];

			// Create an array of promises
			const promises = querySnapshot.docs.map(async (userDoc) => {
				const userId = userDoc.id;
				const userPostsRef = userDoc.ref.collection("userPosts");
				const userPostsSnapshot = await userPostsRef
					.orderBy("creation", "desc")
					.limit(10)
					.get();

				userPostsSnapshot.forEach((postDoc) => {
					const postData = postDoc.data();
					newPosts.push(postData);
				});
			});
			console.log(querySnapshot);

			// Wait for all promises to resolve
			await Promise.all(promises);

			return newPosts;
		} catch (error) {
			console.error("Error fetching new posts:", error);
			return [];
		}
	};

	return (
		<View style={styles.container}>
			{visiblePosts.length === 0 ? (
				<View style={styles.noPostsContainer}>
					<Text style={styles.noPostsText}>There are no posts to show</Text>
				</View>
			) : null}
			<ScrollView
				contentContainerStyle={styles.feed}
				scrollEventThrottle={200}
				onScroll={(event) => {
					const offsetY = event.nativeEvent.contentOffset.y;
					const contentHeight = event.nativeEvent.contentSize.height;
					if (offsetY >= contentHeight - 2 * Dimensions.get("window").height) {
						loadMorePosts();
					}
				}}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={refreshFeed} />
				}
			>
				{visiblePosts.map((item) => (
					<View style={styles.postContainer} key={item.id}>
						<TouchableOpacity
							style={styles.postHeader}
							onPress={() =>
								navigation.navigate("Profile", { uid: item.user.uid })
							}
						>
							<Image
								style={styles.profilePicture}
								source={{ uri: item.user.profilePic }}
							/>
							<Text style={styles.userName}>{item.user && item.user.name}</Text>
						</TouchableOpacity>
						<Image
							style={[styles.image, Platform.OS === "web" && styles.webImage]}
							source={{ uri: item.downloadURL }}
						/>
						<View style={styles.postFooter}>
							<TouchableOpacity
								onPress={() => {
									item.currentUserLike
										? (onDislikePress(item.user.uid, item.id),
										  item.likesCount === 1
												? (item.likesCount = undefined)
												: (item.likesCount -= 1))
										: (onLikePress(item.user.uid, item.id),
										  item.likesCount === undefined
												? (item.likesCount = 1)
												: (item.likesCount += 1));
								}}
							>
								<MaterialCommunityIcons
									name={item.currentUserLike ? "heart" : "heart-outline"}
									color={item.currentUserLike ? "#FF0000" : "#333333"}
									size={26}
								/>
							</TouchableOpacity>
							<Text style={styles.likesCount}>
								{item.likesCount === 0
									? (item.likesCount = undefined)
									: item.likesCount}
							</Text>
							<TouchableOpacity
								onPress={() =>
									navigation.navigate("Comment", {
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
				))}
			</ScrollView>
		</View>
	);
};

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
	noPostsContainer: {
		marginHorizontal: 16,
		maxWidth: 600,
		width: "100%",
		height: 120,
		borderRadius: 8,
		backgroundColor: "#424242",
		shadowColor: "#000000",
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
		justifyContent: "center",
		alignSelf: "center",
		alignItems: "center",
	},
	noPostsText: {
		fontSize: 24,
		fontWeight: "bold",
		paddingLeft: 10,
		color: "#939393",
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

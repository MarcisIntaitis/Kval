import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	FlatList,
	Button,
	TouchableOpacity,
	TextInput,
	Modal,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { connect } from "react-redux";

function Profile(props) {
	const [userPosts, setUserPosts] = useState([]);
	const [user, setUser] = useState(null);
	const [following, setFollowing] = useState(false);
	const [settings, setSettings] = useState(null);
	const [displayNameInput, setDisplayNameInput] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		const { currentUser, posts } = props;

		if (props.route.params.uid === firebase.auth().currentUser.uid) {
			setUser(currentUser);
			setUserPosts(posts);
		} else {
			firebase
				.firestore()
				.collection("users")
				.doc(props.route.params.uid)
				.get()
				.then((snapshot) => {
					if (snapshot.exists) {
						setUser(snapshot.data());
					} else {
						console.log("User does not exist");
					}
				});

			firebase
				.firestore()
				.collection("posts")
				.doc(props.route.params.uid)
				.collection("userPosts")
				.orderBy("creation", "desc")
				.get()
				.then((snapshot) => {
					let posts = snapshot.docs.map((doc) => {
						const data = doc.data();
						const id = doc.id;
						return {
							id,
							...data,
						};
					});
					setUserPosts(posts);
				});
		}

		if (props.following.indexOf(props.route.params.uid) > -1) {
			setFollowing(true);
		} else {
			setFollowing(false);
		}

		firebase
			.firestore()
			.collection("users")
			.doc(props.route.params.uid)
			.collection("settings")
			.doc("profile")
			.get()
			.then((snapshot) => {
				if (snapshot.exists) {
					setSettings(snapshot.data());
				} else {
					console.log("Settings not found");
				}
			});
	}, [props.route.params.uid, props.following]);

	const onSaveSettings = () => {
		const trimmedName = displayNameInput.trim();
		if (trimmedName === "") {
			console.log("Display name cannot be empty");
			return;
		}

		firebase
			.firestore()
			.collection("users")
			.doc(props.route.params.uid)
			.update({ name: trimmedName })
			.then(() => {
				console.log("Name updated successfully");
				setUser((prevUser) => ({ ...prevUser, name: trimmedName }));
				setIsModalVisible(false);
			})
			.catch((error) => {
				console.log("Error updating name:", error);
			});
	};

	const onFollow = () => {
		firebase
			.firestore()
			.collection("following")
			.doc(firebase.auth().currentUser.uid)
			.collection("userFollowing")
			.doc(props.route.params.uid)
			.set({});
	};

	const onUnfollow = () => {
		firebase
			.firestore()
			.collection("following")
			.doc(firebase.auth().currentUser.uid)
			.collection("userFollowing")
			.doc(props.route.params.uid)
			.delete();
	};

	const onLogout = () => {
		firebase.auth().signOut();
	};

	if (user === null) {
		return <View />;
	}

	return (
		<View style={styles.container}>
			<View style={styles.profileContainer}>
				<View style={styles.containerInfo}>
					<Text style={styles.userName}>{user.name}</Text>

					{props.route.params.uid !== firebase.auth().currentUser.uid ? (
						<View>
							{following ? (
								<Button title="Unfollow" onPress={() => onUnfollow()} />
							) : (
								<Button title="Follow" onPress={() => onFollow()} />
							)}
						</View>
					) : (
						<Button title="Logout" onPress={() => onLogout()} />
					)}
				</View>

				{props.route.params.uid === firebase.auth().currentUser.uid && (
					<View style={styles.containerSettings}>
						<Button title="Settings" onPress={() => setIsModalVisible(true)} />

						<Modal visible={isModalVisible} animationType="slide">
							<View style={styles.modalContainer}>
								<Text style={styles.modalTitle}>Settings</Text>
								<View style={styles.modalItem}>
									<Text style={styles.modalLabel}>Display Name:</Text>
									<TextInput
										style={styles.modalInput}
										value={displayNameInput}
										onChangeText={(text) => setDisplayNameInput(text)}
									/>
								</View>
								<Button
									title="Save Settings"
									onPress={onSaveSettings}
									disabled={!displayNameInput}
								/>
								<Button
									title="Close"
									onPress={() => setIsModalVisible(false)}
								/>
							</View>
						</Modal>
					</View>
				)}

				<View style={styles.containerGallery}>
					<FlatList
						numColumns={4}
						data={userPosts}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<TouchableOpacity
								style={styles.containerImage}
								onPress={() =>
									props.navigation.navigate("Post", {
										postId: item.id,
										uid: props.route.params.uid,
									})
								}
							>
								<Image
									style={styles.image}
									source={{ uri: item.downloadURL }}
								/>
							</TouchableOpacity>
						)}
					/>
				</View>
			</View>
		</View>
	);
}

const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
	following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 20,
		alignItems: "center",
		backgroundColor: "#333",
	},
	profileContainer: {
		borderRadius: 12,
		flex: 1,
		paddingTop: 30,
		width: "100%",
		maxWidth: 900,
		backgroundColor: "#424242",
	},
	containerInfo: {
		marginHorizontal: 20,
		marginBottom: 20,
		backgroundColor: "#424242",
	},
	userName: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
		color: "white",
	},
	containerSettings: {
		marginHorizontal: 20,
		marginTop: 20,
		backgroundColor: "#424242",
		padding: 10,
		borderRadius: 8,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#333",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
		color: "white",
	},
	modalItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	modalLabel: {
		flex: 1,
		color: "white",
	},
	modalInput: {
		flex: 2,
		backgroundColor: "white",
		padding: 8,
		borderRadius: 4,
	},
	containerGallery: {
		flex: 1,
		backgroundColor: "#333",
	},
	containerImage: {
		flex: 1 / 4,
	},
	image: {
		flex: 1,
		aspectRatio: 1 / 1,
	},
});

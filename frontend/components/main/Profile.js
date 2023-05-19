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
import { Feather } from "@expo/vector-icons"; // Import Feather icon library
import { MaterialCommunityIcons } from "@expo/vector-icons";

function Profile(props) {
	const [userPosts, setUserPosts] = useState([]);
	const [user, setUser] = useState(null);
	const [following, setFollowing] = useState(false);
	const [settings, setSettings] = useState(null);
	const [displayNameInput, setDisplayNameInput] = useState("");
	const [profilePicURL, setProfilePicURL] = useState("");
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
		let trimmedName = displayNameInput.trim();
		if (trimmedName === "") {
			trimmedName = user.name;
			if (trimmedName === "‎") {
				console.log("Display name cannot be empty");
				return;
			}
		}
		setProfilePic(profilePicURL); // Call setProfilePic with profilePicURL state
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

	const setProfilePic = (profilePicUrl) => {
		firebase
			.firestore()
			.collection("users")
			.doc(props.route.params.uid)
			.update({ profilePic: profilePicUrl })
			.then(() => {
				console.log("Profile picture updated successfully");
				setProfilePicURL(profilePicUrl);
			})
			.catch((error) => {
				console.log("Error updating profile picture:", error);
			});
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
					<Image style={styles.profilePicture} source={user.profilePic} />
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
						<TouchableOpacity
							style={styles.settingsIconContainer}
							onPress={() => setIsModalVisible(true)}
						>
							<Feather name="settings" size={24} color="white" />
						</TouchableOpacity>
					)}
				</View>

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

			<Modal visible={isModalVisible} animationType="slide">
				<View style={styles.container}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Settings</Text>
						<View style={styles.modalItem}>
							<TextInput
								style={styles.modalInput}
								value={displayNameInput}
								placeholder={user.name}
								onChangeText={(text) => setDisplayNameInput(text)}
							/>
						</View>
						<View style={styles.modalItem}>
							<TextInput
								style={styles.modalInput}
								value={profilePicURL}
								placeholder="Profile pic url"
								onChangeText={(text) => setProfilePicURL(text)}
							/>
						</View>

						<TouchableOpacity
							style={styles.buttonStyle}
							onPress={onSaveSettings}
							title="Send"
						>
							<Text style={styles.buttonText}>Save Settings</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.settingsCloseIconContainer}
							onPress={() => setIsModalVisible(false)}
						>
							<MaterialCommunityIcons
								name="arrow-left-bold-outline"
								size={26}
								color="white"
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.logoutIconContainer}
							onPress={() => onLogout()}
						>
							<MaterialCommunityIcons name="logout" size={24} color="white" />
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
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
	profilePicture: {
		width: 90,
		height: 90,
		borderRadius: 20,
		marginRight: 10,
		backgroundColor: "black",
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
		alignItems: "center",
		flexDirection: "row",
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
	settingsIconContainer: {
		position: "absolute",
		right: 10,
	},
	settingsCloseIconContainer: {
		position: "absolute",
		top: 5,
		left: 10,
		padding: 10,
	},
	logoutIconContainer: {
		position: "absolute",
		top: 10,
		right: 10,
		padding: 10,
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
	modalContainer: {
		flex: 1,
		backgroundColor: "#424242",
		paddingTop: 20,
		paddingHorizontal: 20,
		borderRadius: 12,
		width: "100%",
		maxWidth: 900,
		alignItems: "center",
	},
	buttonStyle: {
		position: "absolute",
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		bottom: 20,
		width: 300,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	modalTitle: {
		fontSize: 18,
		paddingBottom: 20,
		fontWeight: "bold",
		marginBottom: 10,
		color: "white",
	},
	modalInput: {
		borderRadius: 5,
		flex: 1,
		height: 40,
		backgroundColor: "#525252",
		borderRadius: 4,
		paddingHorizontal: 10,
		marginRight: 8,
		color: "#333",
		width: 500,
	},
	modalItem: {
		flexDirection: "row",
		marginBottom: 8,
	},
	modalLabel: {
		flex: 1,
		color: "white",
	},
});

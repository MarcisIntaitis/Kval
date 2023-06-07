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
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

function Profile(props) {
	const [userPosts, setUserPosts] = useState([]);
	const [user, setUser] = useState(null);
	const [following, setFollowing] = useState(false);
	const [displayNameInput, setDisplayNameInput] = useState("");
	const [bioInfo, setBioInfo] = useState("");
	const [profilePicURL, setProfilePicURL] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [image, setImage] = useState(null);
	const [isImageSelected, setIsImageSelected] = useState(false);

	const pickPfp = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.cancelled) {
			setImage(result.uri);
			setIsImageSelected(true);
		}
	};

	//Upload the selected image to storage and set the profilePic value to the link of the image
	const uploadPfp = async (image) => {
		const currentUser = firebase.auth().currentUser;
		const userId = currentUser.uid;
		const storageRef = firebase.storage().ref();

		const childPath = `profilePictures/${userId}/${Math.random().toString(36)}`;
		const response = await fetch(image);
		const blob = await response.blob();

		const task = storageRef.child(childPath).put(blob);

		const taskProgress = (snapshot) => {
			console.log(`transferred: ${snapshot.bytesTransferred}`);
		};

		const taskCompleted = () => {
			task.snapshot.ref.getDownloadURL().then((snapshot) => {
				savePfpData(snapshot, childPath);
			});
		};

		const taskError = (snapshot) => {
			console.log(snapshot);
		};

		task.on("state_changed", taskProgress, taskError, taskCompleted);
	};

	const savePfpData = async (downloadURL, childPath) => {
		const currentUser = firebase.auth().currentUser;
		const userId = currentUser.uid;
		const storageRef = firebase.storage().ref();
		setProfilePicURL(downloadURL);

		// Retrieve the user document
		firebase
			.firestore()
			.collection("users")
			.doc(userId)
			.get()
			.then((doc) => {
				const userData = doc.data();
				const currentProfilePic = userData.profilePic;

				var picURL = currentProfilePic.substring(
					currentProfilePic.lastIndexOf(".") - 1
				);
				const extractedString = picURL.split("?")[0];

				if (currentProfilePic !== "") {
					storageRef
						.child(`profilePictures/${userId}/${extractedString}`)
						.delete()
						.then(() => {
							firebase
								.firestore()
								.collection("users")
								.doc(userId)
								.update({
									profilePic: downloadURL,
								})
								.then(() => {
									setProfilePicURL(downloadURL);
								})
								.catch((error) => {
									console.log("Error updating profile picture:", error);
								});
						})
						.catch((error) => {
							console.log("Error deleting old profile picture:", error);
						});
				} else {
					firebase
						.firestore()
						.collection("users")
						.doc(userId)
						.update({ profilePic: downloadURL })
						.then(() => {
							console.log("Profile picture updated successfully");
							setProfilePicURL(downloadURL);
						})
						.catch((error) => {
							console.log("Error updating profile picture:", error);
						});
				}
			})
			.catch((error) => {
				console.log("Error getting user data:", error);
			});
	};
	useEffect(() => {
		const { currentUser, posts } = props;

		//Fetches user data to display
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
	}, [props.route.params.uid, props.following]);

	const onSaveSettings = () => {
		let trimmedName = displayNameInput.trim();
		if (trimmedName === "") {
			trimmedName = user.name;
			if (trimmedName === "") {
				console.log("Display name cannot be empty");
				return;
			}
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

		firebase
			.firestore()
			.collection("users")
			.doc(props.route.params.uid)
			.update({ bio: bioInfo })
			.then(() => {
				console.log("Bio updated successfully");
				setUser((prevUser) => ({ ...prevUser, bio: bioInfo }));
				setIsModalVisible(false);
			})
			.catch((error) => {
				console.log("Error updating bio:", error);
			});
	};

	const handleSave = () => {
		if (image) {
			setProfilePicURL(image); // Update the profile picture URL immediately on the user side
			uploadPfp(image);
		}
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
					<Image
						style={styles.profilePicture}
						source={{ uri: user.profilePic }}
					/>
					<View style={styles.userInfo}>
						<Text style={styles.userName}>{user.name}</Text>
						<Text style={styles.userBio}>{user.bio}</Text>
					</View>

					{props.route.params.uid !== firebase.auth().currentUser.uid ? (
						<View style={styles.followButtons}>
							{following ? (
								<TouchableOpacity
									onPress={() => onUnfollow()}
									style={styles.followButtons}
								>
									<Text style={styles.followButtonText}>FOLLOWING</Text>
								</TouchableOpacity>
							) : (
								<TouchableOpacity
									onPress={() => onFollow()}
									style={styles.followButtons}
								>
									<Text style={styles.followButtonText}>FOLLOW</Text>
								</TouchableOpacity>
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
								activeOpacity={0.8}
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
								value={bioInfo}
								placeholder={user.bio === "" ? "Enter your bio" : user.bio}
								onChangeText={(text) => setBioInfo(text)}
							/>
						</View>

						<View style={styles.pfpSettingsContainer}>
							<Image
								style={styles.profilePictureSelect}
								source={{ uri: image }}
							/>
							<View style={styles.profilePicUpload}>
								<TouchableOpacity
									style={styles.buttonStyle}
									title="Pick from gallery"
									onPress={() => pickPfp()}
								>
									<Text style={styles.buttonText}>
										Select image from gallery
									</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View style={styles.saveSettingsConainer}>
							<TouchableOpacity
								style={styles.buttonStyle}
								onPress={() => {
									onSaveSettings();
									handleSave();
								}}
								title="Send"
							>
								<Text style={styles.buttonText}>Save Settings</Text>
							</TouchableOpacity>
						</View>

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
	profilePictureSelect: {
		width: 140,
		height: 140,
		borderRadius: 20,
		marginRight: 10,
		backgroundColor: "black",
		marginTop: 20,
	},
	profileContainer: {
		borderRadius: 12,
		flex: 1,
		paddingTop: 30,
		width: "100%",
		maxWidth: 900,
		backgroundColor: "#424242",
	},
	userInfo: {
		flex: 1,
		maxWidth: 600,
		width: "100%",
		flexGrow: 1,
		flexDirection: "column",
	},
	containerInfo: {
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
	userBio: {
		maxWidth: "90%",
		fontSize: 14,
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
	pfpSettingsContainer: {
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
	},
	profilePicUpload: {
		width: 100,
		paddingTop: 10,
		alignItems: "center",
		alignSelf: "center",
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
	},
	buttonStyle: {
		backgroundColor: "#9ade7c",
		paddingVertical: 8,
		paddingHorizontal: 16,
		width: 300,
		borderRadius: 20,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		paddingBottom: 20,
		fontWeight: "bold",
		marginBottom: 10,
		color: "white",
		alignSelf: "center",
	},
	modalInput: {
		borderRadius: 5,
		flex: 1,
		height: 40,
		backgroundColor: "#525252",
		borderRadius: 4,
		paddingHorizontal: 10,
		marginRight: 8,
		// color: "#333",
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
	saveSettingsConainer: {
		position: "absolute",
		bottom: 20,
		alignItems: "center",
		alignSelf: "center",
	},
	followButtons: {
		width: 90,
		height: 30,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		backgroundColor: "#9ade7c",
	},
	followButtonText: {
		fontWeight: 600,
		color: "#333",
	},
});

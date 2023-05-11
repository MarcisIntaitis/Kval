import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { connect } from "react-redux";

function Profile(props) {
	const [userPosts, setUserPosts] = useState([]);
	const [user, setUser] = useState(null);

	//fetches different user posts and profile info
	useEffect(() => {
		const { currentUser, posts } = props;
		console.log(currentUser, posts);

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
						console.log("doesnt exist");
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
	}, [props.route.params.uid]);

	//buffer so there are no errors in case user has not loaded yet (user.name might show null and crash)
	if (user === null) {
		return <View />;
	}
	return (
		<View style={styles.container}>
			<View style={styles.containerInfo}>
				<Text>{user.name}</Text>
				<Text>{user.email}</Text>
			</View>

			<View style={styles.containerGallery}>
				<FlatList
					numColumns={4}
					horizontal={false}
					data={userPosts}
					renderItem={({ item }) => (
						<View style={styles.containerImage}>
							<Image style={styles.image} source={{ uri: item.downloadURL }} />
						</View>
					)}
				/>
			</View>
		</View>
	);
}

const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
	posts: store.userState.posts,
});

export default connect(mapStateToProps, null)(Profile);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 40,
	},
	containerInfo: {
		margin: 20,
	},
	containerGallery: {
		marginLeft: 5,
		marginRight: 5,
		flex: 1,
	},
	image: {
		margin: 1,
		flex: 1,
		aspectRatio: 1 / 1,
	},
	containerImage: {
		flex: 1 / 4,
	},
});

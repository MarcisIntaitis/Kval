import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import { connect } from "react-redux";

function Feed(props) {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		let posts = [];
		console.log(props.users, props.following); // Add this line to check values
		if (props.usersLoaded == props.following.length) {
			for (let i = 0; i < props.following.length; i++) {
				const user = props.users.find((el) => el.uid === props.following[i]);
				if (user != undefined) {
					posts = [...posts, ...user.posts];
				}
			}
			posts.sort(function (x, y) {
				return x.creation - y.creation;
			});
			setPosts(posts);
		}
	}, [props.usersLoaded]);
	return (
		<View style={styles.container}>
			<View style={styles.container}>
				<FlatList
					numColumns={1}
					horizontal={false}
					data={posts}
					renderItem={({ item }) => (
						<View>
							<Text>{item.user.name}</Text>
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
	following: store.userState.following,
	users: store.usersState.users,
	usersLoaded: store.usersState.users.filter((user) => user.posts.length > 0)
		.length,
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
		aspectRatio: 1 / 1,
	},
	containerImage: {
		flex: 1,
	},
});

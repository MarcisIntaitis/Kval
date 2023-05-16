import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import { connect } from "react-redux";

function Feed(props) {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		if (
			props.usersFollowingLoaded === props.following.length &&
			props.following.length !== 0
		) {
			let posts = [];
			for (let i = 0; i < props.users.length; i++) {
				const user = props.users[i];
				if (user && user.posts && Array.isArray(user.posts)) {
					posts = [...posts, ...user.posts];
				}
			}
			posts.sort(function (x, y) {
				return y.creation.toDate() - x.creation.toDate();
			});
			setPosts(posts);
		}
		props.navigation.setParams({ param: "value" });
	}, [props.usersFollowingLoaded, props.following, props.users]);

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
	users: store.usersState.users,
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

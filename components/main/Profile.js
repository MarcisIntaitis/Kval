import React from "react";
import { StyleSheet, Text, View, Image, FlatList } from "react-native";

import { connect } from "react-redux";

function Profile(props) {
	const { currentUser, posts } = props;
	console.log(currentUser, posts);
	return (
		<View style={styles.container}>
			<View style={styles.containerInfo}>
				<Text>{currentUser.name}</Text>
				<Text>{currentUser.email}</Text>
			</View>

			<View style={styles.containerGallery}>
				<FlatList
					numColumns={4}
					horizontal={false}
					data={posts}
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

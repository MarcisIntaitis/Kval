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

			<View style={styles.containerGallery}></View>
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
		flex: 1,
	},
});

import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/compat/storage";
import EStyleSheet from "react-native-extended-stylesheet";
import { TextInput } from "react-native-paper";

EStyleSheet.build({});

export default function Search(props) {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");

	const fetchUsers = () => {
		let query = firebase.firestore().collection("users");

		if (search.trim() !== "") {
			query = query.where("name", ">=", search).limit(1);
		}

		query.get().then((snapshot) => {
			let users = [];
			snapshot.docs.forEach((doc) => {
				const data = doc.data();
				const id = doc.id;
				const user = { id, ...data };
				users.push(user);
			});
			setUsers(users);
		});
	};

	return (
		<View style={styles.container}>
			<View style={styles.searchContainer}>
				<TextInput
					placeholder={"Search..."}
					style={styles.searchInput}
					value={search}
					onChangeText={(text) => setSearch(text)}
					onChange={fetchUsers}
				/>
				<FlatList
					numColumns={1}
					horizontal={false}
					data={users}
					style={styles.flatListContainer}
					renderItem={({ item, index }) => (
						<TouchableOpacity
							style={[
								EStyleSheet.child(styles, "searchResult", index, users.length),
								index === users.length - 1,
							]}
							onPress={() =>
								props.navigation.navigate("Profile", { uid: item.id })
							}
						>
							<View style={styles.searchResultContainer}>
								<Image style={styles.avatar} source={item.profilePic} />
								<Text style={styles.textStyle}>{item.name}</Text>
							</View>
						</TouchableOpacity>
					)}
				/>
			</View>
		</View>
	);
}

const styles = EStyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#333",
		alignItems: "center",
	},
	searchContainer: {
		flex: 1,
		width: "100%",
		maxWidth: 900,
		backgroundColor: "#424242",
		marginTop: 20,
		borderRadius: 12,
		alignItems: "center",
		paddingHorizontal: 20,
	},
	searchInput: {
		width: "100%",
		marginTop: 12,
		height: 50,
		borderBottomStartRadius: 10,
		borderBottomEndRadius: 10,
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
	},
	flatListContainer: {
		flex: 1,
		width: "100%",
	},
	searchResult: {
		width: "100%",
		height: 60,
		backgroundColor: "#535353",
		marginTop: 4,
		borderBottomStartRadius: 5,
		borderBottomEndRadius: 5,
		borderTopRightRadius: 5,
		borderTopLeftRadius: 5,
	},
	"searchResult:last-child": {
		borderBottomStartRadius: 15,
		borderBottomEndRadius: 15,
	},
	searchResultContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 8,
	},
	avatar: {
		width: 40,
		height: 40,
		backgroundColor: "#000",
		borderRadius: 20,
	},
	textStyle: {
		paddingLeft: 5,
		fontSize: 18,
		fontWeight: 500,
		color: "#fff",
	},
});

import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/compat/storage";
import { TextInput } from "react-native-paper";

export default function Search(props) {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");

	const fetchUsers = () => {
		firebase
			.firestore()
			.collection("users")
			.where("name", ">=", search)
			.get()
			.then((snapshot) => {
				let users = snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					return { id, ...data };
				});
				setUsers(users);
			});
	};

	return (
		<View>
			<TextInput
				placeholder={"Search..."}
				value={search}
				onChangeText={(text) => setSearch(text)}
				onChange={fetchUsers}
			/>
			<FlatList
				numColumns={1}
				horizontal={false}
				data={users}
				renderItem={({ item }) => (
					<TouchableOpacity
						onPress={() =>
							props.navigation.navigate("Profile", { uid: item.id })
						}
					>
						<Text>{item.name}</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}

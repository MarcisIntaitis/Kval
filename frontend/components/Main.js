import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import React, { Component } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
	fetchUser,
	fetchUserPosts,
	fetchUserFollowing,
} from "../redux/actions/index";
import FeedScreen from "./main/Feed";
import SearchScreen from "./main/Search";
import ProfileScreen from "./main/Profile";
import ChatScreen from "./main/Chat";

const EmptyScreen = () => {
	return null;
};

const Tab = createMaterialBottomTabNavigator();

export class Main extends Component {
	componentDidMount() {
		this.props.fetchUser();
		this.props.fetchUserPosts();
		this.props.fetchUserFollowing();
	}

	render() {
		return (
			<Tab.Navigator
				initialRouteName="Feed"
				labeled={false}
				barStyle={{
					backgroundColor: "#292929", // Set the background color to dark
					borderTopColor: "#555", // Set the top border color to a darker shade
				}}
			>
				<Tab.Screen
					name="Feed"
					component={FeedScreen}
					options={{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="home" color={color} size={26} />
						),
					}}
				/>
				<Tab.Screen
					name="Search"
					component={SearchScreen}
					navigation={this.props.navigation}
					options={{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="magnify" color={color} size={26} />
						),
					}}
				/>
				<Tab.Screen
					name="AddContainer"
					component={EmptyScreen}
					listeners={({ navigation }) => ({
						tabPress: (event) => {
							event.preventDefault();
							navigation.navigate("Add");
						},
					})}
					options={{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="plus-box" color={color} size={26} />
						),
					}}
				/>
				<Tab.Screen
					name="Global Chat"
					component={ChatScreen}
					options={{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="message" color={color} size={26} />
						),
					}}
				/>
				<Tab.Screen
					name="Profile"
					component={ProfileScreen}
					listeners={({ navigation }) => ({
						tabPress: (event) => {
							event.preventDefault();
							navigation.navigate("Profile", {
								uid: firebase.auth().currentUser.uid,
							});
						},
					})}
					options={{
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons
								name="account-circle"
								color={color}
								size={26}
							/>
						),
					}}
				/>
			</Tab.Navigator>
		);
	}
}

const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
});

const mapDispatchToProps = (dispatch) =>
	bindActionCreators(
		{ fetchUser, fetchUserPosts, fetchUserFollowing },
		dispatch
	);

export default connect(mapStateToProps, mapDispatchToProps)(Main);

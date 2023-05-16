import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import React, { Component } from "react";
import { Text, View } from "react-native";
import { Provider } from "react-redux";
import { applyMiddleware, legacy_createStore as createStore } from "redux";
import thunk from "redux-thunk";
import LandingScreen from "./components/auth/Landing";
import LoginScreen from "./components/auth/Login";
import RegisterScreen from "./components/auth/Register";
import MainScreen from "./components/Main";
import AddScreen from "./components/main/Add";
import rootReducer from "./redux/reducers";
import SaveScreen from "./components/main/Save";
import CommentScreen from "./components/main/Comment";
import FullscreenPictureScreen from "./components/main/FullscreenPicture";

import {
	API_KEY,
	AUTH_DOMAIN,
	PROJECT_ID,
	STORAGE_BUCKET,
	MESSAGING_SENDER_ID,
	APP_ID,
	MEASUREMENT_ID,
} from "./config";

const store = createStore(rootReducer, applyMiddleware(thunk));

// Firebase config info for connecting to the api and so firebase works in general
const firebaseConfig = {
	apiKey: API_KEY,
	authDomain: AUTH_DOMAIN,
	projectId: PROJECT_ID,
	storageBucket: STORAGE_BUCKET,
	messagingSenderId: MESSAGING_SENDER_ID,
	appId: APP_ID,
	measurementId: MEASUREMENT_ID,
};

if (firebase.apps.length === 0) {
	firebase.initializeApp(firebaseConfig);
}

const Stack = createStackNavigator();

export class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
		};
	}

	//checks if the user is logged in and changes variables depending on the state
	componentDidMount() {
		firebase.auth().onAuthStateChanged((user) => {
			if (!user) {
				this.setState({
					loggedIn: false,
					loaded: true,
				});
			} else {
				this.setState({
					loggedIn: true,
					loaded: true,
				});
			}
		});
	}

	render() {
		const { loggedIn, loaded } = this.state;
		if (!loaded) {
			return (
				<View style={{ flex: 1, justifyContent: "center" }}>
					<Text> Loading </Text>
				</View>
			);
		}
		if (!loggedIn) {
			return (
				// Navigation between all of the screens (does not change the url of the page)
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Landing">
						<Stack.Screen
							name="Landing"
							component={LandingScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen name="Register" component={RegisterScreen} />
						<Stack.Screen name="Login" component={LoginScreen} />
					</Stack.Navigator>
				</NavigationContainer>
			);
		}
		return (
			<Provider store={store}>
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Main">
						<Stack.Screen
							name="Main"
							component={MainScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Add"
							component={AddScreen}
							options={{ headerShown: true }}
							navigation={this.props.navigation}
						/>
						<Stack.Screen name="Save" component={SaveScreen} />
						<Stack.Screen name="Comment" component={CommentScreen} />
						<Stack.Screen name="Post" component={FullscreenPictureScreen} />
					</Stack.Navigator>
				</NavigationContainer>
			</Provider>
		);
	}
}

export default App;

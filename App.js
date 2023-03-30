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
import rootReducer from "./redux/reducers";

const store = createStore(rootReducer, applyMiddleware(thunk));

// Firebase config info for connecting to the api
const firebaseConfig = {
	apiKey: "AIzaSyCYlkFfRksIVfMIKWo8ZyRMxynibwQPrT4",
	authDomain: "mobapp-eeaa3.firebaseapp.com",
	projectId: "mobapp-eeaa3",
	storageBucket: "mobapp-eeaa3.appspot.com",
	messagingSenderId: "659689891393",
	appId: "1:659689891393:web:f7d67b078774ca776808c0",
	measurementId: "G-MFT1T2MH91",
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
				// Navigation between all of the screens
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
					</Stack.Navigator>
				</NavigationContainer>
			</Provider>
		);
	}
}

export default App;

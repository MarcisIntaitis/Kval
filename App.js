import { StatusBar } from "expo-status-bar";
import React, { Component } from 'react'
import { StyleSheet, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import LandingScreen from "./components/auth/Landing";
import RegisterScreen from "./components/auth/Register";
import LoginScreen from "./components/auth/Login";

// Firebase config info for connecting to the api
const firebaseConfig = {
  apiKey: "AIzaSyCYlkFfRksIVfMIKWo8ZyRMxynibwQPrT4",
  authDomain: "mobapp-eeaa3.firebaseapp.com",
  projectId: "mobapp-eeaa3",
  storageBucket: "mobapp-eeaa3.appspot.com",
  messagingSenderId: "659689891393",
  appId: "1:659689891393:web:f7d67b078774ca776808c0",
  measurementId: "G-MFT1T2MH91"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

const Stack = createStackNavigator();


export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      
    }
  }
  
  componentDidMount(){
    firebase.auth().onAuthStateChanged((user) => {
      if(!user){
        this.setState({
          loggedIn: false,
          loaded: true,
        })
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        })
      }
    })
  }
  
  render() {
    const {loggedIn, loaded} = this.state;
    if(!loaded){
      return(
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text> Loading </Text>
        </View>
      )
    }
    if(!loggedIn){
      return (
        // Navigation between all of the screens
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="Register" component={RegisterScreen}/>
            <Stack.Screen name="Login" component={LoginScreen}/>
          </Stack.Navigator>
        </NavigationContainer>
      );
    } else {
      return(
        <View>
          <Text>Already logged in</Text>
        </View>
      )
    }
  }
}

export default App

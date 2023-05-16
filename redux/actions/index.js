import firebase from "firebase/compat/app";
import {
	USER_STATE_CHANGE,
	USER_POSTS_STATE_CHANGE,
	USER_FOLLOWING_STATE_CHANGE,
	USERS_DATA_STATE_CHANGE,
	USERS_POSTS_STATE_CHANGE,
} from "../constants/index";

//makes a call to firestore and checks if snapshot exists if it does then its able to get the data from the database
export function fetchUser() {
	return (dispatch) => {
		firebase
			.firestore()
			.collection("users")
			.doc(firebase.auth().currentUser.uid)
			.get()
			.then((snapshot) => {
				if (snapshot.exists) {
					dispatch({ type: USER_STATE_CHANGE, currentUser: snapshot.data() });
				} else {
					console.log("doesnt exist");
				}
				return snapshot.data(); // add this line to return the snapshot data
			});
	};
}

//same thing as the function above but with

export function fetchUserPosts() {
	return (dispatch) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(firebase.auth().currentUser.uid)
			.collection("userPosts")
			.orderBy("creation", "desc")
			.get()
			.then((snapshot) => {
				let posts = snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					return {
						id,
						...data,
					};
				});
				dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
			});
	};
}
//fetches the follow list to display in the feed
export function fetchUserFollowing() {
	return (dispatch) => {
		firebase
			.firestore()
			.collection("following")
			.doc(firebase.auth().currentUser.uid)
			.collection("userFollowing")
			.onSnapshot((snapshot) => {
				let following = snapshot.docs.map((doc) => {
					const id = doc.id;
					return id;
				});
				dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
				for (let i = 0; i < following.length; i++) {
					dispatch(fetchUsersData(following[i], true));
				}
			});
	};
}
export function fetchUsersData(uid, getPosts) {
	return (dispatch, getState) => {
		const found = getState().usersState.users.some((el) => el.uid === uid);
		if (!found) {
			firebase
				.firestore()
				.collection("users")
				.doc(uid)
				.get()
				.then((snapshot) => {
					if (snapshot.exists) {
						let user = snapshot.data();
						user.uid = snapshot.id;

						dispatch({ type: USERS_DATA_STATE_CHANGE, user });
					}
				});
			if (getPosts) {
				dispatch(fetchUsersFollowingPosts(uid));
			}
		}
	};
}

export function fetchUsersFollowingPosts(uid) {
	return (dispatch, getState) => {
		firebase
			.firestore()
			.collection("posts")
			.doc(uid)
			.collection("userPosts")
			.orderBy("creation", "asc")
			.get()
			.then((snapshot) => {
				//goes to the path since the async function jumps ahead and cant keep track of the uid
				const uid = snapshot._delegate.query._query.path.segments[1];
				const user = getState().usersState.users.find((el) => el.uid === uid);

				let posts = snapshot.docs.map((doc) => {
					const data = doc.data();
					const id = doc.id;
					return { id, ...data, user };
				});
				dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid });
			});
	};
}

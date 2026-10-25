const firebaseConfig = {
    apiKey: "AIzaSyD1a29uuP_U9MAXyIhsXJuAEzscqayKHY0",
    authDomain: "campuscart-d3a5e.firebaseapp.com",
    projectId: "campuscart-d3a5e",
    storageBucket: "campuscart-d3a5e.firebasestorage.app",
    messagingSenderId: "363651731828",
    appId: "1:363651731828:web:6fef2a665dd7db1daedc21",
    measurementId: "G-454956DHYV"
};

// Check whether the Firebase SDK loaded successfully.
if (typeof firebase === "undefined") {
    console.error(
        "Firebase SDK not loaded. Check your internet connection."
    );
} else {
    // Initialize only once.
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Make Firestore available to script.js.
    window.db = firebase.firestore();

    console.log("Firebase initialized successfully.");
}


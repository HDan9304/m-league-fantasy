<!-- js/firebase.js -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<script>
  const firebaseConfig = {
    apiKey: "AIzaSyBvMqEEIU6B6TYxLCsf2tRGSbSe_PtYu80",
    authDomain: "m-league-fantasy-7460c.firebaseapp.com",
    projectId: "m-league-fantasy-7460c",
    storageBucket: "m-league-fantasy-7460c.firebasestorage.app",
    messagingSenderId: "16232427026",
    appId: "1:16232427026:web:6c59e99bba1ddc7eeaf2cb"
  };

  firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();
</script>

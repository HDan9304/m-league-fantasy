auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = db.collection("users").doc(user.uid);

  userRef.get().then(doc => {
    if (doc.exists) {
      const data = doc.data();

      // BANNED USER
      if (data.status === "banned") {
        alert("You are banned / Anda telah disekat");
        auth.signOut();
        return;
      }

      // PROFILE LOCKED
      if (data.teamName) {
        document.getElementById("lockedMessage").style.display = "block";
      } else {
        document.getElementById("profileCard").style.display = "block";
      }
    } else {
      // First-time user
      document.getElementById("profileCard").style.display = "block";
    }
  });
});

function saveProfile() {
  const name = document.getElementById("displayName").value.trim();
  const teamName = document.getElementById("teamName").value.trim();
  const user = auth.currentUser;

  if (!name || !teamName) {
    document.getElementById("message").innerText =
      "Please fill all fields / Sila isi semua";
    return;
  }

  db.collection("users").doc(user.uid).set({
    name: name,
    teamName: teamName,
    status: "active",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    location.reload();
  });
}

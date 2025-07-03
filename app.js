// Initialize Firebase auth and firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Load stories and comments when index.html is open
document.addEventListener('DOMContentLoaded', () => {
  const storySection = document.querySelector('.story');

  if (!storySection) return; // skip if not on home page

  db.collection("stories")
    .orderBy("timestamp", "desc")
    .limit(5)
    .get()
    .then(snapshot => {
      storySection.innerHTML = ""; // clear placeholder

      snapshot.forEach(doc => {
        const story = doc.data();
        const storyEl = document.createElement("div");
        storyEl.classList.add("story");
        storyEl.innerHTML = `
          <div class="author-date">Author: ${story.author} | Date: ${new Date(story.timestamp.toDate()).toLocaleDateString()}</div>
          <div class="story-title">${story.title}</div>
          <p>${story.content}</p>
          <div class="comment-box">
            <h3>ހިޔާލު</h3>
            <textarea id="comment-${doc.id}" placeholder="ތިޔަ ހިޔާލު ލިޔުން..."></textarea>
            <br>
            <button onclick="submitComment('${doc.id}')">ފޮނުވާ</button>
          </div>
        `;
        storySection.appendChild(storyEl);
      });
    });
});

// Submit comment
function submitComment(storyId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please login to comment.");
    return;
  }

  const textarea = document.querySelector(`#comment-${storyId}`);
  const text = textarea.value.trim();
  if (!text) return;

  db.collection("stories")
    .doc(storyId)
    .collection("comments")
    .add({
      text,
      user: user.displayName || user.email,
      phone: user.phoneNumber || "",
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      textarea.value = "";
      alert("Comment sent!");
    });
}
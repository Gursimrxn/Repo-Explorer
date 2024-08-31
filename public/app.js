import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    GithubAuthProvider,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBaQAgzI9GAwgmMb0Q4DMTTjtFM5s8uNbU",
    authDomain: "whatisfirebaseidk.firebaseapp.com",
    projectId: "whatisfirebaseidk",
    storageBucket: "whatisfirebaseidk.appspot.com",
    messagingSenderId: "1025606226525",
    appId: "1:1025606226525:web:eefe4934256e2c6ab2f3b4",
    measurementId: "G-3SN3QTTC9J",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GithubAuthProvider();
provider.addScope("repo"); // Request the repo scope

// DOM Elements
const githubSignInBtn = document.getElementById("githubSignInBtn");
const githubSignInBtnMobile = document.getElementById("githubSignInBtnMobile");
const signOutBtn = document.getElementById("signOutBtn");
const profileContainer = document.getElementById("profileContainer");
const profilePic = document.getElementById("profilePic");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const whenSignedInContent = document.getElementById("whenSignedInContent");
const whenSignedOutContent = document.getElementById("whenSignedOutContent");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorContainer = document.getElementById("errorContainer");
const repoContainer = document.getElementById("repoContainer");

// Sign-In Functionality
const signIn = async () => {
    try {
        showLoading(true);
        const result = await signInWithPopup(auth, provider);
        console.log("Sign-in result:", result);

        const credential = GithubAuthProvider.credentialFromResult(result);
        console.log("Credential:", credential);

        if (credential) {
            const token = credential.accessToken;
            const user = result.user;
            console.log("User signed in:", user); // Debugging
            console.log("GitHub Access Token:", token); // Debugging
            await updateRepoDashboard(token); // Use the GitHub Access Token
            showSignedInUI(user);
        } else {
            throw new Error("Failed to retrieve GitHub access token.");
        }
    } catch (error) {
        console.error("Sign-in error:", error); // Debugging
        showError(error.message);
    } finally {
        showLoading(false);
    }
};

// Sign-Out Functionality
const signOutUser = async () => {
    try {
        showLoading(true);
        await signOut(auth);
        showSignedOutUI();
    } catch (error) {
        console.error("Sign-out error:", error); // Debugging
        showError(error.message);
    } finally {
        showLoading(false);
    }
};

// Fetch GitHub Repositories
async function fetchGitHubRepos(token) {
    const url = 'https://api.github.com/user/repos';
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch repositories: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch repositories:', error);
        showError(`Failed to fetch repositories: ${error.message}`);
        return [];
    }
}

// Update Repo Dashboard
const updateRepoDashboard = async (token) => {
    try {
        const repos = await fetchGitHubRepos(token);
        if (repos.length === 0) {
            repoContainer.innerHTML = "<p>No repositories found.</p>";
            return;
        }
        repoContainer.innerHTML = ""; // Clear existing repo data
        repos.forEach((repo) => {
            const repoCard = document.createElement("div");
            repoCard.classList.add(
                "max-w-md",
                "mx-auto",
                "bg-white",
                "shadow-lg",
                "rounded-lg",
                "overflow-hidden",
                "mb-4" // Added margin bottom for spacing
            );
            repoCard.innerHTML = `
                <div class="relative">
                    <a href="${repo.html_url}" class="github-corner absolute top-0 right-0 p-2" aria-label="View source on GitHub">
                        <svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff;" aria-hidden="true">
                            <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
                            <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
                            <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
                        </svg>
                    </a>
                    <div class="text-center px-4 py-6 bg-white shadow-lg rounded-lg">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">${repo.name}</h3>
                        <p class="text-sm font-medium text-gray-600 mb-4">${repo.description || 'No description'}</p>
                        <div class="flex justify-center gap-6 mb-4">
                            <div>
                                <p class="text-sm text-gray-600">Stars</p>
                                <p class="text-lg font-semibold text-gray-800">${repo.stargazers_count}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Forks</p>
                                <p class="text-lg font-semibold text-gray-800">${repo.forks_count}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Language</p>
                                <p class="text-lg font-semibold text-gray-800">${repo.language || 'N/A'}</p>
                            </div>
                        </div>
                        <div class="flex justify-center">
                            <a href="${repo.html_url}" target="_blank" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Repository</a>
                        </div>
                    </div>
                </div>
            `;
            repoContainer.appendChild(repoCard);
        });
    } catch (error) {
        console.error('Failed to update repository dashboard:', error);
        showError(`Failed to update repository dashboard: ${error.message}`);
    }
};

// Show Loading Spinner
const showLoading = (isLoading) => {
    loadingSpinner.style.display = isLoading ? "block" : "none";
};

// Show Error Message
const showError = (message) => {
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
};

// Hide Error Message
const hideError = () => {
    errorContainer.style.display = "none";
};

// Show Signed In UI
const showSignedInUI = (user) => {
    profileContainer.style.display = "block";
    whenSignedInContent.style.display = "block";
    whenSignedOutContent.style.display = "none";

    profilePic.src = user.photoURL || "https://via.placeholder.com/150";
    profileName.textContent = user.displayName || "No name";
    profileEmail.textContent = user.email || "No email";
};

// Show Signed Out UI
const showSignedOutUI = () => {
    profileContainer.style.display = "none";
    whenSignedInContent.style.display = "none";
    whenSignedOutContent.style.display = "block";
};

// Check Authentication State on Document Load
const checkAuthStateOnLoad = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            showSignedInUI(user);
        } else {
            showSignedOutUI();
        }
    });
};

// Event Listeners
githubSignInBtn.addEventListener("click", signIn);
githubSignInBtnMobile.addEventListener("click", signIn);
signOutBtn.addEventListener("click", signOutUser);

// Initial Check
checkAuthStateOnLoad();

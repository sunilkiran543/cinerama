import React, { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Check,
  Edit3,
  Heart,
  Home,
  LogIn,
  MessageCircle,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  UserPlus,
  Users
} from "lucide-react";

const h = React.createElement;
const DATA_KEY = "nexus.social.data";
const topics = ["Build Log", "React", "Firebase", "Design", "AI Assist", "Launch"];
const starterData = {
  activeUserId: "user-kiran",
  profiles: [
    {
      id: "user-kiran",
      name: "Kiran Sunil",
      handle: "kiran",
      headline: "Building polished products with React, TypeScript, Firebase, and a little AI momentum.",
      location: "San Francisco, CA",
      avatar: "KS",
      accent: "#2f6fed",
      joinedAt: "2026-01-10T12:00:00.000Z",
      following: ["user-maya", "user-eli"]
    },
    {
      id: "user-maya",
      name: "Maya Chen",
      handle: "maya",
      headline: "Product designer exploring humane social software.",
      location: "Oakland, CA",
      avatar: "MC",
      accent: "#de496f",
      joinedAt: "2025-10-02T12:00:00.000Z",
      following: ["user-kiran", "user-eli"]
    },
    {
      id: "user-eli",
      name: "Eli Carter",
      handle: "eli",
      headline: "Frontend engineer. Real-time systems, tidy components, better feeds.",
      location: "New York, NY",
      avatar: "EC",
      accent: "#0f9f7b",
      joinedAt: "2025-08-14T12:00:00.000Z",
      following: ["user-kiran"]
    },
    {
      id: "user-rina",
      name: "Rina Patel",
      handle: "rina",
      headline: "Firebase consultant helping teams ship faster without losing the plot.",
      location: "Austin, TX",
      avatar: "RP",
      accent: "#c47a21",
      joinedAt: "2025-11-25T12:00:00.000Z",
      following: ["user-maya"]
    }
  ],
  posts: [
    {
      id: "post-101",
      authorId: "user-maya",
      body: "Prototyped the profile edit flow with AI-assisted component scaffolding, then tightened the spacing by hand. Fast iteration feels best when the last mile still has taste.",
      topic: "Design",
      createdAt: "2026-05-16T14:18:00.000Z",
      likes: ["user-kiran", "user-eli"],
      replies: 5
    },
    {
      id: "post-102",
      authorId: "user-kiran",
      body: "Nexus now has auth, profile pages, and a live feed model. Next pass is Firebase wiring for persistence and presence.",
      topic: "Build Log",
      createdAt: "2026-05-16T13:42:00.000Z",
      likes: ["user-maya"],
      replies: 3
    },
    {
      id: "post-103",
      authorId: "user-eli",
      body: "Small state management rule I keep relearning: keep the mutation local, keep derived feed views memoized, and make empty states say exactly what happened.",
      topic: "React",
      createdAt: "2026-05-16T12:05:00.000Z",
      likes: ["user-kiran", "user-rina"],
      replies: 8
    },
    {
      id: "post-104",
      authorId: "user-rina",
      body: "Realtime feeds are friendlier when optimistic updates are boring. If users can predict what happens after they click, the system feels faster.",
      topic: "Firebase",
      createdAt: "2026-05-15T21:26:00.000Z",
      likes: ["user-eli"],
      replies: 2
    }
  ]
};

function loadNexusData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    return raw ? JSON.parse(raw) : starterData;
  } catch {
    return starterData;
  }
}

function saveNexusData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function App() {
  const [data, setData] = useState(() => loadNexusData());
  const [feedMode, setFeedMode] = useState("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: "", headline: "", location: "" });
  const activeUser = data.profiles.find((profile) => profile.id === data.activeUserId) || data.profiles[0];

  useEffect(() => saveNexusData(data), [data]);
  useEffect(() => {
    setProfileDraft({
      name: activeUser.name,
      headline: activeUser.headline,
      location: activeUser.location
    });
  }, [activeUser]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((current) => ({
        ...current,
        posts: [
          {
            id: crypto.randomUUID(),
            authorId: "user-rina",
            body: "Realtime sync heartbeat: new activity landed in the feed without a page refresh.",
            topic: "Firebase",
            createdAt: new Date().toISOString(),
            likes: [],
            replies: 0
          },
          ...current.posts
        ].slice(0, 12)
      }));
    }, 45000);
    return () => window.clearInterval(timer);
  }, []);

  const profileById = useMemo(() => new Map(data.profiles.map((profile) => [profile.id, profile])), [data.profiles]);
  const feed = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    return data.posts
      .filter((post) => {
        if (feedMode === "following" && !activeUser.following.includes(post.authorId)) return false;
        if (feedMode === "mine" && post.authorId !== activeUser.id) return false;
        const author = profileById.get(post.authorId);
        const haystack = `${post.body} ${post.topic} ${author?.name || ""} ${author?.handle || ""}`.toLowerCase();
        return !cleanQuery || haystack.includes(cleanQuery);
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [activeUser, data.posts, feedMode, profileById, query]);

  const suggestedProfiles = data.profiles.filter((profile) => profile.id !== activeUser.id);
  const followingCount = activeUser.following.length;
  const followerCount = data.profiles.filter((profile) => profile.following.includes(activeUser.id)).length;
  const currentUserPosts = data.posts.filter((post) => post.authorId === activeUser.id).length;

  function signInAs(userId) {
    setData((current) => ({ ...current, activeUserId: userId }));
  }

  function publishPost() {
    const cleanDraft = draft.trim();
    if (!cleanDraft) return;
    setData((current) => ({
      ...current,
      posts: [
        {
          id: crypto.randomUUID(),
          authorId: activeUser.id,
          body: cleanDraft,
          topic,
          createdAt: new Date().toISOString(),
          likes: [],
          replies: 0
        },
        ...current.posts
      ]
    }));
    setDraft("");
    setFeedMode("all");
  }

  function toggleLike(postId) {
    setData((current) => ({
      ...current,
      posts: current.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes.includes(activeUser.id)
                ? post.likes.filter((userId) => userId !== activeUser.id)
                : [...post.likes, activeUser.id]
            }
          : post
      )
    }));
  }

  function toggleFollow(profileId) {
    setData((current) => ({
      ...current,
      profiles: current.profiles.map((profile) =>
        profile.id === activeUser.id
          ? {
              ...profile,
              following: profile.following.includes(profileId)
                ? profile.following.filter((id) => id !== profileId)
                : [...profile.following, profileId]
            }
          : profile
      )
    }));
  }

  function saveProfile() {
    setData((current) => ({
      ...current,
      profiles: current.profiles.map((profile) =>
        profile.id === activeUser.id
          ? {
              ...profile,
              name: profileDraft.name.trim() || profile.name,
              headline: profileDraft.headline.trim() || profile.headline,
              location: profileDraft.location.trim() || profile.location
            }
          : profile
      )
    }));
    setProfileOpen(false);
  }

  function resetDemo() {
    setData(starterData);
    setDraft("");
    setQuery("");
    setFeedMode("all");
  }

  return h(
    "main",
    { className: "app-shell" },
    h(Sidebar, { activeUser, profiles: data.profiles, onSignIn: signInAs, onEdit: () => setProfileOpen(true) }),
    h(
      "section",
      { className: "content" },
      h(
        "header",
        { className: "topbar" },
        h("div", null, h("p", { className: "eyebrow" }, "React + TypeScript + Firebase-ready"), h("h2", null, "Social feed, profiles, and auth flow in one working prototype.")),
        h("label", { className: "search" }, h(Search, { size: 18 }), h("input", { "aria-label": "Search posts", value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search posts, topics, people" }))
      ),
      h(ProfileBand, { activeUser, currentUserPosts, followingCount, followerCount, onEdit: () => setProfileOpen(true) }),
      h(Composer, { activeUser, draft, setDraft, topic, setTopic, onPublish: publishPost }),
      h(
        "section",
        { className: "feed-toolbar", "aria-label": "Feed filters" },
        h(
          "div",
          { className: "segmented", role: "tablist", "aria-label": "Feed views" },
          h(FilterButton, { label: "Everyone", mode: "all", active: feedMode, onClick: setFeedMode }),
          h(FilterButton, { label: "Following", mode: "following", active: feedMode, onClick: setFeedMode }),
          h(FilterButton, { label: "My posts", mode: "mine", active: feedMode, onClick: setFeedMode })
        ),
        h("button", { type: "button", className: "reset", onClick: resetDemo }, "Reset demo")
      ),
      h(
        "section",
        { className: "feed-list", "aria-live": "polite" },
        feed.length
          ? feed.map((post) => h(PostCard, { key: post.id, post, author: profileById.get(post.authorId), liked: post.likes.includes(activeUser.id), onLike: toggleLike }))
          : h("div", { className: "empty-state" }, h(Search, { size: 24 }), h("p", null, "No posts match the current filters."))
      )
    ),
    h(RightRail, { activeUser, profiles: suggestedProfiles, onFollow: toggleFollow }),
    profileOpen ? h(ProfileModal, { profileDraft, setProfileDraft, onClose: () => setProfileOpen(false), onSave: saveProfile }) : null
  );
}

function Sidebar({ activeUser, profiles, onSignIn, onEdit }) {
  return h(
    "aside",
    { className: "sidebar", "aria-label": "Primary" },
    h("div", { className: "brand" }, h("span", { className: "brand-mark" }, h(Radio, { size: 22 })), h("div", null, h("h1", null, "Nexus"), h("p", null, "Realtime social workspace"))),
    h(
      "nav",
      { className: "nav-list", "aria-label": "Main views" },
      h("button", { type: "button", className: "active" }, h(Home, { size: 18 }), "Feed"),
      h("button", { type: "button" }, h(Users, { size: 18 }), "Network"),
      h("button", { type: "button" }, h(Bell, { size: 18 }), "Activity"),
      h("button", { type: "button", onClick: onEdit }, h(Settings, { size: 18 }), "Profile")
    ),
    h(
      "section",
      { className: "auth-panel", "aria-label": "Authentication demo" },
      h("div", null, h(LogIn, { size: 17 }), h("span", null, "Signed in as")),
      h(
        "select",
        { value: activeUser.id, onChange: (event) => onSignIn(event.target.value) },
        profiles.map((profile) => h("option", { key: profile.id, value: profile.id }, profile.name))
      )
    )
  );
}

function ProfileBand({ activeUser, currentUserPosts, followingCount, followerCount, onEdit }) {
  return h(
    "section",
    { className: "profile-band", "aria-label": "Your profile" },
    h("div", { className: "avatar", style: { background: activeUser.accent } }, activeUser.avatar),
    h("div", { className: "profile-copy" }, h("span", null, `@${activeUser.handle}`), h("h3", null, activeUser.name), h("p", null, activeUser.headline)),
    h("div", { className: "profile-stats", "aria-label": "Profile stats" }, h(Stat, { value: String(currentUserPosts), label: "Posts" }), h(Stat, { value: String(followingCount), label: "Following" }), h(Stat, { value: String(followerCount), label: "Followers" })),
    h("button", { type: "button", className: "icon-text", onClick: onEdit }, h(Edit3, { size: 17 }), "Edit")
  );
}

function Composer({ activeUser, draft, setDraft, topic, setTopic, onPublish }) {
  return h(
    "section",
    { className: "composer", "aria-label": "Create post" },
    h("div", { className: "composer-head" }, h("div", { className: "avatar small", style: { background: activeUser.accent } }, activeUser.avatar), h("select", { value: topic, onChange: (event) => setTopic(event.target.value), "aria-label": "Post topic" }, topics.map((topicName) => h("option", { key: topicName }, topicName)))),
    h("textarea", { value: draft, maxLength: 280, onChange: (event) => setDraft(event.target.value), placeholder: "Share a build note, question, or launch update..." }),
    h("div", { className: "composer-actions" }, h("span", null, `${280 - draft.length} characters`), h("button", { type: "button", onClick: onPublish, disabled: !draft.trim() }, h(Send, { size: 17 }), "Post"))
  );
}

function RightRail({ activeUser, profiles, onFollow }) {
  return h(
    "aside",
    { className: "right-rail", "aria-label": "Network suggestions" },
    h(
      "section",
      { className: "panel" },
      h("div", { className: "panel-title" }, h(Users, { size: 18 }), h("h3", null, "People")),
      h(
        "div",
        { className: "people-list" },
        profiles.map((profile) => {
          const following = activeUser.following.includes(profile.id);
          return h(
            "article",
            { key: profile.id, className: "person" },
            h("div", { className: "avatar mini", style: { background: profile.accent } }, profile.avatar),
            h("div", null, h("strong", null, profile.name), h("span", null, `@${profile.handle}`)),
            h("button", { type: "button", onClick: () => onFollow(profile.id), "aria-label": `${following ? "Unfollow" : "Follow"} ${profile.name}` }, following ? h(Check, { size: 17 }) : h(UserPlus, { size: 17 }))
          );
        })
      )
    ),
    h("section", { className: "panel stack" }, h("div", { className: "panel-title" }, h(Plus, { size: 18 }), h("h3", null, "Firebase model")), h("p", null, "Auth state, profile documents, and feed posts are separated so the demo can swap local storage for Firestore collections cleanly."))
  );
}

function ProfileModal({ profileDraft, setProfileDraft, onClose, onSave }) {
  return h(
    "div",
    { className: "modal-backdrop", role: "presentation" },
    h(
      "section",
      { className: "modal", role: "dialog", "aria-modal": "true", "aria-label": "Edit profile" },
      h("div", { className: "modal-head" }, h("h3", null, "Edit profile"), h("button", { type: "button", onClick: onClose, "aria-label": "Close profile editor" }, "x")),
      h("label", null, "Name", h("input", { value: profileDraft.name, onChange: (event) => setProfileDraft((current) => ({ ...current, name: event.target.value })) })),
      h("label", null, "Headline", h("textarea", { value: profileDraft.headline, onChange: (event) => setProfileDraft((current) => ({ ...current, headline: event.target.value })) })),
      h("label", null, "Location", h("input", { value: profileDraft.location, onChange: (event) => setProfileDraft((current) => ({ ...current, location: event.target.value })) })),
      h("button", { type: "button", className: "save-profile", onClick: onSave }, "Save profile")
    )
  );
}

function FilterButton({ label, mode, active, onClick }) {
  return h("button", { type: "button", className: active === mode ? "active" : "", onClick: () => onClick(mode), role: "tab", "aria-selected": active === mode }, label);
}

function Stat({ value, label }) {
  return h("div", null, h("strong", null, value), h("span", null, label));
}

function PostCard({ post, author, liked, onLike }) {
  return h(
    "article",
    { className: "post-card" },
    h("div", { className: "avatar mini", style: { background: author?.accent || "#5b6472" } }, author?.avatar || "NX"),
    h(
      "div",
      { className: "post-main" },
      h("div", { className: "post-meta" }, h("strong", null, author?.name || "Nexus User"), h("span", null, `@${author?.handle || "user"} · ${relativeTime(post.createdAt)}`), h("em", null, post.topic)),
      h("p", null, post.body),
      h("div", { className: "post-actions" }, h("button", { type: "button", className: liked ? "liked" : "", onClick: () => onLike(post.id) }, h(Heart, { size: 17, fill: liked ? "currentColor" : "none" }), post.likes.length), h("button", { type: "button" }, h(MessageCircle, { size: 17 }), post.replies))
    )
  );
}

function relativeTime(date) {
  const delta = Date.now() - Date.parse(date);
  const minutes = Math.max(1, Math.round(delta / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

createRoot(document.getElementById("root")).render(h(StrictMode, null, h(App)));

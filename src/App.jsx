import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/home';
import PostsPage from './pages/posts';
import PostDetailPage from './pages/post-detail';
import DashboardPage from './pages/dashboard';
import RequestsPage from './pages/requests';
import NotificationsPage from './pages/notifications';
import TeamsPage from './pages/teams';
import ProfilesPage from './pages/profiles';
import ProfilePage from './pages/profile';
import EditProfilePage from './pages/profile-edit';
import CreatePostPage from './pages/create-post';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import ForgotPasswordPage from './pages/forgot-password';
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}
export default function App() {
    return (<>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/posts" element={<PostsPage />}/>
        <Route path="/posts/:id" element={<PostDetailPage />}/>
        <Route path="/dashboard" element={<DashboardPage />}/>
        <Route path="/requests" element={<RequestsPage />}/>
        <Route path="/notifications" element={<NotificationsPage />}/>
        <Route path="/teams" element={<TeamsPage />}/>
        <Route path="/profiles" element={<ProfilesPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/profile/edit" element={<EditProfilePage />}/>
        <Route path="/create-post" element={<CreatePostPage />}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/signup" element={<SignupPage />}/>
        <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </>);
}

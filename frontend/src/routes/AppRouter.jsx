import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Courses from "../pages/Courses";
import Faculty from "../pages/Faculty";
import Modules from "../pages/Modules";
import Classrooms from "../pages/Classrooms";
import TimetableGenerator from "../pages/Timetable";
import ViewTimetable from "../pages/ViewTimetable ";
import Notifications from "../pages/Notifications";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import UserModulesView from "../pages/UserModulesView";
import Footer from "../components/Footer";
import ExamSchedules from "../pages/ExamSchedules";
import ExamScheduleForm from "../pages/ExamScheduleForm";
import UserExamSchedules from "../pages/UserExamSchedules";
import UserTimetableView from "../pages/UserTimetableView";

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/user-modules" element={<UserModulesView />} />
          <Route path="/classrooms" element={<Classrooms />} />
          <Route path="/schedules" element={<TimetableGenerator />} />
          <Route path="/timetables" element={<ViewTimetable />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/exams" element={<ExamSchedules />} />
          <Route path="/exams/new" element={<ExamScheduleForm />} />
          <Route path="/exams/edit/:id" element={<ExamScheduleForm />} />

          <Route path="/user-exams" element={<UserExamSchedules />} />

          <Route path="/user-timetable" element={<UserTimetableView />} />

        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

export default AppRouter;

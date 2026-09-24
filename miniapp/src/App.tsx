import { useNav } from "@/nav";
import { HomeScreen } from "@/screens/Home";
import { FindScreen } from "@/screens/Find";
import { CreateScreen } from "@/screens/Create";
import { MyMeetingsScreen } from "@/screens/MyMeetings";
import { ProfileScreen } from "@/screens/Profile";
import { MeetingDetailsScreen } from "@/screens/MeetingDetails";

export default function App() {
  const { screen } = useNav();

  switch (screen.name) {
    case "home":
      return <HomeScreen />;
    case "find":
      return <FindScreen />;
    case "create":
      return <CreateScreen />;
    case "my":
      return <MyMeetingsScreen />;
    case "profile":
      return <ProfileScreen />;
    case "meeting":
      return <MeetingDetailsScreen key={screen.id} id={screen.id} />;
  }
}

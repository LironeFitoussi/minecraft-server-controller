import Layout from "./pages/Layout";
import HomePage, {HomePageLoader} from "./pages/HomePage";
import MinecraftDashboardPage from "./pages/MinecraftDashboardPage";

export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomePage,
        loader: HomePageLoader,
        name: "Home",
      },
      {
        path: "/minecraft",
        Component: MinecraftDashboardPage,
        name: "Minecraft Server",
      },
    ],
  },
];
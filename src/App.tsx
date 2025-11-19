import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { VirtualServerList } from "./pages/VirtualServerList";

const router = createBrowserRouter([
  {
    path: "/",
    element: <VirtualServerList />,
  },
  // {
  //   path: "/login",
  //   element: <Login />,
  // },
]);
function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

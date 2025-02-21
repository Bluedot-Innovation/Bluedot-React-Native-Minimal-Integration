import React from 'react';
import { NativeRouter, Route, Routes } from "react-router-native";
import { StatusBar } from 'expo-status-bar';
import {
  requestAllPermissions,
} from "./helpers/permissionsHandler";

import Initilize from "./components/InitializeSdk";
import Main from "./components/Main";
import GeoTriggering from "./components/GeoTriggering";
import Tempo from "./components/Tempo";
import BrainAi from './components/BrainAiScreen';


export default function App() {

  React.useEffect(() => {
    requestAllPermissions();
  }, []);

  return (
    <NativeRouter>
      <StatusBar style="dark" />
      <Routes>
        <Route exact path="/" element={<Initilize />} />
        <Route exact path="/main" element={<Main />} />
        <Route exact path="/geotriggering" element={<GeoTriggering />} />
        <Route exact path="/tempo" element={<Tempo />} />
        <Route exact path="/brainai" element={<BrainAi />} />
      </Routes>
    </NativeRouter>
  );
}

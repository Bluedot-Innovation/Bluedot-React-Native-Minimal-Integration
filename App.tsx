/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

//import { NewAppScreen } from '@react-native/new-app-screen';
import {  StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import {
  requestAllPermissions,
} from "./helpers/permissionsHandler";
import { NativeRouter, Route, Routes } from "react-router-native";


import Initilize from "./components/InitializeSdk";
import Main from "./components/Main";
import GeoTriggering from "./components/GeoTriggering";
import Tempo from "./components/Tempo";


function App() {
  const isDarkMode = useColorScheme() === 'dark';

    React.useEffect(() => {
    requestAllPermissions();
  }, []);

  return (
    <NativeRouter>
      <Routes>
        <Route exact path="/" element={<Initilize />} />
        <Route exact path="/main" element={<Main />} />
        <Route exact path="/geotriggering" element={<GeoTriggering />} />
        <Route exact path="/tempo" element={<Tempo />} />
      </Routes>
    </NativeRouter>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
